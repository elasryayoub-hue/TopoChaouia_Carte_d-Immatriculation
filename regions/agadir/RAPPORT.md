# Rapport de traitement — Agadir (agadir)
Généré le 2026-07-16 00:03

## Projection détectée
- Zone : **Merchich / Nord Maroc** (EPSG:26191)
- Confiance : haute (correspondance exacte)
- lat_0 détecté dans le fichier : 33.3

## Titres (parcelles)
- Fichier utilisé : `titres + TitresIFE`
- Enregistrements actifs dans le .DAT : 100618
- Méthode de lecture : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérés (géométrie valide) : 99962 (100.0%)
- Écartés (géométrie invalide) : 42
- Écartés (hors territoire marocain) : 0

## Bornes
- Fichier utilisé : `Bornes + Bornes_Mappe_Brigade`
- Enregistrements actifs dans le .DAT : 564254
- Méthode : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérées : 563583 (100.0%)

## Observations / Conseils
### ⚠️ PLUSIEURS FICHIERS TITRES — FUSIONNÉS AUTOMATIQUEMENT
2 fichiers Titres trouvés dans l'archive, fusionnés en 100004 références uniques (Nature+Numéro+indice+complément). Une même référence trouvée dans plusieurs fichiers = doublon exact, ignoré. Une référence présente dans un seul fichier (même ancien) = conservée (titre mère/historique). Détail par fichier :
  - `titres` : 99536 actifs, 99494 référence(s) nouvelle(s) ajoutée(s), 36 doublon(s) exact(s) ignoré(s)
  - `TitresIFE` : 1082 actifs, 510 référence(s) nouvelle(s) ajoutée(s), 572 doublon(s) exact(s) ignoré(s)

Informatif seulement — vérifiez juste que le nombre de références nouvelles par fichier ancien vous semble cohérent avec ce que vous attendiez.

### ⚠️ PLUSIEURS FICHIERS BORNES — FUSIONNÉS AUTOMATIQUEMENT
2 fichiers Bornes trouvés, fusionnés par référence exacte (même logique que les titres). Détail :
  - `Bornes` : 564254 actifs, 563583 nouvelle(s), 671 doublon(s) ignoré(s)
  - `Bornes_Mappe_Brigade` : 0 actifs, 0 nouvelle(s), 0 doublon(s) ignoré(s)

Informatif seulement.

---
**VERDICT : aucune consultation nécessaire — données prêtes à déployer.**