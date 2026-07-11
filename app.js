// =====================================================================
// TopoChaouia — Carte des Titres (visualisation terrain hors-bureau)
// Architecture multi-zones : chaque "cadgis" (zone cadastrale) vit dans
// son propre dossier regions/<id>/ et est déclaré dans regions.json.
// Voir README.txt pour la marche à suivre pour ajouter une nouvelle zone.
// =====================================================================

const TITRES_MIN_ZOOM = 13;
const TILE_BUFFER = 0.01;

proj4.defs('EPSG:26191',
  '+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 ' +
  '+x_0=500000 +y_0=300000 +ellps=clrk80ign +towgs84=31,146,47,0,0,0,0 +units=m +no_defs');

let map, satLayer, osmLayer;
let titresLayerGroup, bornesLayerGroup, measureLayer, drawLayer;

// regions[id] = {
//   id, name, folder, color,
//   tilesIndex, bornesTilesIndex,           // index metadata (loaded at startup)
//   searchIndex, searchIndexLoading,        // loaded lazily on first search
//   loadedTitreTiles: Set, loadedBornesTiles: Set,
//   titresGroup: L.layerGroup, bornesGroup: L.layerGroup,
//   visible: bool
// }
let regions = {};
let regionOrder = [];

let gpsWatchId = null, gpsMarker = null, gpsAccuracyCircle = null, lastGpsLatLng = null;
let highlightLayer = null;

let measureActive = false, measurePoints = [];
let drawAreaActive = false, drawPoints = [];
let targetLatLng = null, targetMarker = null, targetLineLayer = null;

// ---------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------
init();

async function init() {
  map = L.map('map', { zoomControl: false, minZoom: 5, maxZoom: 20 });
  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  satLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Imagery © Esri', maxZoom: 20, maxNativeZoom: 19 }
  );
  osmLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '© OpenStreetMap', maxZoom: 19 }
  );
  satLayer.addTo(map);

  titresLayerGroup = L.layerGroup().addTo(map);
  bornesLayerGroup = L.layerGroup().addTo(map);
  measureLayer = L.layerGroup().addTo(map);
  drawLayer = L.layerGroup().addTo(map);

  map.setView([32.9, -7.6], 12);

  wireUI();
  await loadRegions();

  map.on('moveend', onMapMoved);
  map.on('move', updateCrosshairReadout);
  onMapMoved();
  updateCrosshairReadout();
}

