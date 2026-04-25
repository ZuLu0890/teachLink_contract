const axios = require('axios');
const logger = require('../utils/logger');

class ContractService {
  constructor(circuitBreaker) {
    this.circuitBreaker = circuitBreaker;
    this.externalApiUrl = process.env.EXTERNAL_API_URL || 'https://api.example.com/contracts';
    
    // Listen to circuit breaker events
    this.circuitBreaker.on('stateChange', (state) => {
      logger.info(`Contract service: Circuit breaker state changed to ${state}`);
    });
    
    this.circuitBreaker.on('failure', () => {
      logger.warn('Contract service: Circuit breaker recorded a failure');
    });
    
    this.circuitBreaker.on('success', () => {
      logger.info('Contract service: Circuit breaker recorded a success');
    });
  }
  
  async getContract(id) {
    return await this.circuitBreaker.execute(async () => {
      logger.info(`Fetching contract ${id}`);
      return await this.makeApiRequest('get', `${this.externalApiUrl}/${id}`);
    });
  }
  
  async createContract(contractData) {
    return await this.circuitBreaker.execute(async () => {
      logger.info('Creating new contract');
      return await this.makeApiRequest('post', this.externalApiUrl, contractData);
    });
  }
  
  async updateContract(id, contractData) {
    return await this.circuitBreaker.execute(async () => {
      logger.info(`Updating contract ${id}`);
      return await this.makeApiRequest('put', `${this.externalApiUrl}/${id}`, contractData);
    });
  }
  
  async deleteContract(id) {
    return await this.circuitBreaker.execute(async () => {
      logger.info(`Deleting contract ${id}`);
      return await this.makeApiRequest('delete', `${this.externalApiUrl}/${id}`);
    });
  }
  
  async listContracts(filters = {}) {
    return await this.circuitBreaker.execute(async () => {
      logger.info('Listing contracts with filters:', filters);
      return await this.makeApiRequest('get', this.externalApiUrl, null, filters);
    });
  }
  
  async simulateFailure() {
    return await this.circuitBreaker.execute(async () => {
      logger.warn('Simulating a failure for testing');
      throw new Error('Simulated failure for circuit breaker testing');
    });
  }

  async makeApiRequest(method, url, data = null, params = null) {
    const config = {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (params) {
      config.params = params;
    }

    const response = await axios({
      method,
      url,
      data,
      ...config
    });

    return response.data;
  }
}

module.exports = ContractService;
