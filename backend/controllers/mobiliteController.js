const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controller pour la gestion des mobilités
 */

/**
 * GET /api/v1/mobilites
 * Récupérer la liste des uuid des mobilités de l'utilisateur connecté
 */
async function getMobilities(req, res) {
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

/**
 * GET /api/v1/mobilites/:id
 * Récupérer une mobilité complète par son ID (avec stats agrégées)
 */
async function getMobility(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mobilite = await prisma.mobility.findUnique({
      where: { id },
      include: {
        trips: {
          include: {
            steps: true,
          },
        },
      },
    });

    if (!mobilite) {
      return res.status(404).json({ error: "Mobilité introuvable" });
    }

    // Vérifier que la mobilité appartient à l'utilisateur connecté
    if (mobilite.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Calculer les stats agrégées depuis les steps
    const allSteps = mobilite.trips.flatMap((t) => t.steps);
    const totalCarbon = allSteps.reduce((sum, s) => sum + (s.carbon ?? 0), 0);
    const totalDistance = allSteps.reduce(
      (sum, s) => sum + (s.distance ?? 0),
      0,
    );
    const stepCount = allSteps.length;

    res.json({
      id: mobilite.id,
      name: mobilite.name,
      year: mobilite.year,
      isPublic: mobilite.isPublic,
      isOriginal: mobilite.isOriginal,
      lastEdit: mobilite.lastEdit,
      startLocation: mobilite.startLocation,
      endLocation: mobilite.endLocation,
      stats: {
        totalCarbon: Math.round(totalCarbon * 100) / 100, // kg CO2, arrondi 2 déc.
        totalDistance: Math.round(totalDistance * 100) / 100, // km
        stepCount,
      },
      trips: mobilite.trips,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la mobilité :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * DELETE /api/v1/mobilites/:id
 * Supprimer une mobilité par son ID (seulement si elle appartient à l'utilisateur)
 */
async function deleteMobility(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mobilite = await prisma.mobility.findUnique({
      where: { id },
    });

    if (!mobilite) {
      return res.status(404).json({ error: "Mobilité introuvable" });
    }

    if (mobilite.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    await prisma.mobility.delete({
      where: { id },
    });

    res.json({ message: "Mobilité supprimée avec succès", id: id });
  } catch (error) {
    console.error("Erreur lors de la suppression de la mobilité :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * POST /api/v1/mobilites
 * Créer une nouvelle mobilité
 */
async function createMobility(req, res) {
  try {
    const userId = req.user.id;
    const { name, year, isPublic, isOriginal, startLocation, endLocation } =
      req.body;

    if (!name || !year || !startLocation || !endLocation) {
      return res.status(400).json({ error: "Données incomplètes" });
    }

    const newMobilite = await prisma.mobility.create({
      data: {
        name,
        year: new Date(year),
        isPublic,
        isOriginal,
        startLocation,
        endLocation,
        userId: req.user.id,
      },
    });
    res.status(201).json({ uuid: newMobilite.id });
  } catch (error) {
    console.error("Erreur lors de la création de la mobilité :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * PATCH /api/v1/mobilites/:id
 * Met à jour une mobilité spécifique par son ID
 */
async function updateMobility(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const mobilite = await prisma.mobility.findUnique({
      where: { id },
    });

    if (!mobilite) {
      return res.status(404).json({ error: "Mobilité introuvable" });
    }

    if (mobilite.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const allowedFields = [
      "name",
      "year",
      "isPublic",
      "startLocation",
      "endLocation",
    ];

    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (key === "year") {
          filteredUpdates[key] = new Date(updates[key]);
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res
        .status(400)
        .json({ error: "Aucun champ valide à mettre à jour" });
    }

    await prisma.mobility.update({
      where: { id },
      data: filteredUpdates,
    });

    res.json(filteredUpdates);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la mobilité :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = {
  getMobilities,
  getMobility,
  createMobility,
  deleteMobility,
  updateMobility,
};
