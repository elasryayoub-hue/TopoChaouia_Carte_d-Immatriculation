#!/usr/bin/env python3
"""
rebuild_regions_json.py — Reconstruit regions.json à partir de ce qui
existe réellement dans le dossier regions/.

À PLACER À CÔTÉ de regions.json et du dossier regions/ (à la racine de
votre projet TopoChaouia). Ne nécessite AUCUNE installation particulière
— juste Python standard, pas besoin de l'environnement conda "cadgis".

POURQUOI CET OUTIL
--------------------------
Si le traitement en lot (process_cadgis_gui.py) s'est arrêté en cours
de route (crash, coupure, PC qui a ramé...), regions.json peut être
resté incomplet même si les dossiers regions/<id>/ correspondants sont
en réalité complets et valides sur le disque. Cet outil ignore l'état
de regions.json et repart de la seule source fiable : ce qui est
vraiment présent dans regions/.

CE QUE ÇA FAIT
--------------------------
 1. Parcourt chaque sous-dossier de regions/.
 2. Pour chaque zone trouvée, vérifie qu'elle est complète (tiles_index.json,
    bornes_tiles_index.json, search_index.json présents). Une zone
    incomplète est signalée et exclue du regions.json final (pour éviter
    de faire planter l'app sur une zone à moitié traitée).
 3. Pour construire l'entrée de chaque zone :
      - Si un ancien regions.json existe et contient déjà une entrée
        pour cette zone -> cette entrée est GARDÉE TELLE QUELLE (ça
        préserve vos réglages manuels : default:true, couleur choisie,
        nom personnalisé...).
      - Sinon, si regions/<id>/region_meta.json existe (écrit
        automatiquement par process_cadgis.py) -> son "region_entry"
        est utilisé.
      - Sinon (cas rare : dossier créé/renommé à la main) -> une
        entrée par défaut est générée (id = nom du dossier, couleur
        orange, default:false) et clairement signalée dans le résumé,
        pour que vous puissiez la corriger vous-même si besoin.
 4. Écrit regions.json avec toutes les zones valides trouvées, dans le
    même ordre que le dossier regions/ (ordre alphabétique).
 5. Affiche un résumé clair : zones gardées telles quelles, zones
    récupérées depuis region_meta.json, zones avec entrée par défaut
    générée, zones incomplètes exclues, et zones qui étaient dans
    l'ancien regions.json mais dont le dossier n'existe plus plus
    (signalées, jamais supprimées automatiquement sans vous le dire).

Une copie de sécurité de l'ancien regions.json est toujours faite
(regions.json.backup) avant toute écriture.
"""

import os
import sys
import json
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REGIONS_JSON_PATH = os.path.join(SCRIPT_DIR, 'regions.json')
REGIONS_DIR = os.path.join(SCRIPT_DIR, 'regions')

REQUIRED_FILES = ['tiles_index.json', 'bornes_tiles_index.json', 'search_index.json']

DEFAULT_COLORS = ['#ffb020', '#35c7ff', '#ff5a5a', '#4dff8a', '#c77dff', '#ffd166', '#5ad1c9', '#f778a1']


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"  (avertissement : impossible de lire {path} : {e})")
        return default


