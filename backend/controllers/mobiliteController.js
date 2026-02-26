const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controller pour la gestion des mobilités
 */

/**
 * GET /api/v1/mobilites
 * Récupérer la liste des uuid des mobilités de l'utilisateur connecté
 */
async function getAllMobilites(req, res) {
  try {
    const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté
    const mobilites = await prisma.mobility.findMany({
      where: { userId },
      select: { id: true },
    });
    // Renvoyer les IDs sous forme d'objets avec clé uuid pour compatibilité
    res.json(mobilites.map((m) => ({ uuid: m.id })));
  } catch (error) {
    console.error("Erreur lors de la récupération des mobilités :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// TODO GET mobilites/:id - Récupérer une mobilité par son ID

// TODO DELETE mobilites/:id - Supprimer une mobilité par son ID

// TODO POST mobilites - Créer une nouvelle mobilité

module.exports = {
  getAllMobilites,
};
