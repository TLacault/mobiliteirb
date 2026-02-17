const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controller pour la gestion des mobilités
 */

/**
 * GET /api/v1/mobilites
 * Récupère toutes les mobilités de l'utilisateur
 */
const getAllMobilites = async (req, res) => {
  try {
    // TODO: Filtrer par user_id une fois l'authentification en place
    const mobilites = await prisma.mobility.findMany({
      orderBy: {
        lastEdit: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            casLogin: true,
            email: true,
          },
        },
        trips: true,
      },
    });

    res.json(mobilites);
  } catch (error) {
    console.error("Erreur lors de la récupération des mobilités:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des mobilités",
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/mobilites/:id
 * Récupère une mobilité spécifique par son ID
 */
const getMobiliteById = async (req, res) => {
  try {
    const { id } = req.params;

    const mobilite = await prisma.mobility.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            casLogin: true,
            email: true,
          },
        },
        trips: {
          include: {
            steps: true,
          },
        },
      },
    });

    if (!mobilite) {
      return res.status(404).json({
        error: "Mobilité non trouvée",
        id: id,
      });
    }

    res.json(mobilite);
  } catch (error) {
    console.error("Erreur lors de la récupération de la mobilité:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de la mobilité",
      message: error.message,
    });
  }
};

/**
 * POST /api/v1/mobilites
 * Crée une nouvelle mobilité
 */
const createMobilite = async (req, res) => {
  try {
    const { name, start, end, is_public, year, userId } = req.body;

    // Validation des données
    if (!name || !start || !end) {
      return res.status(400).json({
        error: "Données manquantes",
        required: ["name", "start", "end"],
      });
    }

    // TODO: Récupérer userId depuis le JWT une fois l'authentification en place
    if (!userId) {
      return res.status(400).json({
        error: "userId requis (temporaire - sera extrait du JWT plus tard)",
      });
    }

    // Définir l'année (par défaut l'année actuelle)
    const mobilityYear = year ? new Date(year) : new Date();

    const newMobilite = await prisma.mobility.create({
      data: {
        name,
        startLocation: start,
        endLocation: end,
        isPublic: is_public !== undefined ? is_public : true,
        year: mobilityYear,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            casLogin: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(newMobilite);
  } catch (error) {
    console.error("Erreur lors de la création de la mobilité:", error);
    res.status(500).json({
      error: "Erreur lors de la création de la mobilité",
      message: error.message,
    });
  }
};

/**
 * DELETE /api/v1/mobilites/:id
 * Supprime une mobilité par son ID
 */
const deleteMobilite = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la mobilité existe
    const mobilite = await prisma.mobility.findUnique({
      where: {
        id: id,
      },
    });

    if (!mobilite) {
      return res.status(404).json({
        error: "Mobilité non trouvée",
        id: id,
      });
    }

    // Supprimer la mobilité (les trajets et étapes seront supprimés en cascade grâce à onDelete: Cascade)
    await prisma.mobility.delete({
      where: {
        id: id,
      },
    });

    res.json({
      message: "Mobilité supprimée avec succès",
      id: id,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la mobilité:", error);
    res.status(500).json({
      error: "Erreur lors de la suppression de la mobilité",
      message: error.message,
    });
  }
};

module.exports = {
  getAllMobilites,
  getMobiliteById,
  createMobilite,
  deleteMobilite,
};
