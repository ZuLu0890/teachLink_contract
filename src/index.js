const express = require('express');
const CircuitBreaker = require('./circuit-breaker');
const ContractService = require('./services/contract-service');
const logger = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files for custom Swagger UI enhancements
app.use('/static', express.static(path.join(__dirname, 'static')));

// Initialize circuit breaker
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  cooldownPeriod: 60000, // 1 minute
  monitoringPeriod: 30000, // 30 seconds
});

// Initialize contract service with circuit breaker
const contractService = new ContractService(circuitBreaker);

// Helper function for handling async route errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Helper function for standard error responses
const handleError = (error, res, message) => {
  logger.error(message, error);
  res.status(500).json({ error: error.message });
};

// Routes
/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and circuit breaker state
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: healthy
 *               circuitBreaker:
 *                 state: CLOSED
 *                 failureCount: 0
 *                 successCount: 5
 *                 failureThreshold: 5
 *                 cooldownPeriod: 60000
 *                 lastFailureTime: null
 *                 lastSuccessTime: 1714027200000
 *                 requestCount: 10
 *                 totalRequests: 100
 *                 nextAttemptTime: null
 */
app.get('/health', (req, res) => {
  const status = circuitBreaker.getStatus();
  res.json({
    status: 'healthy',
    circuitBreaker: status
  });
});

/**
 * @swagger
 * /contracts/{id}:
 *   get:
 *     tags: [Contracts]
 *     summary: Get a contract by ID
 *     description: Retrieve a specific contract by its unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *         example: contract-123
 *     responses:
 *       200:
 *         description: Contract retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *             example:
 *               id: contract-123
 *               title: Service Agreement 2024
 *               status: active
 *               amount: 50000.00
 *               startDate: 2024-01-01
 *               endDate: 2024-12-31
 *       500:
 *         description: Internal server error or circuit breaker open
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Contract not found
 */
app.get('/contracts/:id', asyncHandler(async (req, res) => {
  const contract = await contractService.getContract(req.params.id);
  res.json(contract);
}));

/**
 * @swagger
 * /contracts:
 *   post:
 *     tags: [Contracts]
 *     summary: Create a new contract
 *     description: Create a new contract with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContractRequest'
 *           example:
 *             title: Service Agreement 2024
 *             status: draft
 *             amount: 50000.00
 *             startDate: 2024-01-01
 *             endDate: 2024-12-31
 *     responses:
 *       201:
 *         description: Contract created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *             example:
 *               id: contract-456
 *               title: Service Agreement 2024
 *               status: draft
 *               amount: 50000.00
 *               startDate: 2024-01-01
 *               endDate: 2024-12-31
 *       500:
 *         description: Internal server error or circuit breaker open
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Failed to create contract
 */
app.post('/contracts', asyncHandler(async (req, res) => {
  const contract = await contractService.createContract(req.body);
  res.status(201).json(contract);
}));

/**
 * @swagger
 * /contracts/{id}:
 *   put:
 *     tags: [Contracts]
 *     summary: Update a contract
 *     description: Update an existing contract by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *         example: contract-123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContractRequest'
 *           example:
 *             title: Updated Service Agreement 2024
 *             status: active
 *             amount: 60000.00
 *     responses:
 *       200:
 *         description: Contract updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       500:
 *         description: Internal server error or circuit breaker open
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/contracts/:id', asyncHandler(async (req, res) => {
  const contract = await contractService.updateContract(req.params.id, req.body);
  res.json(contract);
}));

/**
 * @swagger
 * /contracts/{id}:
 *   delete:
 *     tags: [Contracts]
 *     summary: Delete a contract
 *     description: Delete a contract by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *         example: contract-123
 *     responses:
 *       200:
 *         description: Contract deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contract deleted successfully
 *       500:
 *         description: Internal server error or circuit breaker open
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/contracts/:id', asyncHandler(async (req, res) => {
  const result = await contractService.deleteContract(req.params.id);
  res.json(result);
}));

/**
 * @swagger
 * /contracts:
 *   get:
 *     tags: [Contracts]
 *     summary: List all contracts
 *     description: Retrieve a list of contracts with optional filters
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, completed, cancelled]
 *         description: Filter by contract status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of contracts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of contracts to skip
 *     responses:
 *       200:
 *         description: List of contracts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contract'
 *             example:
 *               - id: contract-123
 *                 title: Service Agreement 2024
 *                 status: active
 *                 amount: 50000.00
 *               - id: contract-456
 *                 title: Maintenance Contract
 *                 status: draft
 *                 amount: 25000.00
 *       500:
 *         description: Internal server error or circuit breaker open
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/contracts', asyncHandler(async (req, res) => {
  const contracts = await contractService.listContracts(req.query);
  res.json(contracts);
}));

/**
 * @swagger
 * /test/failure:
 *   post:
 *     tags: [Health]
 *     summary: Simulate a failure
 *     description: Simulate a failure to test circuit breaker behavior
 *     responses:
 *       500:
 *         description: Simulated failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Simulated failure for circuit breaker testing
 */
app.post('/test/failure', asyncHandler(async (req, res) => {
  await contractService.simulateFailure();
  res.status(500).json({ error: 'Simulated failure for circuit breaker testing' });
}));

// Error handling middleware
app.use((error, req, res, next) => {
  handleError(error, res, `Error in ${req.method} ${req.path}:`);
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customSiteTitle: 'TeachLink API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  customJs: '/static/swagger-search.js',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
    tryItOutEnabled: true,
    deepLinking: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('Circuit breaker initialized');
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
