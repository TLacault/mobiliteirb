const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client"); // Import Prisma

// Import des routes
const mobiliteRoutes = require("./routes/mobiliteRoutes");
const authRoutes = require("./routes/authRoutes");

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

// ====== Routes legacy (à migrer vers la structure API v1) ======
// Route pour créer un utilisateur
app.post("/users", async (req, res) => {
  try {
    const { email, name } = req.body;
    const newUser = await prisma.user.create({
      data: { email, name },
    });
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour lister les utilisateurs
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
});
