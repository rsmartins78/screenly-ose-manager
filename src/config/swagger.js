const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    info: {
      title: 'screenly ose manager',
      version: '1.0.0',
      description: 'API documentation to A opensource manager to Screenly-Ose.',
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
