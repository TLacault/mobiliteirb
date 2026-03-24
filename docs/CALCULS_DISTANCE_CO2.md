# Trajets : Calcul de la distance et du temps de trajet d'une étape, ainsi que des émissions Co2

---

## 1. Calcul de la distance et du temps de trajet d'une étape

Plusieurs choix possibles : faire une disjonction de cas sur le mode de transport

### A. Méthodes par API (Itinéraires réels)

**Services** : Google Routes API (Compute Routes)
* **Fonctionnalités** :
    * Prise en compte du trafic en temps réel.
    * Gestion des modes de transport : voiture (DRIVE), vélo (BICYCLE), marche (WALK), transport en commun (TRANSIT).
    * Résultats : distance réelle (km) et durée estimée (s).
* **Limites** : 
  * Service payant (principe de quotas : 10000 requêtes/mois dont 3000 requêtes/mois max)
  * Service non compatible avec les trajets par avion ou par bateau
  * Certaines villes ne peuvent pas être reliées. Exemple: Paris-New York en voiture, donc impossible de connaitre la distance
  * La distance peut être trop grande, et nécessité de découper le trajet
* **Exemple** :
```bash
curl -X POST "https://routes.googleapis.com/directions/v2:computeRoutes" \
  -H "X-Goog-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Goog-FieldMask: routes.distanceMeters,routes.duration" \
  -d '{
    "origin": { "address": "Paris" },
    "destination": { "address": "Berlin" },
    "travelMode": "DRIVE",
    "routingPreference": "TRAFFIC_AWARE_OPTIMAL"
  }'
```
**Réponse attendue** :
```
{
  "routes": [
    {
      "distanceMeters": 1050000,
      "duration": 37800
    }
  ]
}
```

**Services** : Google flight API (non retenu pour ce projet)
* **Fonctionnalités** :
    * Prise en compte du trafic en temps réel.
    * Gestion intelligente des trajets en avion.
    * Résultats : distance réelle (km) et durée estimée (s).
* **Limites** : 
  * Service payant (principe de quotas : 250 requêtes/mois)

### B. Méthode de Haversine (Vol d'oiseau)

**Services** : Calcule la distance la plus courte entre deux points sur une sphère à partir de leurs coordonnées GPS (latitude/longitude) grâce à la formule de Haversine
* **Fonctionnalités** : 
  * Alternative pour les grandes distances par avion ou bateau
  * Peut-être également utilisé si la requête API plante
* **Avantages** : 
  * Service gratuit
  * Calcul en local
* **Limite** : 
  * Approximation de la distance réelle
  * Approximation de la durée, qui nécessite d'estimer la vitesse du moyen de transport utilisé (avion ~800km/h et bateau ~35km/h dans l'exemple ci-dessous)
  * nécessite d'utiliser les points GPS (donc un appel à une API qui fournit ces points GPS : Google geocoding)
* **Exemple** :
```
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

distance = haversine(pointStart, pointEnd);
duration = (distance / (transportMode === "PLANE" ? 800 : 35)) * 3600;
```

**Services** : Google Geocoding API
* **Fonctionnalités** :
    * Permet d'obtenir les coordonnées de n'importe quel lieux dans le monde
    * Utiliser ici en complément de Haversine qui nécessite lat1, lon1, lat2, lon2
    * Résultats : coordonnées GPS d'une ville, d'un aéroport, d'un port.
* **Avantages** : 
  * Couverture mondiale
  * Peut prendre en entrée :
    * noms de lieux
    * gares
    * monuments
    * entreprises
    * adresses floues
* **Limites** : 
  * Service payant (principe de quotas : 10000 requêtes/mois dont 3000 requêtes/mois max)
* **Exemple** :
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Gare%20du%20Nord%20Paris&key=YOUR_API_KEY"
```
**Réponse attendue** :
```
{
  "results": [
    {
      "formatted_address": "Gare du Nord, 75010 Paris, France",
      "geometry": {
        "location": {
          "lat": 48.880948,
          "lng": 2.355314
        }
      }
    }
  ],
  "status": "OK"
}
```

---

## 2. Obtention du Facteur d'Émission Carbone

$Emissions = Distance \times Facteur\_d\_Emission$.
On peut choisir le facteur d'émissions de la ville de départ.

### A. Méthode API

**Services** : Climatiq (non retenu pour ce projet)
* **Fonctionnalités** : API qui fournit un facteur d'émission exact
* **Avantages** : 
  * Service international
  * Mise à jour automatique
  * Filtrage possible par mode de transport (emission factor)
  * Filtrage possible par région (location) -> permet tenir compte mixte énergétique dans la région
* **Limites** : Service payant (au delà de 250 requêtes/mois)
* **Exemple** : POST https://api.climatiq.io/estimate
```
curl -X POST "https://beta3.api.climatiq.io/estimate" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emission_factor": "passenger_vehicle-vehicle_type_car-fuel_source_na",
    "parameters": {
      "distance": 100,
      "distance_unit": "km"
      "location": "DE"
    }
  }'
