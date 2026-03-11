# Google Maps API

### API KEY

clé sockée dans `frontend/.env` : `GMAPS_API_KEY`

### QUERY

**Paramètres :**
- `<origin>` : Adresse de départ (ex: "Bordeaux, France")
    - Note : Google Maps API peut aussi accepter des coordonnées GPS (latitude, longitude) à la place d'une adresse. Par exemple : "48.8566,2.3522" pour Paris.
- `<destination>` : Adresse d'arrivée (ex: "Toulouse, France")
- `<travel_mode>` : Mode de transport (ex: "**DRIVE**" pour voiture)
    - Les autres modes possibles sont "**WALKING**" (marche), "**BICYCLING**" (vélo) et "**TRANSIT**" (transports en commun).

```sh
curl -X POST -d '{
    "origin": {
      "address": "<origin>"
    },
    "destination": {
      "address": "<destination>"
    },
  "travelMode": "<travel_mode>"
  }' \
  -H 'Content-Type: application/json' -H 'X-Goog-Api-Key: {GMAPS_API_KEY}' \
  -H 'X-Goog-FieldMask: routes.duration,routes.distanceMeters' \
  'https://routes.googleapis.com/directions/v2:computeRoutes'
```

### RESPONSE
**Exemple de réponse :**
```json
{
  "routes": [
    {
      "duration": {
        "seconds": 7200,
        "nanos": 0
      },
      "distanceMeters": 500000
    }
  ]
}
```
