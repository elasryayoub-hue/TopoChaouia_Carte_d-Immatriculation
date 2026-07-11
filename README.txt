TopoChaouia — Carte des Titres (application terrain)
======================================================

CE QUE FAIT L'APPLICATION
--------------------------
- Affiche vos parcelles (titres fonciers) en polygones sur un fond de
  carte SATELLITE (Esri World Imagery), directement dans le navigateur.
- Affiche aussi les bornes (points), avec leurs coordonnées Lambert
  Nord Maroc au clic.
- Architecture MULTI-ZONES : plusieurs "cadgis" (zones cadastrales)
  peuvent coexister dans la même app, chacune avec sa propre couleur,
  activable/désactivable dans le menu ☰. Voir "AJOUTER UNE NOUVELLE
  ZONE" plus bas.
- Bouton "📍" : GPS en direct (point bleu) par rapport aux parcelles.
- Bouton "🎯" (au centre, sous le réticule) : fixe le point du centre
  de l'écran comme cible ; une ligne rouge relie alors votre position
  GPS à la cible, avec distance (m) et gisement (grades, sens horaire).
- Réticule central : affiche en direct les coordonnées Lambert Nord
  Maroc (X, Y) du centre de l'écran pendant que vous naviguez.
- Bouton "📏" : mesure de distance — touchez plusieurs points, la
  distance cumulée s'affiche.
- Bouton "📐" : dessin d'une zone — touchez au moins 3 points pour
  calculer surface (m² et ha) et périmètre.
- Recherche par N° de titre (toutes zones actives confondues).
- Écran de verrouillage par mot de passe à l'ouverture (voir plus bas).

ARCHITECTURE DES DONNÉES (multi-zones)
--------------------------
  regions.json          ← liste des zones disponibles
  regions/
    berrechid/
      tiles/                       (polygones des titres, découpés en tuiles)
      tiles_index.json
      bornes_tiles/                (points des bornes, découpés en tuiles)
      bornes_tiles_index.json
      search_index.json            (index de recherche par N° de titre)
    <autre_zone>/
      ... même structure ...

Les titres/bornes sont découpés en petites tuiles géographiques pour
que le téléphone ne charge que ce qui est visible à l'écran — un
fichier unique avec des dizaines de milliers de parcelles serait trop
lourd à charger d'un coup sur mobile. Elles ne s'affichent qu'à partir
du zoom 13 (assez proche) ; un bandeau orange l'indique si besoin.

AJOUTER UNE NOUVELLE ZONE (cadgis) PLUS TARD
--------------------------
  1. Envoyez-moi les fichiers .TAB/.DAT/.MAP/.ID de la nouvelle zone
     (comme pour Berrechid). Je les convertis (Lambert → WGS84 avec
     la bonne zone/le bon datum) et les découpe en tuiles.
  2. Je vous donne un dossier regions/<id>/ prêt à l'emploi (ex. :
     regions/settat/) avec exactement la même structure interne que
     regions/berrechid/. Déposez-le simplement à côté dans le projet.
  3. Ouvrez regions.json et ajoutez une entrée sur ce modèle (avec une
     virgule après l'accolade précédente) :

     {
       "id": "settat",
       "name": "Settat",
       "folder": "regions/settat",
       "color": "#35c7ff"
     }

  4. Sauvegardez, GitHub Desktop → résumé du commit → Commit → Push.
     Rien d'autre à modifier : la nouvelle zone apparaît automatique-
     ment dans le menu ☰ → "Zones (cadgis)", avec sa propre couleur,
     et la recherche par N° de titre couvre désormais toutes les
     zones actives.

COMMENT L'OUVRIR
--------------------------
IMPORTANT : la géolocalisation (📍) et le chargement des données ne
fonctionnent QUE si le site est servi en HTTPS ou en local (localhost).
Ouvrir index.html en double-cliquant dessus (file://) ne fonctionnera
PAS — un message rouge s'affiche pour le rappeler.

Option A — pour le terrain (recommandé), avec GitHub Pages :
  1. Déposez TOUT le contenu du dossier (index.html, style.css, app.js,
     regions.json, regions/, README.txt) dans votre dépôt GitHub via
     GitHub Desktop → Commit → Push.
  2. Activez GitHub Pages sur ce dépôt (Settings → Pages).
  3. Ouvrez l'URL https://votrecompte.github.io/nom-du-depot/ sur
     votre téléphone.

Option B — test rapide sur PC (VS Code) :
  1. Ouvrez le dossier dans VS Code.
  2. Installez l'extension "Live Server".
  3. Clic droit sur index.html → "Open with Live Server".

MOT DE PASSE
--------------------------
Un écran de verrouillage protège l'accès (mot de passe défini dans
index.html, variable PASSWORD). Rappel : c'est une protection simple
côté navigateur, pas une vraie sécurité — une personne technique
pourrait la contourner en lisant le code source. Suffisant pour éviter
les visiteurs occasionnels, pas pour des données très sensibles.

NOTE TECHNIQUE — projection et bornes (Berrechid)
--------------------------
- Le fichier titres.TAB définissait Lambert Nord Maroc mais SANS le
  paramètre de changement de datum (Merchich → WGS84) ; la conversion
  a été refaite avec la définition officielle EPSG:26191, ce qui a
  éliminé un décalage d'environ 300 m par rapport à l'image satellite.
- Le fichier Bornes.MAP/.ID était corrompu (GDAL s'arrêtait après
  13 347 bornes) ; les 650 113 bornes réelles ont été récupérées en
  lisant directement le fichier binaire Bornes.DAT.
- Pour toute nouvelle zone, la même vérification (bonne zone Lambert
  parmi les 4 du Maroc, datum, cohérence des fichiers .MAP/.ID) sera
  refaite avant conversion.

LIMITES CONNUES / AMÉLIORATIONS POSSIBLES
--------------------------
- Pas de mode hors-ligne pour l'imagerie satellite (nécessite internet
  sur le terrain). Les tuiles de titres/bornes déjà chargées restent
  en mémoire pendant la session.
- La recherche charge l'index d'une zone (~13 Mo) au premier usage de
  cette zone dans une session.
- Améliorations possibles plus tard : mode hors-ligne complet (cache
  des tuiles satellite), export d'une parcelle en PDF, lien direct
  entre une parcelle et un dossier Reverse Cheminement.
