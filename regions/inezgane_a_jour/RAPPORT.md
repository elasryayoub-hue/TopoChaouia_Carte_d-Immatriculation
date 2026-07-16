# Rapport de traitement — INEZGANE A JOUR (inezgane_a_jour)
Généré le 2026-07-16 01:32

## Projection détectée
- Zone : **Merchich / Nord Maroc** (EPSG:26191)
- Confiance : haute (correspondance exacte)
- lat_0 détecté dans le fichier : 33.3

## Titres (parcelles)
- Fichier utilisé : `TitresDXF + Titres`
- Enregistrements actifs dans le .DAT : 153512
- Méthode de lecture : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérés (géométrie valide) : 93025 (99.1%)
- Écartés (géométrie invalide) : 882
- Écartés (hors territoire marocain) : 0

## Bornes
- Fichier utilisé : `Bornes`
- Enregistrements actifs dans le .DAT : 497018
- Méthode : lecture directe du .DAT (fiable, contourne le .MAP/.ID)
- Récupérées : 496998 (100.0%)

## Observations / Conseils
### ⚠️ PLUSIEURS FICHIERS TITRES — FUSIONNÉS AUTOMATIQUEMENT
2 fichiers Titres trouvés dans l'archive, fusionnés en 93907 références uniques (Nature+Numéro+indice+complément). Une même référence trouvée dans plusieurs fichiers = doublon exact, ignoré. Une référence présente dans un seul fichier (même ancien) = conservée (titre mère/historique). Détail par fichier :
  - `TitresDXF` : 76131 actifs, 19407 référence(s) nouvelle(s) ajoutée(s), 56695 doublon(s) exact(s) ignoré(s)
  - `Titres` : 77381 actifs, 74500 référence(s) nouvelle(s) ajoutée(s), 2825 doublon(s) exact(s) ignoré(s)

Informatif seulement — vérifiez juste que le nombre de références nouvelles par fichier ancien vous semble cohérent avec ce que vous attendiez.

---
**VERDICT : aucune consultation nécessaire — données prêtes à déployer.**