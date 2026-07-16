# Rapport de traitement — Errachidia (errachidia)
Généré le 2026-07-16 01:09

## Projection détectée
- Zone : **Merchich / Nord Maroc** (EPSG:26191)
- Confiance : haute (correspondance exacte)
- lat_0 détecté dans le fichier : 33.3

## Titres (parcelles)
- Fichier utilisé : `Titres-JORF + Titres-GUERS + titres`
- Enregistrements actifs dans le .DAT : 57057
- Méthode de lecture : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérés (géométrie valide) : 43038 (99.9%)
- Écartés (géométrie invalide) : 45
- Écartés (hors territoire marocain) : 0

## Bornes
- Fichier utilisé : `Bornes-JORF + Bornes`
- Enregistrements actifs dans le .DAT : 423283
- Méthode : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérées : 317425 (100.0%)

## Observations / Conseils
### ⚠️ PLUSIEURS FICHIERS TITRES — FUSIONNÉS AUTOMATIQUEMENT
3 fichiers Titres trouvés dans l'archive, fusionnés en 43083 références uniques (Nature+Numéro+indice+complément). Une même référence trouvée dans plusieurs fichiers = doublon exact, ignoré. Une référence présente dans un seul fichier (même ancien) = conservée (titre mère/historique). Détail par fichier :
  - `Titres-JORF` : 14147 actifs, 14147 référence(s) nouvelle(s) ajoutée(s), 0 doublon(s) exact(s) ignoré(s)
  - `Titres-GUERS` : 2302 actifs, 2302 référence(s) nouvelle(s) ajoutée(s), 0 doublon(s) exact(s) ignoré(s)
  - `titres` : 40608 actifs, 26634 référence(s) nouvelle(s) ajoutée(s), 13974 doublon(s) exact(s) ignoré(s)

Informatif seulement — vérifiez juste que le nombre de références nouvelles par fichier ancien vous semble cohérent avec ce que vous attendiez.

### ⚠️ PLUSIEURS FICHIERS BORNES — FUSIONNÉS AUTOMATIQUEMENT
2 fichiers Bornes trouvés, fusionnés par référence exacte (même logique que les titres). Détail :
  - `Bornes-JORF` : 102539 actifs, 100748 nouvelle(s), 1790 doublon(s) ignoré(s)
  - `Bornes` : 320744 actifs, 216677 nouvelle(s), 104064 doublon(s) ignoré(s)

Informatif seulement.

---
**VERDICT : aucune consultation nécessaire — données prêtes à déployer.**