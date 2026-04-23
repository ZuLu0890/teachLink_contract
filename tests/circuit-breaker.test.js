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
      // Fail 3 times to reach threshold
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
        } catch (error) {
          // Expected
        }
      }
      
      expect(circuitBreaker.state).toBe('OPEN');
    });
    
    test('should reject requests when circuit is open', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
        } catch (error) {
          // Expected
        }
      }
      
      // Try to execute another request
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
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
        } catch (error) {
          // Expected
        }
      }
      
      expect(circuitBreaker.state).toBe('OPEN');
      
      // Wait for cooldown period
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Next request should transition to HALF_OPEN
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
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
        } catch (error) {
          // Expected
        }
      }
      
      // Wait for cooldown period
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Execute successful operation to close circuit
      const result = await circuitBreaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(circuitBreaker.state).toBe('CLOSED');
    });
    
    test('should reopen circuit on failure in HALF_OPEN state', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
        } catch (error) {
          // Expected
        }
      }
      
      // Wait for cooldown period
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Execute failed operation to reopen circuit
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
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('test error')));
        } catch (error) {
          // Expected
        }
      }
      
      expect(circuitBreaker.state).toBe('OPEN');
      
      // Reset manually
      circuitBreaker.reset();
      
      expect(circuitBreaker.state).toBe('CLOSED');
      expect(circuitBreaker.failureCount).toBe(0);
      expect(circuitBreaker.successCount).toBe(0);
    });
  });
});
