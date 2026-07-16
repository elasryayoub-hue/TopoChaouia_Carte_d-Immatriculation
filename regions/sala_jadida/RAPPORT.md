# Rapport de traitement — Sala Jadida (sala_jadida)
Généré le 2026-07-16 16:03

## Projection détectée
- Zone : **Merchich / Nord Maroc** (EPSG:26191)
- Confiance : haute (correspondance exacte)
- lat_0 détecté dans le fichier : 33.3

## Titres (parcelles)
- Fichier utilisé : `DPE_titres`
- Enregistrements actifs dans le .DAT : 1
- Méthode de lecture : lecture séquentielle standard (fichier sain)
- Récupérés (géométrie valide) : 0 (0.0%)
- Écartés (géométrie invalide) : 1
- Écartés (hors territoire marocain) : 0

## Bornes
- Fichier utilisé : `DPE_bornes + Bornes_Mappe_Brigade`
- Enregistrements actifs dans le .DAT : 373
- Méthode : fusion de plusieurs fichiers (voir détail par fichier)
- Récupérées : 373 (100.0%)

## Observations / Conseils
### ⚠️ PLUSIEURS FICHIERS BORNES — FUSIONNÉS AUTOMATIQUEMENT
2 fichiers Bornes trouvés, fusionnés par référence exacte (même logique que les titres). Détail :
  - `DPE_bornes` : 373 actifs, 373 nouvelle(s), 0 doublon(s) ignoré(s)
  - `Bornes_Mappe_Brigade` : 0 actifs, 0 nouvelle(s), 0 doublon(s) ignoré(s)

Informatif seulement.

### ⚠️ TITRES — RÉCUPÉRATION INCOMPLÈTE
Seuls 0/1 titres actifs ont pu être récupérés (0.0%), même après tentative de réparation. Le fichier .MAP est probablement endommagé au-delà de ce qui peut être réparé automatiquement. CONSULTATION RECOMMANDÉE (vérifier si le logiciel MapInfo peut réparer/'Pack' la table, ou si une sauvegarde plus ancienne peut compléter les données).

### ⚠️ TITRES — GÉOMÉTRIES INVALIDES NOMBREUSES
1 titres ont une géométrie invalide (polygone dégénéré). Si ce nombre est élevé, cela peut indiquer une corruption plus profonde que prévu. À VÉRIFIER.

### ⚠️ AUCUN TITRE RÉCUPÉRÉ
Zéro titre dans le résultat final. Ne pas déposer ce dossier tel quel. CONSULTATION NÉCESSAIRE.

---
**VERDICT : consultation humaine (ou Claude) RECOMMANDÉE avant de déployer cette zone**, pour les raisons listées ci-dessus.