// ---------------------------------------------------------------------
// Chargement des zones (cadgis) déclarées dans regions.json
// ---------------------------------------------------------------------
async function loadRegions() {
  let manifest;
  try {
    const res = await fetch('regions.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    manifest = await res.json();
  } catch (e) {
    console.error('Erreur chargement regions.json', e);
    showDataError();
    return;
  }

  const results = await Promise.all(manifest.regions.map(loadOneRegion));
  results.forEach(r => { if (r) { regions[r.id] = r; regionOrder.push(r.id); } });

  if (regionOrder.length === 0) { showDataError(); return; }

  buildRegionPanel();
  fitToActiveRegionsBounds(true);
}

async function loadOneRegion(meta) {
  const region = {
    id: meta.id, name: meta.name, folder: meta.folder, color: meta.color || '#ffb020',
    tilesIndex: null, bornesTilesIndex: null,
    searchIndex: null, searchIndexLoading: null,
    loadedTitreTiles: new Set(), loadedBornesTiles: new Set(),
    titresGroup: L.layerGroup(), bornesGroup: L.layerGroup(),
    visible: true
  };
  try {
    const [tRes, bRes] = await Promise.all([
      fetch(`${meta.folder}/tiles_index.json`),
      fetch(`${meta.folder}/bornes_tiles_index.json`)
    ]);
    if (!tRes.ok) throw new Error('tiles_index HTTP ' + tRes.status);
    region.tilesIndex = await tRes.json();
    region.bornesTilesIndex = bRes.ok ? await bRes.json() : { tiles: [] };
  } catch (e) {
    console.error('Erreur chargement de la zone', meta.id, e);
    return null;
  }
  titresLayerGroup.addLayer(region.titresGroup);
  bornesLayerGroup.addLayer(region.bornesGroup);
  return region;
}

function combinedBbox(kind) {
  let minlon = Infinity, minlat = Infinity, maxlon = -Infinity, maxlat = -Infinity;
  regionOrder.forEach(id => {
    const r = regions[id];
    if (!r.visible || !r.tilesIndex) return;
    const b = r.tilesIndex[kind];
    if (!b) return;
    minlon = Math.min(minlon, b.minlon); maxlon = Math.max(maxlon, b.maxlon);
    minlat = Math.min(minlat, b.minlat); maxlat = Math.max(maxlat, b.maxlat);
  });
  return isFinite(minlon) ? { minlon, minlat, maxlon, maxlat } : null;
}

function fitToActiveRegionsBounds(useCore) {
  const b = combinedBbox(useCore ? 'core_bbox' : 'full_bbox');
  if (b) map.fitBounds([[b.minlat, b.minlon], [b.maxlat, b.maxlon]], { padding: [20, 20] });
}

// ---------------------------------------------------------------------
// Chargement des tuiles selon la vue courante, pour chaque zone active
// ---------------------------------------------------------------------
function onMapMoved() {
  updateStatusInfo();
  const z = map.getZoom();
  const banner = document.getElementById('zoomBanner');

  if (z < TITRES_MIN_ZOOM) {
    banner.textContent = `Zoomez pour voir les titres et bornes (zoom ${z}/${TITRES_MIN_ZOOM})`;
    banner.classList.remove('hidden');
    return;
  }
  banner.classList.add('hidden');

  const b = map.getBounds();
  const minlon = b.getWest() - TILE_BUFFER, maxlon = b.getEast() + TILE_BUFFER;
  const minlat = b.getSouth() - TILE_BUFFER, maxlat = b.getNorth() + TILE_BUFFER;
  const intersects = t => !(t.maxlon < minlon || t.minlon > maxlon || t.maxlat < minlat || t.minlat > maxlat);

  const showBornes = document.getElementById('toggleBornes').checked;

  regionOrder.forEach(id => {
    const r = regions[id];
    if (!r.visible) return;

    const toLoadTitres = r.tilesIndex.tiles.filter(t => t.count > 0 && !r.loadedTitreTiles.has(t.gx + '_' + t.gy) && intersects(t));
    if (toLoadTitres.length) {
      showToast(true);
      Promise.all(toLoadTitres.map(t => loadTitreTile(r, t))).finally(() => showToast(false));
    }

    if (showBornes && r.bornesTilesIndex) {
      const toLoadBornes = r.bornesTilesIndex.tiles.filter(t => t.count > 0 && !r.loadedBornesTiles.has(t.gx + '_' + t.gy) && intersects(t));
      toLoadBornes.forEach(t => loadBornesTile(r, t));
    }
  });
}

async function loadTitreTile(region, tileMeta) {
  const key = tileMeta.gx + '_' + tileMeta.gy;
  if (region.loadedTitreTiles.has(key)) return;
  region.loadedTitreTiles.add(key);
  try {
    const res = await fetch(`${region.folder}/${tileMeta.file}`);
    const gj = await res.json();
    L.geoJSON(gj, {
      style: () => styleTitre(region),
      onEachFeature: (feature, lyr) => lyr.on('click', () => showTitreInfo(feature.properties, lyr, region))
    }).addTo(region.titresGroup);
  } catch (e) {
    region.loadedTitreTiles.delete(key);
    console.error('Erreur tuile titre', region.id, tileMeta.file, e);
  }
}

async function loadBornesTile(region, tileMeta) {
  const key = tileMeta.gx + '_' + tileMeta.gy;
  if (region.loadedBornesTiles.has(key)) return;
  region.loadedBornesTiles.add(key);
  try {
    const res = await fetch(`${region.folder}/${tileMeta.file}`);
    const gj = await res.json();
    L.geoJSON(gj, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: 4, color: '#0b3a36', weight: 1, fillColor: '#35e0d0', fillOpacity: 0.95
      }),
      onEachFeature: (feature, lyr) => lyr.on('click', () => showBorneInfo(feature.properties, feature.geometry.coordinates))
    }).addTo(region.bornesGroup);
  } catch (e) {
    region.loadedBornesTiles.delete(key);
    console.error('Erreur tuile borne', region.id, tileMeta.file, e);
  }
}

