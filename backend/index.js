const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello from Backend! Le serveur fonctionne.");
});

// Route de test pour la base de données (plus tard)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
