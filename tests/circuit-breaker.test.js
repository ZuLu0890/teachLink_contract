const CircuitBreaker = require('../src/circuit-breaker');

describe('CircuitBreaker', () => {
  let circuitBreaker;
  
  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      cooldownPeriod: 1000,
      monitoringPeriod: 500
    });
  });
  
  afterEach(() => {
    if (circuitBreaker) {
      circuitBreaker.removeAllListeners();
    }
  });
  
  describe('Basic functionality', () => {
    test('should start in CLOSED state', () => {
      expect(circuitBreaker.state).toBe('CLOSED');
    });
    
    test('should execute successful operations', async () => {
      const result = await circuitBreaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(circuitBreaker.failureCount).toBe(0);
    });
    
    test('should handle failed operations', async () => {
      try {
        await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
      } catch (error) {
        expect(error.message).toBe('test error');
      }
      expect(circuitBreaker.failureCount).toBe(1);
    });
  });
  
  describe('Failure threshold', () => {
    test('should open circuit after failure threshold is reached', async () => {
      await failOperation(circuitBreaker, 3);
      expect(circuitBreaker.state).toBe('OPEN');
    });
    
    test('should reject requests when circuit is open', async () => {
      await failOperation(circuitBreaker, 3);
      
      try {
        await circuitBreaker.execute(() => Promise.resolve('success'));
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe('CIRCUIT_BREAKER_OPEN');
      }
    });
  });
  
  describe('Cooldown period', () => {
    test('should transition to HALF_OPEN after cooldown period', async () => {
      await failOperation(circuitBreaker, 3);
      expect(circuitBreaker.state).toBe('OPEN');
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      try {
        await circuitBreaker.execute(() => Promise.resolve('success'));
      } catch (error) {
        // This might fail or succeed depending on timing
      }
      
      expect(circuitBreaker.state).toBe('HALF_OPEN');
    });
  });
  
  describe('Gradual recovery', () => {
    test('should close circuit on successful operation in HALF_OPEN state', async () => {
      await failOperation(circuitBreaker, 3);
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result = await circuitBreaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(circuitBreaker.state).toBe('CLOSED');
    });
    
    test('should reopen circuit on failure in HALF_OPEN state', async () => {
      await failOperation(circuitBreaker, 3);
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      try {
        await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
      } catch (error) {
        // Expected
      }
      
      expect(circuitBreaker.state).toBe('OPEN');
    });
  });
  
  describe('Status monitoring', () => {
    test('should provide accurate status information', () => {
      const status = circuitBreaker.getStatus();
      
      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('failureCount');
      expect(status).toHaveProperty('successCount');
      expect(status).toHaveProperty('failureThreshold');
      expect(status).toHaveProperty('cooldownPeriod');
      expect(status).toHaveProperty('requestCount');
      expect(status).toHaveProperty('totalRequests');
    });
    
    test('should emit monitoring events', (done) => {
      circuitBreaker.on('monitoring', (status) => {
        expect(status).toHaveProperty('state');
        done();
      });
      
      // Wait for monitoring interval
      setTimeout(() => {
        // Monitoring should have been triggered
      }, 600);
    });
  });
  
  describe('Manual reset', () => {
    test('should allow manual reset', async () => {
      await failOperation(circuitBreaker, 3);
      expect(circuitBreaker.state).toBe('OPEN');
      
      circuitBreaker.reset();
      
      expect(circuitBreaker.state).toBe('CLOSED');
      expect(circuitBreaker.failureCount).toBe(0);
      expect(circuitBreaker.successCount).toBe(0);
    });
  });
});

// Helper function to fail operations
async function failOperation(circuitBreaker, times) {
  for (let i = 0; i < times; i++) {
    try {
      await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
    } catch (error) {
      // Expected
    }
  }
}