function styleTitre(region) {
  return { color: region.color, weight: 2, opacity: 0.9, fillColor: region.color, fillOpacity: 0.12 };
}

// ---------------------------------------------------------------------
// Panneau latéral : liste dynamique des zones (cadgis)
// ---------------------------------------------------------------------
function buildRegionPanel() {
  const container = document.getElementById('regionList');
  container.innerHTML = '';
  regionOrder.forEach(id => {
    const r = regions[id];
    const row = document.createElement('label');
    row.className = 'row';
    row.innerHTML = `<input type="checkbox" checked data-region="${id}"> <span class="region-dot" style="background:${r.color}"></span> ${escapeHtml(r.name)}`;
    row.querySelector('input').addEventListener('change', e => toggleRegion(id, e.target.checked));
    container.appendChild(row);
  });
}

function toggleRegion(id, visible) {
  const r = regions[id];
  r.visible = visible;
  if (visible) {
    titresLayerGroup.addLayer(r.titresGroup);
    bornesLayerGroup.addLayer(r.bornesGroup);
    onMapMoved();
  } else {
    titresLayerGroup.removeLayer(r.titresGroup);
    bornesLayerGroup.removeLayer(r.bornesGroup);
  }
}

// ---------------------------------------------------------------------
// Info sheet (parcelle / borne)
// ---------------------------------------------------------------------
function showTitreInfo(props, layer, region) {
  const rows = [
    ['N° Titre', props.Num], ['Indice', props.indice], ['Complément', props.complement],
    ['Nature', props.Nature], ['Type', props.Type],
    ['Surface calculée (m²)', props.Surf_Calc], ['Surface adoptée (m²)', props.Surf_Adop],
    ['Feuille (Mappe)', props.Mappe], ['Stade', props.stade], ['Désignation', props.TIT],
    ['Zone', region ? region.name : ''],
  ].filter(r => r[1] !== undefined && r[1] !== null && r[1] !== '');

  document.getElementById('infoContent').innerHTML =
    `<h3>Titre N° ${props.Num ?? ''}</h3>` +
    rows.map(r => `<div class="info-row"><span>${r[0]}</span><span>${escapeHtml(String(r[1]))}</span></div>`).join('');
  openInfoSheet();

  if (layer) {
    if (highlightLayer) map.removeLayer(highlightLayer);
    highlightLayer = L.geoJSON(layer.feature, { style: { color: '#ffffff', weight: 4, fillOpacity: 0.05 } }).addTo(map);
  }
}

function showBorneInfo(props, coords) {
  const rows = [
    ['N° Borne', props.Num], ['Titre associé', props.Num_Titre],
    ['Nature titre', props.Nature_Titre], ['Indice', props.indice_Titre],
  ].filter(r => r[1] !== undefined && r[1] !== null && r[1] !== '');

  let coordRows = '';
  if (coords) {
    try {
      const [x, y] = proj4('EPSG:4326', 'EPSG:26191', coords);
      coordRows =
        `<div class="info-row"><span>X (Lambert)</span><span>${x.toFixed(2)}</span></div>` +
        `<div class="info-row"><span>Y (Lambert)</span><span>${y.toFixed(2)}</span></div>`;
    } catch (e) { /* ignore */ }
  }

  document.getElementById('infoContent').innerHTML =
    `<h3>Borne ${props.Num ?? ''}</h3>` +
    rows.map(r => `<div class="info-row"><span>${r[0]}</span><span>${escapeHtml(String(r[1]))}</span></div>`).join('') +
    coordRows;
  openInfoSheet();
}

