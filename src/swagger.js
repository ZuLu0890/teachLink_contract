const swaggerJsdoc = require('swagger-jsdoc');
const package = require('../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TeachLink Contract Management API',
      version: package.version,
      description: 'API documentation for TeachLink contract management system with circuit breaker pattern',
      contact: {
        name: 'TeachLink Team',
        email: 'support@teachlink.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.teachlink.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Contract: {
          type: 'object',
          required: ['id', 'title', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique contract identifier',
              example: 'contract-123'
            },
            title: {
              type: 'string',
              description: 'Contract title',
              example: 'Service Agreement 2024'
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'completed', 'cancelled'],
              description: 'Contract status',
              example: 'active'
            },
            amount: {
              type: 'number',
              description: 'Contract amount',
              example: 50000.00
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Contract start date',
              example: '2024-01-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Contract end date',
              example: '2024-12-31'
            }
          }
        },
        CreateContractRequest: {
          type: 'object',
          required: ['title', 'status'],
          properties: {
            title: {
              type: 'string',
              description: 'Contract title',
              example: 'Service Agreement 2024'
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'completed', 'cancelled'],
              description: 'Contract status',
              example: 'draft'
            },
            amount: {
              type: 'number',
              description: 'Contract amount',
              example: 50000.00
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Contract start date',
              example: '2024-01-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Contract end date',
              example: '2024-12-31'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'healthy'
            },
            circuitBreaker: {
              type: 'object',
              properties: {
                state: {
                  type: 'string',
                  enum: ['CLOSED', 'OPEN', 'HALF_OPEN'],
                  description: 'Circuit breaker state'
                },
                failureCount: {
                  type: 'integer',
                  description: 'Current failure count'
                },
                successCount: {
                  type: 'integer',
                  description: 'Current success count'
                },
                failureThreshold: {
                  type: 'integer',
                  description: 'Failure threshold before opening'
                },
                cooldownPeriod: {
                  type: 'integer',
                  description: 'Cooldown period in milliseconds'
                },
                lastFailureTime: {
                  type: 'integer',
                  nullable: true,
                  description: 'Timestamp of last failure'
                },
                lastSuccessTime: {
                  type: 'integer',
                  nullable: true,
                  description: 'Timestamp of last success'
                },
                requestCount: {
                  type: 'integer',
                  description: 'Request count in current monitoring period'
                },
                totalRequests: {
                  type: 'integer',
                  description: 'Total requests processed'
                },
                nextAttemptTime: {
                  type: 'integer',
                  nullable: true,
                  description: 'Timestamp when circuit breaker will attempt reset'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Contract not found'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints'
      },
      {
        name: 'Contracts',
        description: 'Contract management endpoints'
      }
    ]
  },
  apis: ['./src/index.js', './src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
