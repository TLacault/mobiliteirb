const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client"); // Import Prisma

// Import des routes
const authRoutes = require("./routes/authRoutes");
const mobiliteRoutes = require("./routes/mobiliteRoutes");
const tripRoutes = require("./routes/tripRoutes");

// Initialisation de l'application Express
const app = express();
const prisma = new PrismaClient(); // Initialise le client
const port = process.env.PORT || 3001;

// Configuration CORS pour permettre les requêtes du frontend
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8080",
      "http://localhost:5137",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);

// Middleware pour lire le JSON
app.use(express.json());

// Route de base
app.get("/", async (req, res) => {
  res.send("Hello from Backend!");
});

// Routes API v1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mobilites", mobiliteRoutes);
app.use("/api/v1/trips", tripRoutes);

// Démarrage du serveur
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
});
