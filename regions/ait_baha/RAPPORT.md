# Rapport de traitement — Ait Baha (ait_baha)
Généré le 2026-07-16 00:04

## Projection détectée
- Zone : **Merchich / Nord Maroc** (EPSG:26191)
- Confiance : haute (correspondance exacte)
- lat_0 détecté dans le fichier : 33.3

## Titres (parcelles)
- Fichier utilisé : `Titres + titres_mappe_32_06_60_B`
- Enregistrements actifs dans le .DAT : 39985
- Méthode de lecture : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérés (géométrie valide) : 39665 (99.7%)
- Écartés (géométrie invalide) : 128
- Écartés (hors territoire marocain) : 0

## Bornes
- Fichier utilisé : `Bornes_Mappe_Brigade + Bornes`
- Enregistrements actifs dans le .DAT : 357870
- Méthode : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérées : 346327 (100.0%)

## Observations / Conseils
### ⚠️ PLUSIEURS FICHIERS TITRES — FUSIONNÉS AUTOMATIQUEMENT
2 fichiers Titres trouvés dans l'archive, fusionnés en 39793 références uniques (Nature+Numéro+indice+complément). Une même référence trouvée dans plusieurs fichiers = doublon exact, ignoré. Une référence présente dans un seul fichier (même ancien) = conservée (titre mère/historique). Détail par fichier :
  - `Titres` : 39733 actifs, 39541 référence(s) nouvelle(s) ajoutée(s), 179 doublon(s) exact(s) ignoré(s)
  - `titres_mappe_32_06_60_B` : 252 actifs, 252 référence(s) nouvelle(s) ajoutée(s), 0 doublon(s) exact(s) ignoré(s)

Informatif seulement — vérifiez juste que le nombre de références nouvelles par fichier ancien vous semble cohérent avec ce que vous attendiez.

### ⚠️ PLUSIEURS FICHIERS BORNES — FUSIONNÉS AUTOMATIQUEMENT
2 fichiers Bornes trouvés, fusionnés par référence exacte (même logique que les titres). Détail :
  - `Bornes_Mappe_Brigade` : 0 actifs, 0 nouvelle(s), 0 doublon(s) ignoré(s)
  - `Bornes` : 357870 actifs, 346327 nouvelle(s), 11471 doublon(s) ignoré(s)

Informatif seulement.

---
**VERDICT : aucune consultation nécessaire — données prêtes à déployer.**