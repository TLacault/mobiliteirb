const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controller pour la gestion des trips
 */

/**
 * GET /api/v1/mobilities/:id/trips
 * Get the list of trips for a mobility
 */
async function getTrips(req, res) {
  try {
    const mobiliteId = req.params.id;
    const userId = req.user.id;
    const requestedOrder =
      typeof req.query.order === "string" ? req.query.order : "createdAt";

    const allowedOrders = [
      "createdAt",
      "alpha_desc",
      "alpha_asc",
      "emissions_desc",
      "emissions_asc",
      "duration_desc",
      "duration_asc",
      "distance_desc",
      "distance_asc",
      "steps_desc",
      "steps_asc",
    ];
    const order = allowedOrders.includes(requestedOrder)
      ? requestedOrder
      : "createdAt";

    if (!mobiliteId) {
      return res.status(400).json({ error: "ID mobilité manquant" });
    }

    const mobilite = await prisma.mobility.findUnique({
      where: { id: mobiliteId },
      select: { id: true, userId: true },
    });

    if (!mobilite) {
      return res.status(404).json({ error: "Mobilité introuvable" });
    }

    if (mobilite.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const trips = await prisma.trip.findMany({
      where: { mobilityId: mobiliteId },
      select: {
        id: true,
        name: true,
        steps: {
          select: {
            carbon: true,
            distance: true,
            time: true,
          },
        },
      },
    });

    const [field, direction] = order.split("_");
    const directionFactor = direction === "asc" ? 1 : -1;

    if (field === "alpha") {
      trips.sort((a, b) => {
        const cmp = (a.name ?? "").localeCompare(b.name ?? "", "fr", {
          sensitivity: "base",
        });
        return cmp * directionFactor;
      });
    } else if (field === "emissions") {
      trips.sort((a, b) => {
        const aVal = a.steps.reduce((sum, s) => sum + (s.carbon ?? 0), 0);
        const bVal = b.steps.reduce((sum, s) => sum + (s.carbon ?? 0), 0);
        return (aVal - bVal) * directionFactor;
      });
    } else if (field === "duration") {
      trips.sort((a, b) => {
        const aVal = a.steps.reduce((sum, s) => sum + (s.time ?? 0), 0);
        const bVal = b.steps.reduce((sum, s) => sum + (s.time ?? 0), 0);
        return (aVal - bVal) * directionFactor;
      });
    } else if (field === "distance") {
      trips.sort((a, b) => {
        const aVal = a.steps.reduce((sum, s) => sum + (s.distance ?? 0), 0);
        const bVal = b.steps.reduce((sum, s) => sum + (s.distance ?? 0), 0);
        return (aVal - bVal) * directionFactor;
      });
    } else if (field === "steps") {
      trips.sort((a, b) => (a.steps.length - b.steps.length) * directionFactor);
    }

    // Renvoyer les IDs sous forme d'objets avec clé uuid pour compatibilité
    res.json(trips.map((m) => ({ uuid: m.id })));
  } catch (error) {
    console.error("Erreur lors de la récupération des trajets :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * GET /api/v1/trips/:id
 * Récupérer les stats d'un trajet spécifique
 */
async function getTrip(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "ID trajet manquant" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: {
          select: { userId: true },
        },
        steps: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trajet introuvable" });
    }

    // Vérifier que le trajet appartient à l'utilisateur connecté
    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Calculer les stats depuis les steps du trajet
    const totalCarbon = trip.steps.reduce((sum, s) => sum + (s.carbon ?? 0), 0);
    const totalDistance = trip.steps.reduce(
      (sum, s) => sum + (s.distance ?? 0),
      0,
    );
    const stepCount = trip.steps.length;
    const totalTime = trip.steps.reduce((sum, s) => sum + (s.time ?? 0), 0);

    res.json({
      name: trip.name,
      isSelected: trip.isSelected,
      emissions: Math.round(totalCarbon * 100) / 100,
      distance: Math.round(totalDistance * 100) / 100,
      steps: stepCount,
      time: totalTime,
      // A voir comment on récup les villes de départ et d'arrivée, peut-être à partir du premier et dernier step ?
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du trajet :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/** POST /api/v1/trips
 * Créer un nouveau trajet
 */
async function createTrip(req, res) {
  try {
    const { mobilityId, name } = req.body;
    const userId = req.user.id;

    if (!mobilityId || !name) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    const mobility = await prisma.mobility.findUnique({
      where: { id: mobilityId },
      select: { userId: true },
    });

    if (!mobility) {
      return res.status(404).json({ error: "Mobilité introuvable" });
    }

    if (mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const newTrip = await prisma.trip.create({
      data: {
        mobilityId,
        name,
        isSelected: true,
      },
    });

    res.status(201).json({ message: "Trajet créé", trip: newTrip });
  } catch (error) {
    console.error("Erreur lors de la création du trajet :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/** * PATCH /api/v1/trips/:id
 * Mettre à jour les stats d'un trajet spécifique
 */
async function updateTrip(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    const { name, isSelected } = req.body;

    if (!tripId) {
      return res.status(400).json({ error: "ID trajet manquant" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: {
          select: { userId: true },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trajet introuvable" });
    }

    // Vérifier que le trajet appartient à l'utilisateur connecté
    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Mettre à jour les champs modifiables
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        name: name ?? trip.name,
        isSelected: isSelected ?? trip.isSelected,
      },
    });

    res.json({ message: "Trajet mis à jour", trip: updatedTrip });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du trajet :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * DELETE /api/v1/trips/:id
 * Supprimer un trajet par son ID
 */
async function deleteTrip(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "ID trajet manquant" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: {
          select: { userId: true },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trajet introuvable" });
    }

    // Vérifier que le trajet appartient à l'utilisateur connecté
    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    res.json({ message: "Trajet supprimé" });
  } catch (error) {
    console.error("Erreur lors de la suppression du trajet :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
};
