# Rapport de traitement — Casa Bernoussi (casa_bernoussi)
Généré le 2026-07-16 00:47

## Projection détectée
- Zone : **Merchich / Nord Maroc** (EPSG:26191)
- Confiance : haute (correspondance exacte)
- lat_0 détecté dans le fichier : 33.3

## Titres (parcelles)
- Fichier utilisé : `Titres + Titres_01_03_2010 + Titresvide`
- Enregistrements actifs dans le .DAT : 82753
- Méthode de lecture : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérés (géométrie valide) : 57328 (99.9%)
- Écartés (géométrie invalide) : 76
- Écartés (hors territoire marocain) : 0

## Bornes
- Fichier utilisé : `Bornes + Bornesvide`
- Enregistrements actifs dans le .DAT : 90641
- Méthode : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérées : 90507 (100.0%)

## Observations / Conseils
### ⚠️ PLUSIEURS FICHIERS TITRES — FUSIONNÉS AUTOMATIQUEMENT
3 fichiers Titres trouvés dans l'archive, fusionnés en 57404 références uniques (Nature+Numéro+indice+complément). Une même référence trouvée dans plusieurs fichiers = doublon exact, ignoré. Une référence présente dans un seul fichier (même ancien) = conservée (titre mère/historique). Détail par fichier :
  - `Titres` : 32609 actifs, 32609 référence(s) nouvelle(s) ajoutée(s), 0 doublon(s) exact(s) ignoré(s)
  - `Titres_01_03_2010` : 50144 actifs, 24795 référence(s) nouvelle(s) ajoutée(s), 25345 doublon(s) exact(s) ignoré(s)
  - `Titresvide` : 0 actifs, 0 référence(s) nouvelle(s) ajoutée(s), 0 doublon(s) exact(s) ignoré(s)

Informatif seulement — vérifiez juste que le nombre de références nouvelles par fichier ancien vous semble cohérent avec ce que vous attendiez.

### ⚠️ PLUSIEURS FICHIERS BORNES — FUSIONNÉS AUTOMATIQUEMENT
2 fichiers Bornes trouvés, fusionnés par référence exacte (même logique que les titres). Détail :
  - `Bornes` : 90641 actifs, 90507 nouvelle(s), 134 doublon(s) ignoré(s)
  - `Bornesvide` : 0 actifs, 0 nouvelle(s), 0 doublon(s) ignoré(s)

Informatif seulement.

---
**VERDICT : aucune consultation nécessaire — données prêtes à déployer.**