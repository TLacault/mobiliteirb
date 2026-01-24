const express = require("express");
const { PrismaClient } = require("@prisma/client"); // Import Prisma

const app = express();
const prisma = new PrismaClient(); // Initialise le client
const port = 3000;

// Middleware pour lire le JSON
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello from Backend!");
});

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