function openInfoSheet() { document.getElementById('infoSheet').classList.remove('hidden'); }
function closeInfoSheet() {
  document.getElementById('infoSheet').classList.add('hidden');
  if (highlightLayer) { map.removeLayer(highlightLayer); highlightLayer = null; }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------------------------------------------------------------------
// Recherche par N° de titre (à travers toutes les zones actives)
// ---------------------------------------------------------------------
async function ensureRegionSearchIndex(region) {
  if (region.searchIndex) return region.searchIndex;
  if (region.searchIndexLoading) return region.searchIndexLoading;
  region.searchIndexLoading = fetch(`${region.folder}/search_index.json`)
    .then(r => r.json())
    .then(data => { region.searchIndex = data; return data; })
    .catch(e => { console.error('Erreur index recherche', region.id, e); return []; });
  return region.searchIndexLoading;
}

async function runSearch(query) {
  query = query.trim();
  const resultsEl = document.getElementById('searchResults');
  if (!query) { resultsEl.classList.add('hidden'); resultsEl.innerHTML = ''; return; }

  showToast(true, 'Recherche…');
  const activeRegions = regionOrder.map(id => regions[id]).filter(r => r.visible);
  const indices = await Promise.all(activeRegions.map(ensureRegionSearchIndex));
  showToast(false);

  const q = query.toLowerCase();
  let matches = [];
  activeRegions.forEach((r, i) => {
    const found = indices[i].filter(e =>
      String(e.num).includes(q) || (e.mappe || '').toLowerCase().includes(q) || (e.tit || '').toLowerCase().includes(q)
    ).slice(0, 30).map(e => ({ ...e, regionId: r.id }));
    matches = matches.concat(found);
  });
  matches = matches.slice(0, 30);

  resultsEl.innerHTML = matches.length === 0
    ? '<div class="res-empty">Aucun titre trouvé</div>'
    : matches.map((m, i) =>
        `<div class="res-item" data-i="${i}"><b>Titre ${escapeHtml(String(m.num))}</b>` +
        `<div>${escapeHtml(regions[m.regionId].name)} · ${escapeHtml(m.mappe || '—')} ${m.indice ? '· indice ' + escapeHtml(m.indice) : ''}</div></div>`
      ).join('');
  resultsEl.querySelectorAll('.res-item').forEach(el => {
    el.addEventListener('click', () => goToSearchResult(matches[parseInt(el.dataset.i)]));
  });
  resultsEl.classList.remove('hidden');
}

async function goToSearchResult(m) {
  document.getElementById('searchResults').classList.add('hidden');
  document.getElementById('searchInput').blur();
  map.setView([m.lat, m.lon], 18);
  const region = regions[m.regionId];
  const tileMeta = region.tilesIndex.tiles.find(t => t.file === m.file);
  if (tileMeta) await loadTitreTile(region, tileMeta);
  region.titresGroup.eachLayer(sub => {
    if (sub.eachLayer) sub.eachLayer(lyr => {
      if (lyr.feature && String(lyr.feature.properties.Num) === String(m.num) &&
          (lyr.feature.properties.Mappe || '') === (m.mappe || '')) {
        showTitreInfo(lyr.feature.properties, lyr, region);
      }
    });
  });
}

// ---------------------------------------------------------------------
// Géolocalisation
// ---------------------------------------------------------------------
function toggleGps() {
  const btn = document.getElementById('btnLocate');
  if (gpsWatchId !== null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
    btn.classList.remove('active');
    return;
  }
  if (!navigator.geolocation) { alert('La géolocalisation n\u2019est pas disponible sur cet appareil/navigateur.'); return; }
  btn.classList.add('active');
  let first = true;
  gpsWatchId = navigator.geolocation.watchPosition(pos => {
    const { latitude, longitude, accuracy } = pos.coords;
    updateGpsMarker(latitude, longitude, accuracy);
    if (first) { map.setView([latitude, longitude], 18); first = false; }
  }, err => {
    console.error(err);
    alert('Position indisponible : ' + err.message);
    btn.classList.remove('active');
    gpsWatchId = null;
  }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
}

function updateGpsMarker(lat, lon, accuracy) {
  const latlng = [lat, lon];
  lastGpsLatLng = L.latLng(lat, lon);
  if (!gpsMarker) {
    gpsMarker = L.circleMarker(latlng, { radius: 8, color: '#ffffff', weight: 2, fillColor: '#4c8dff', fillOpacity: 1 }).addTo(map);
    gpsAccuracyCircle = L.circle(latlng, { radius: accuracy, color: '#4c8dff', weight: 1, fillOpacity: 0.08 }).addTo(map);
  } else {
    gpsMarker.setLatLng(latlng);
    gpsAccuracyCircle.setLatLng(latlng);
    gpsAccuracyCircle.setRadius(accuracy);
  }
  updateTargetLine();
}

// ---------------------------------------------------------------------
// Réticule central + coordonnées Lambert Nord Maroc en direct
// ---------------------------------------------------------------------
function updateCrosshairReadout() {
  if (!map) return;
  const c = map.getCenter();
  const el = document.getElementById('coordReadout');
  if (!el || el.classList.contains('hidden')) return;
  try {
    const [x, y] = proj4('EPSG:4326', 'EPSG:26191', [c.lng, c.lat]);
    el.querySelector('.coord-x').textContent = 'X ' + x.toFixed(2);
    el.querySelector('.coord-y').textContent = 'Y ' + y.toFixed(2);
  } catch (e) { /* ignore */ }
}

function lockTarget() {
  const c = map.getCenter();
  targetLatLng = L.latLng(c.lat, c.lng);
  if (!targetMarker) {
    targetMarker = L.marker(targetLatLng, { icon: L.divIcon({ className: 'target-icon', html: '🎯', iconSize: [26, 26] }) }).addTo(map);
  } else {
    targetMarker.setLatLng(targetLatLng);
  }
  document.getElementById('btnClearTarget').classList.remove('hidden');
  updateTargetLine();
}

function clearTarget() {
  targetLatLng = null;
  if (targetMarker) { map.removeLayer(targetMarker); targetMarker = null; }
  if (targetLineLayer) { map.removeLayer(targetLineLayer); targetLineLayer = null; }
  document.getElementById('btnClearTarget').classList.add('hidden');
  document.getElementById('targetInfo').classList.add('hidden');
}

function updateTargetLine() {
  if (!targetLatLng) return;
  const infoEl = document.getElementById('targetInfo');
  if (!lastGpsLatLng) {
    infoEl.innerHTML = 'Point cible fixé. Activez le GPS 📍 pour voir la distance et le gisement.';
    infoEl.classList.remove('hidden');
    return;
  }
  if (targetLineLayer) map.removeLayer(targetLineLayer);
  targetLineLayer = L.polyline([lastGpsLatLng, targetLatLng], { color: '#ff5a5a', weight: 3, dashArray: '6,6' }).addTo(map);

  const [x1, y1] = proj4('EPSG:4326', 'EPSG:26191', [lastGpsLatLng.lng, lastGpsLatLng.lat]);
  const [x2, y2] = proj4('EPSG:4326', 'EPSG:26191', [targetLatLng.lng, targetLatLng.lat]);
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  let gisementRad = Math.atan2(dx, dy);
  if (gisementRad < 0) gisementRad += 2 * Math.PI;
  const gisementGrades = gisementRad * (200 / Math.PI);

  infoEl.innerHTML =
    `<div class="ti-row"><span>🎯 Distance vers la cible</span><b>${dist.toFixed(2)} m</b></div>` +
    `<div class="ti-row"><span>Gisement</span><b>${gisementGrades.toFixed(2)} gr</b></div>`;
  infoEl.classList.remove('hidden');
}

// ---------------------------------------------------------------------
// Mesure de distance
// ---------------------------------------------------------------------
function toggleMeasure() {
  measureActive = !measureActive;
  document.getElementById('btnMeasure').classList.toggle('active', measureActive);
  if (!measureActive) {
    measurePoints = [];
    measureLayer.clearLayers();
    document.getElementById('measureInfo').classList.add('hidden');
  } else {
    closeInfoSheet();
  }
}

function handleMapClickForMeasure(latlng) {
  measurePoints.push(latlng);
  measureLayer.clearLayers();
  measurePoints.forEach(p => L.circleMarker(p, { radius: 5, color: '#fff', weight: 2, fillColor: '#ffe14d', fillOpacity: 1 }).addTo(measureLayer));
  if (measurePoints.length > 1) L.polyline(measurePoints, { color: '#ffe14d', weight: 3 }).addTo(measureLayer);

  let total = 0;
  for (let i = 1; i < measurePoints.length; i++) total += measurePoints[i - 1].distanceTo(measurePoints[i]);

  const infoEl = document.getElementById('measureInfo');
  infoEl.innerHTML = measurePoints.length >= 2
    ? `<b>${total.toFixed(2)} m</b> — ${measurePoints.length} point(s) · touchez 📏 pour effacer`
    : 'Touchez un 2ᵉ point sur la carte pour mesurer la distance';
  infoEl.classList.remove('hidden');
}

// ---------------------------------------------------------------------
// Dessin de zone / calcul de surface
// ---------------------------------------------------------------------
function toggleDrawArea() {
  drawAreaActive = !drawAreaActive;
  document.getElementById('btnDrawArea').classList.toggle('active', drawAreaActive);
  if (measureActive) toggleMeasure();
  if (!drawAreaActive) {
    drawPoints = [];
    drawLayer.clearLayers();
    document.getElementById('areaInfo').classList.add('hidden');
  } else {
    closeInfoSheet();
  }
}

function handleMapClickForDraw(latlng) {
  drawPoints.push(latlng);
  drawLayer.clearLayers();
  drawPoints.forEach(p => L.circleMarker(p, { radius: 5, color: '#fff', weight: 2, fillColor: '#4dff8a', fillOpacity: 1 }).addTo(drawLayer));

  const infoEl = document.getElementById('areaInfo');
  if (drawPoints.length < 3) {
    if (drawPoints.length === 2) L.polyline(drawPoints, { color: '#4dff8a', weight: 3 }).addTo(drawLayer);
    infoEl.innerHTML = 'Touchez au moins un 3ᵉ point pour calculer une surface';
    infoEl.classList.remove('hidden');
    return;
  }

  L.polygon(drawPoints, { color: '#4dff8a', weight: 3, fillColor: '#4dff8a', fillOpacity: 0.15 }).addTo(drawLayer);

  const proj = drawPoints.map(p => proj4('EPSG:4326', 'EPSG:26191', [p.lng, p.lat]));
  let area = 0;
  for (let i = 0; i < proj.length; i++) {
    const [x1, y1] = proj[i];
    const [x2, y2] = proj[(i + 1) % proj.length];
    area += x1 * y2 - x2 * y1;
  }
  area = Math.abs(area) / 2;

  let perim = 0;
  for (let i = 0; i < proj.length; i++) {
    const [x1, y1] = proj[i];
    const [x2, y2] = proj[(i + 1) % proj.length];
    perim += Math.hypot(x2 - x1, y2 - y1);
  }

  infoEl.innerHTML =
    `<b>${area.toFixed(2)} m²</b> (${(area / 10000).toFixed(4)} ha) — périmètre ${perim.toFixed(2)} m · ` +
    `${drawPoints.length} sommets · touchez 📐 pour effacer`;
  infoEl.classList.remove('hidden');
}

// ---------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------
function wireUI() {
  document.getElementById('btnMenu').addEventListener('click', () => document.getElementById('panel').classList.toggle('hidden'));
  document.getElementById('btnClosePanel').addEventListener('click', () => document.getElementById('panel').classList.add('hidden'));

  document.getElementById('toggleTitres').addEventListener('change', e => {
    if (e.target.checked) map.addLayer(titresLayerGroup); else map.removeLayer(titresLayerGroup);
  });
  document.getElementById('toggleBornes').addEventListener('change', e => {
    if (e.target.checked) { map.addLayer(bornesLayerGroup); onMapMoved(); } else map.removeLayer(bornesLayerGroup);
  });
  document.getElementById('toggleCrosshair').addEventListener('change', e => {
    document.getElementById('crosshairWrap').classList.toggle('hidden', !e.target.checked);
    if (e.target.checked) updateCrosshairReadout();
  });

  document.querySelectorAll('input[name="basemap"]').forEach(r => {
    r.addEventListener('change', e => {
      if (e.target.value === 'sat') { map.removeLayer(osmLayer); satLayer.addTo(map); }
      else { map.removeLayer(satLayer); osmLayer.addTo(map); }
    });
  });

  document.getElementById('btnSearch').addEventListener('click', () => runSearch(document.getElementById('searchInput').value));
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(e.target.value); });
  document.getElementById('searchInput').addEventListener('input', e => {
    if (e.target.value.trim() === '') document.getElementById('searchResults').classList.add('hidden');
  });

  document.getElementById('btnLocate').addEventListener('click', toggleGps);
  document.getElementById('btnOverview').addEventListener('click', () => fitToActiveRegionsBounds(false));
  document.getElementById('btnMeasure').addEventListener('click', toggleMeasure);
  document.getElementById('btnDrawArea').addEventListener('click', toggleDrawArea);
  document.getElementById('btnTarget').addEventListener('click', lockTarget);
  document.getElementById('btnClearTarget').addEventListener('click', clearTarget);
  document.getElementById('btnCloseInfo').addEventListener('click', closeInfoSheet);
  document.getElementById('infoSheet').querySelector('.sheet-handle').addEventListener('click', closeInfoSheet);

  map.on('click', e => {
    if (measureActive) handleMapClickForMeasure(e.latlng);
    if (drawAreaActive) handleMapClickForDraw(e.latlng);
  });
}