```
**Réponse attendue** :
```
{
  "co2e": 21.3,
  "co2e_unit": "kg",
  "emission_factor": {
    "id": "passenger_vehicle-vehicle_type_car-fuel_source_na",
    "category": "passenger_vehicle",
    "activity_type": "vehicle_type_car",
    "fuel_source": "na"
  },
  "parameters": {
    "distance": 100,
    "distance_unit": "km"
    "location": "DE"
  }
}
```

Ne calculer un facteur d'émissions que si celui là n'existe pas dans la base de données.
Cela permet de réduire le nombre de requêtes. Peut être utilisé en complément de la méthode bases de données ouvertes, si les fichiers json importés ne sont pas complets.

**Services** : Carbon Interface (non retenu pour ce projet)
* **Fonctionnalités** : API qui fournit un facteur d'émission depuis la base de données de l'IEA
* **Avantages** : 
  * Service international
  * Filtrage possible par mode de transport (de base en renseignant que le véhicule, cela prend le facteur d'émission associé au véhicule)
  * Filtrage possible par pays (renseigné country si on veut tenir compte du mixte énergétique allemand)
* **Limites** : Service payant
  * gratuit jusqu'à 200 requêtes/mois
  * 30€/mois pour 5000 requêtes
  * 250€/mois pour 100 000 requêtes
* **Exemple** :
```bash
curl -X POST "https://www.carboninterface.com/api/v1/estimates" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "vehicle",
    "distance": 100,
    "distance_unit": "km",
    "vehicle_type": "small_car"
    "country": "DE"
  }'
```
**Réponse attendue** :
```
{
  "data": {
    "id": "est_xyz123",
    "type": "estimate",
    "attributes": {
      "carbon_kg": 20.5,
      "carbon_lb": 45.2,
      "estimated_at": "2026-03-10T12:34:56Z",
      "distance_value": 100,
      "distance_unit": "km",
      "vehicle_type": "small_car"
      "country": "DE"
    }
  }
}
```

**Services** : ADEME - Base Empreinte (Impact CO2)

* **Fonctionnalités** : API officielle française fournissant les facteurs d'émission de la Base Carbone (ADEME).
* 
* **Avantages** :
  * Gratuit
  * Renvoie directement la valeur des émissions CO2 (afit le calcul distance*facteur d'émission selon le type de transport renseigné)
  * Référence française pour les bilans GES
  * Données extrêmement précises sur le contexte français (mix électrique, spécificités régionales)

* **Limites** :
  * Service principalement centré sur la France

* **Exemple** :
```bash
curl -X 'GET' \'https://impactco2.fr/api/v1/transport?km=585&displayAll=1&transports=2&ignoreRadiativeForcing=0&occupencyRate=1&includeConstruction=1&language=en' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

* **Précisions** :
  * km : permet de préciser la distance récupérer par l'API gmap ou la formule de Haversine
  * displayAll : Si 1, retourne le calcul d'emission pour tout les transports disponibles. Sinon retourne seulement ceux qui ont du sens pour la distance donnée
  * ignoreRadiativeForcing : Si 1, ignore le forçage radiatif dans le calcul des émissions de l'avion. Sinon il est pris en compte
  * occupencyRate : Taux de remplissage moyen à prendre en compte pour les modes de transports de type voiture
  * includeConstruction : Si 1, prend en compte l'emission lié à la construction. Sinon elle est ignorée
  * language : langue de la réponse
  * transport : peut prendre toutes les valeurs suivantes 
    * 1 : Avion
    * 2 : TGV
    * 3 : Intercités
    * 4 : Voiture thermique
    * 5 : Voiture électrique
    * 6 : Autocar thermique
    * 7 : Vélo
    * 8 : Vélo à assistance électrique
    * 9 : Bus thermique
    * 10 : Tramway
    * 11 : Métro
    * 12 : Scooter ou moto légère thermique
    * 13 : Moto thermique
    * 14 : RER ou Transilien
    * 15 : TER
    * 16 : Bus électrique
    * 17 : Trottinette à assistance électrique
    * 21 : Bus (GNV)
    * 22 : Covoiturage thermique (1 passager)
    * 23 : Covoiturage thermique (2 passagers)
    * 24 : Covoiturage thermique (3 passagers)
    * 25 : Covoiturage thermique (4 passagers)
    * 26 : Covoiturage électrique (1 passager)
    * 27 : Covoiturage électrique (2 passagers)
    * 28 : Covoiturage électrique (3 passagers)
    * 29 : Covoiturage électrique (4 passagers)
    * 30 : Marche

* **Réponse attendue** :

Code 200:
```
{
  "data":
  [
    {
      "id": 2,
      "name": "High-speed train",
      "value": 1.7140499999999999
    }
  ]
}
```
Code 400 : Mauvais paramètres
```
{}
```
Code 405 : Mauvais type de requete HTTP
```
Only GET queries are allowed
```

### B. Méthode bases de données Ouvertes (Open Data)

**Services** : ADEME
* **Fonctionnalités** : fichiers csv qui fournit un nombre conséquent de facteurs d'émissions vérifiés
* **Avantages** : 
  * Service français
  * Gratuit
  * Filtrage possible par un large panel de mode de transport (plusieurs carburants différents, plusieurs poids/tailles pour un même véhicule)
* **Limites** : 
  * Service français : facteurs d'émissions associés aux véhicules circulant en France. Pas les facteurs en Allemagne ou aux Etats-Unis. A combiner avec Electricity Maps pour tenir compte du mix énergétique lié à la production d'électricité


**Services** : Dépôts GitHub (ex: tmrowco/carbon-intensities) (non retenu pour ce projet)
* **Fonctionnalités** : fichiers json qui fournit un nombre conséquent de facteurs d'émission mondiaux (issus de l'IEA et de l'ADEME)
* **Avantages** : 
  * Service international
  * Filtrage possible par mode de transport
  * Filtrage possible par pays
  * Filtrage possible par région
* **Limites** : 
  * Pas de filtre par pays
  * Les données ne sont pas mises à jour automatiquement
  * Données brutes dans un svg à traiter avant utilisation
* **Exemple** :
```
{
  "category": "transport",
  "vehicle_type": "car",
  "fuel": "diesel",
  "emission_factor": 0.171,
  "unit": "kgCO2e/km",
  "source": "ADEME Base Carbone"
}
```
---