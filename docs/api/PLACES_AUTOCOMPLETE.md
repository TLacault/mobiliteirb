# Google Places API (New) - Autocomplete

### CONTEXTE

Cette doc couvre l'autocomplete de lieux via **Places API (New)**.

Objectif: partir d'un texte saisi par l'utilisateur (ex: `"bord"`), retourner une liste de suggestions de lieux.


### API KEY

clé stockée dans `frontend/.env` : `GMAPS_API_KEY`

### ENDPOINT GOOGLE (AUTOCOMPLETE)

`POST https://places.googleapis.com/v1/places:autocomplete`

Headers obligatoires:
- `Content-Type: application/json`
- `X-Goog-Api-Key: <GOOGLE_MAPS_API_KEY>`
- `X-Goog-FieldMask: suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text`

### PARAMETRES PRIS

Parametres du body:
- `input` (obligatoire, string): texte saisi par l'utilisateur.
  Exemple: `"borde"`
  Regle conseillee: ne pas appeler l'API avant 2 ou 3 caracteres.
- `languageCode` (optionnel, string): langue des suggestions.
  Exemple: `"fr"`
- `regionCode` (optionnel, string): biais regional ISO-3166-1 alpha-2.
  Exemple: `"FR"`
- `includedRegionCodes` (optionnel, array de string): filtre de pays autorises.
  Exemple: `["FR", "BE"]`
- `locationBias` (optionnel, object): biais geographique (sans bloquer les autres resultats).
- `locationRestriction` (optionnel, object): restriction geographique stricte.


### EXEMPLE CURL

```sh
curl -X POST 'https://places.googleapis.com/v1/places:autocomplete' \
  -H 'Content-Type: application/json' \
  -H 'X-Goog-Api-Key: <GOOGLE_MAPS_API_KEY>' \
  -H 'X-Goog-FieldMask: suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text' \
  -d '{
    "input": "borde",
    "languageCode": "fr",
    "regionCode": "FR"
  }'
```

### RESPONSE

**Exemple de réponse :**
```json
{
  "suggestions": [
    {
      "placePrediction": {
        "placeId": "ChIJc-d-8jvwQAARxs-ixOkW9lQ",
        "text": {
          "text": "Bordeaux, France"
        },
        "structuredFormat": {
          "mainText": {
            "text": "Bordeaux"
          },
          "secondaryText": {
            "text": "France"
          }
        }
      }
    }
  ]
}
```

**Champs de la réponse :**
- `suggestions` (array): liste des suggestions trouvées
  - `placePrediction`: object contenant les données du lieu suggéré
    - `placeId` (string): identifiant unique du lieu Google Places (utiliser pour des requêtes ultérieures)
    - `text.text` (string): texte complet du lieu (ex: "Bordeaux, France")
    - `structuredFormat.mainText.text` (string): nom principal du lieu (ex: "Bordeaux")
    - `structuredFormat.secondaryText.text` (string): détails supplémentaires (ex: "France")

---

### COUT / QUOTAS

- **Free cap**: 10 000 requêtes par mois (gratuit)
- **Tarif après dépassement**: ~$0.03 par requête additionnelle



### LIENS 

- Places Autocomplete (New):
  `https://developers.google.com/maps/documentation/places/web-service/place-autocomplete`
- Usage and Billing (Places):
  `https://developers.google.com/maps/documentation/places/web-service/usage-and-billing`
- Pricing Google Maps Platform:
  `https://developers.google.com/maps/billing-and-pricing/pricing`