def main():
    print("Reconstruction de regions.json à partir du dossier regions/")
    print("=" * 60)

    if not os.path.isdir(REGIONS_DIR):
        print(f"\n❌ Dossier introuvable : {REGIONS_DIR}")
        print("Ce script doit être placé à la racine du projet, à côté du dossier regions/.")
        input("\nAppuyez sur Entrée pour fermer...")
        sys.exit(1)

    old_manifest = load_json(REGIONS_JSON_PATH, default={'regions': []})
    old_entries_by_id = {r['id']: r for r in old_manifest.get('regions', []) if 'id' in r}

    folder_names = sorted(
        d for d in os.listdir(REGIONS_DIR)
        if os.path.isdir(os.path.join(REGIONS_DIR, d))
    )

    if not folder_names:
        print(f"\n❌ Aucun sous-dossier trouvé dans {REGIONS_DIR}")
        input("\nAppuyez sur Entrée pour fermer...")
        sys.exit(1)

    kept_from_old = []
    recovered_from_meta = []
    generated_default = []
    incomplete = []
    final_entries = []
    seen_ids = set()

    color_i = 0

    for folder in folder_names:
        folder_path = os.path.join(REGIONS_DIR, folder)

        missing_files = [f for f in REQUIRED_FILES if not os.path.exists(os.path.join(folder_path, f))]
        if missing_files:
            incomplete.append((folder, missing_files))
            continue

        region_id = folder  # le nom du dossier EST l'id (c'est comme ça que process_cadgis.py les crée)

        if region_id in old_entries_by_id:
            entry = old_entries_by_id[region_id]
            kept_from_old.append(region_id)
        else:
            meta = load_json(os.path.join(folder_path, 'region_meta.json'))
            if meta and 'region_entry' in meta:
                entry = meta['region_entry']
                recovered_from_meta.append(region_id)
            else:
                entry = {
                    'id': region_id,
                    'name': folder.replace('_', ' ').title(),
                    'folder': f'regions/{folder}',
                    'color': DEFAULT_COLORS[color_i % len(DEFAULT_COLORS)],
                    'default': False,
                }
                color_i += 1
                generated_default.append(region_id)

        # S'assure que le champ "folder" pointe bien vers le bon dossier,
        # même si l'entrée récupérée avait une valeur différente/obsolète.
        entry['folder'] = f'regions/{folder}'
        final_entries.append(entry)
        seen_ids.add(region_id)

    # Zones présentes dans l'ancien regions.json mais dont le dossier
    # n'existe plus (ou est incomplet) -> signalées, jamais supprimées
    # silencieusement, mais exclues du fichier final puisque leurs
    # données ne sont pas là.
    orphaned = [rid for rid in old_entries_by_id if rid not in seen_ids]

    # ------------------------------------------------------------------
    # Sauvegarde + écriture
    # ------------------------------------------------------------------
    if os.path.exists(REGIONS_JSON_PATH):
        backup_path = REGIONS_JSON_PATH + '.backup'
        shutil.copy2(REGIONS_JSON_PATH, backup_path)
        print(f"\nCopie de sécurité de l'ancien fichier : {backup_path}")

    new_manifest = {'regions': final_entries}
    with open(REGIONS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(new_manifest, f, ensure_ascii=False, indent=2)

    # ------------------------------------------------------------------
    # Résumé
    # ------------------------------------------------------------------
    print(f"\n{len(final_entries)} zone(s) écrite(s) dans regions.json :\n")

    if kept_from_old:
        print(f"  ✓ {len(kept_from_old)} zone(s) gardée(s) telle(s) quelle(s) (déjà correctes) :")
        print("     " + ", ".join(kept_from_old))
    if recovered_from_meta:
        print(f"\n  ✓ {len(recovered_from_meta)} zone(s) récupérée(s) depuis region_meta.json :")
        print("     " + ", ".join(recovered_from_meta))
    if generated_default:
        print(f"\n  ⚠ {len(generated_default)} zone(s) sans info d'origine — entrée par défaut générée")
        print("     (vérifiez le nom/la couleur dans regions.json si besoin) :")
        print("     " + ", ".join(generated_default))
    if incomplete:
        print(f"\n  ❌ {len(incomplete)} dossier(s) INCOMPLET(S), exclu(s) de regions.json :")
        for folder, missing in incomplete:
            print(f"     - {folder} (manque : {', '.join(missing)})")
        print("     -> à retraiter avec process_cadgis / process_cadgis_gui.")
    if orphaned:
        print(f"\n  ⚠ {len(orphaned)} zone(s) présente(s) dans l'ancien regions.json mais dont")
        print("     le dossier regions/<id>/ n'existe plus (ou est incomplet) — retirée(s) :")
        print("     " + ", ".join(orphaned))

    print("\nTerminé.")
    input("\nAppuyez sur Entrée pour fermer...")


if __name__ == '__main__':
    main()
