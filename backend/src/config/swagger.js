const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'P17 Metering API',
      version: '1.0.0',
      description: 'SaaS Usage-Based Billing & AI Token Metering Platform REST API Documentation',
      contact: {
        name: 'P17 Engineering Team',
        email: 'api@p17metering.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001/api/v1',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Customer API Key for server-to-server usage ingestion'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
