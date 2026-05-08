const express = require("express");
const router = express.Router();

const GMAPS_API_KEY = process.env.GMAPS_API_KEY;

/**
 * @openapi
 * tags:
 *   - name: Places
 *     description: Proxy endpoints for geocoding and place autocomplete (CSP-safe)
 */

/**
 * @openapi
 * /places/autocomplete:
 *   post:
 *     summary: City autocomplete suggestions
 *     description: Proxies Google Places (New) Autocomplete API to avoid CSP restrictions in the browser.
 *     tags: [Places]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [input]
 *             properties:
 *               input:
 *                 type: string
 *                 example: Borde
 *                 description: Partial city name (min 2 characters)
 *     responses:
 *       200:
 *         description: List of city suggestions from Google Places
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Input too short
 *       500:
 *         description: GMAPS_API_KEY not configured
 *       502:
 *         description: Failed to reach Google Places API
 */
router.post("/autocomplete", async (req, res) => {
  const { input } = req.body;

  if (!input || input.trim().length < 2) {
    return res.json({ suggestions: [] });
  }

  if (!GMAPS_API_KEY) {
    return res.status(500).json({ error: "GMAPS_API_KEY not configured" });
  }

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GMAPS_API_KEY,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text",
        },
        body: JSON.stringify({
          input: input.trim(),
          languageCode: "fr",
          includedPrimaryTypes: ["locality"],
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Google Places proxy error:", error);
    res.status(502).json({ error: "Failed to fetch from Google Places API" });
  }
});

/**
 * @openapi
 * /places/geocode:
 *   get:
 *     summary: Geocode a place name to coordinates
 *     description: Proxies Nominatim (OpenStreetMap) geocoding API to avoid CSP restrictions in the browser.
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: New York
 *         description: Place name to geocode (min 2 characters)
 *     responses:
 *       200:
 *         description: Array of Nominatim results (lat/lon per result)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: string
 *                     example: "48.8566"
 *                   lon:
 *                     type: string
 *                     example: "2.3522"
 *       400:
 *         description: Query too short
 *       502:
 *         description: Failed to reach Nominatim API
 */
router.get("/geocode", async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  try {
    const params = new URLSearchParams({
      q: q.trim(),
      format: "json",
      limit: "1",
      "accept-language": "fr",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "MobilitEirb/1.0 (student project)",
        },
      },
    );

    if (!response.ok) {
      return res.status(response.status).json([]);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Nominatim proxy error:", error);
    res.status(502).json([]);
  }
});

module.exports = router;