function showToast(show, text) {
  const el = document.getElementById('loadingToast');
  el.textContent = text || 'Chargement des parcelles…';
  el.classList.toggle('hidden', !show);
}

function showDataError() {
  const el = document.getElementById('dataError');
  const isFileProtocol = location.protocol === 'file:';
  el.innerHTML = isFileProtocol
    ? '⚠️ Les données (regions.json…) ne se chargent pas. Vous avez probablement ouvert ce fichier en double-cliquant dessus. Ouvrez ce dossier avec l\u2019extension "Live Server" dans VS Code, ou déposez-le sur Vercel/Netlify/GitHub Pages.'
    : '⚠️ Impossible de charger regions.json ou une zone déclarée dedans. Vérifiez que le dossier regions/ est bien présent au même endroit que index.html.';
  el.classList.remove('hidden');
}

function updateStatusInfo() {
  const el = document.getElementById('statusInfo');
  if (!el) return;
  const z = map.getZoom();
  if (z < TITRES_MIN_ZOOM) {
    el.textContent = `Zoom ${z} — zoomez (≥ ${TITRES_MIN_ZOOM}) pour afficher les titres et bornes.`;
    return;
  }
  let tCount = 0, bCount = 0;
  regionOrder.forEach(id => { tCount += regions[id].loadedTitreTiles.size; bCount += regions[id].loadedBornesTiles.size; });
  el.textContent = `Zoom ${z} — ${tCount} tuile(s) de titres, ${bCount} tuile(s) de bornes chargées (${regionOrder.length} zone(s)).`;
}
