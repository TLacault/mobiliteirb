const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mobilit-Eirb API",
      version: "1.0.0",
      description: "API for the Mobilit-Eirb mobility tracking platform",
    },
    servers: [
      { url: "http://localhost:3001/api/v1", description: "Local" },
      { url: "https://mobilit.eirb.fr/api/v1", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Mobility: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Erasmus 2024" },
            year: { type: "string", format: "date-time" },
            isPublic: { type: "boolean" },
            isOriginal: { type: "boolean" },
            lastEdit: { type: "string", format: "date-time" },
            startLocation: { type: "string", example: "Paris, France" },
            endLocation: { type: "string", example: "Berlin, Germany" },
            stats: {
              type: "object",
              properties: {
                totalCarbon: { type: "number" },
                totalDistance: { type: "number" },
                stepCount: { type: "integer" },
              },
            },
            trips: { type: "array", items: {} },
          },
        },
        Trip: {
          type: "object",
          properties: {
            name: { type: "string", example: "Paris → Berlin" },
            isSelected: { type: "boolean" },
            emissions: { type: "number" },
            distance: { type: "number" },
            steps: { type: "integer" },
          },
        },
        UuidResponse: {
          type: "object",
          properties: {
            uuid: { type: "string", format: "uuid" },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            id: { type: "string", format: "uuid" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
