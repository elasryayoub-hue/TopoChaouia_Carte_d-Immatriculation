# Rapport de traitement — Berkane (berkane)
Généré le 2026-07-16 00:24

## Projection détectée
- Zone : **Merchich / Nord Maroc** (EPSG:26191)
- Confiance : haute (correspondance exacte)
- lat_0 détecté dans le fichier : 33.3

## Titres (parcelles)
- Fichier utilisé : `titres`
- Enregistrements actifs dans le .DAT : 92895
- Méthode de lecture : lecture séquentielle standard (fichier sain)
- Récupérés (géométrie valide) : 86906 (93.6%)
- Écartés (géométrie invalide) : 5981
- Écartés (hors territoire marocain) : 6

## Bornes
- Fichier utilisé : `bornes`
- Enregistrements actifs dans le .DAT : 847566
- Méthode : lecture directe du .DAT (fiable, contourne le .MAP/.ID)
- Récupérées : 847088 (99.9%)

## Observations / Conseils
### ⚠️ TITRES — RÉCUPÉRATION INCOMPLÈTE
Seuls 86906/92895 titres actifs ont pu être récupérés (93.6%), même après tentative de réparation. Le fichier .MAP est probablement endommagé au-delà de ce qui peut être réparé automatiquement. CONSULTATION RECOMMANDÉE (vérifier si le logiciel MapInfo peut réparer/'Pack' la table, ou si une sauvegarde plus ancienne peut compléter les données).

### ⚠️ TITRES — GÉOMÉTRIES INVALIDES NOMBREUSES
5981 titres ont une géométrie invalide (polygone dégénéré). Si ce nombre est élevé, cela peut indiquer une corruption plus profonde que prévu. À VÉRIFIER.

---
**VERDICT : consultation humaine (ou Claude) RECOMMANDÉE avant de déployer cette zone**, pour les raisons listées ci-dessus.