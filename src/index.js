const express = require('express');
const CircuitBreaker = require('./circuit-breaker');
const ContractService = require('./services/contract-service');
const logger = require('./utils/logger');

const app = express();
app.use(express.json());

// Initialize circuit breaker
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  cooldownPeriod: 60000, // 1 minute
  monitoringPeriod: 30000, // 30 seconds
});

// Initialize contract service with circuit breaker
const contractService = new ContractService(circuitBreaker);

// Routes
app.get('/health', (req, res) => {
  const status = circuitBreaker.getStatus();
  res.json({
    status: 'healthy',
    circuitBreaker: status
  });
});

app.get('/contracts/:id', async (req, res) => {
  try {
    const contract = await contractService.getContract(req.params.id);
    res.json(contract);
  } catch (error) {
    logger.error('Error fetching contract:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/contracts', async (req, res) => {
  try {
    const contract = await contractService.createContract(req.body);
    res.status(201).json(contract);
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('Circuit breaker initialized');
});
