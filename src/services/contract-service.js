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
      
      // Simulate external API call
      const response = await axios.get(`${this.externalApiUrl}/${id}`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    });
  }
  
  async createContract(contractData) {
    return await this.circuitBreaker.execute(async () => {
      logger.info('Creating new contract');
      
      // Simulate external API call
      const response = await axios.post(this.externalApiUrl, contractData, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    });
  }
  
  async updateContract(id, contractData) {
    return await this.circuitBreaker.execute(async () => {
      logger.info(`Updating contract ${id}`);
      
      const response = await axios.put(`${this.externalApiUrl}/${id}`, contractData, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    });
  }
  
  async deleteContract(id) {
    return await this.circuitBreaker.execute(async () => {
      logger.info(`Deleting contract ${id}`);
      
      const response = await axios.delete(`${this.externalApiUrl}/${id}`, {
        timeout: 5000
      });
      
      return response.data;
    });
  }
  
  async listContracts(filters = {}) {
    return await this.circuitBreaker.execute(async () => {
      logger.info('Listing contracts with filters:', filters);
      
      const response = await axios.get(this.externalApiUrl, {
        timeout: 5000,
        params: filters,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    });
  }
  
  // Method to simulate failures for testing
  async simulateFailure() {
    return await this.circuitBreaker.execute(async () => {
      logger.warn('Simulating a failure for testing');
      throw new Error('Simulated failure for circuit breaker testing');
    });
  }
}

module.exports = ContractService;
