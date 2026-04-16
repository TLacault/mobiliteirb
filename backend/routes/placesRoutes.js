const express = require("express");
const router = express.Router();

const GMAPS_API_KEY = process.env.GMAPS_API_KEY;

/**
 * POST /api/v1/places/autocomplete
 * Proxy vers Google Places Autocomplete (New) pour éviter les problèmes CSP
 * Body: { input: string }
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

module.exports = router;
