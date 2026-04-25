const EventEmitter = require('events');
const logger = require('./utils/logger');

class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.failureThreshold = options.failureThreshold || 5;
    this.cooldownPeriod = options.cooldownPeriod || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 30000; // 30 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.requestCount = 0;
    this.totalRequests = 0;
    
    // Start monitoring
    this.startMonitoring();
  }
  
  async execute(operation) {
    this.totalRequests++;
    this.requestCount++;
    
    if (this.state === 'OPEN') {
      this.handleOpenState();
    }
    
    this.validateRequestAllowed();
    
    return await this.executeOperation(operation);
  }

  handleOpenState() {
    if (this.shouldAttemptReset()) {
      this.transitionToHalfOpen();
      return;
    }
    
    const error = new Error('Circuit breaker is OPEN - request rejected');
    error.code = 'CIRCUIT_BREAKER_OPEN';
    throw error;
  }

  transitionToHalfOpen() {
    this.state = 'HALF_OPEN';
    logger.info('Circuit breaker transitioning to HALF_OPEN state');
    this.emit('stateChange', 'HALF_OPEN');
  }

  validateRequestAllowed() {
    if (!this.shouldAllowRequest()) {
      const error = new Error('Circuit breaker is in HALF_OPEN state - request rate limited');
      error.code = 'CIRCUIT_BREAKER_HALF_OPEN';
      throw error;
    }
  }

  async executeOperation(operation) {
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.successCount++;
    this.lastSuccessTime = Date.now();
    
    if (this.state === 'HALF_OPEN') {
      this.transitionToClosed();
    } else if (this.state === 'CLOSED') {
      this.reduceFailureCount();
    }
    
    this.emit('success');
  }

  transitionToClosed() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    logger.info('Circuit breaker transitioning to CLOSED state - service recovered');
    this.emit('stateChange', 'CLOSED');
  }

  reduceFailureCount() {
    if (this.failureCount > 0) {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    logger.warn(`Circuit breaker failure count: ${this.failureCount}/${this.failureThreshold}`);
    
    if (this.state === 'HALF_OPEN') {
      this.transitionToOpen('half-open test failed');
    } else if (this.failureCount >= this.failureThreshold) {
      this.transitionToOpen('failure threshold reached');
    }
    
    this.emit('failure');
  }

  transitionToOpen(reason) {
    this.state = 'OPEN';
    const logLevel = reason === 'half-open test failed' ? 'warn' : 'error';
    logger[logLevel](`Circuit breaker transitioning to OPEN state - ${reason}`);
    this.emit('stateChange', 'OPEN');
  }
  
  shouldAttemptReset() {
    return Date.now() - this.lastFailureTime >= this.cooldownPeriod;
  }
  
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failureThreshold: this.failureThreshold,
      cooldownPeriod: this.cooldownPeriod,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      requestCount: this.requestCount,
      totalRequests: this.totalRequests,
      nextAttemptTime: this.state === 'OPEN' ? this.lastFailureTime + this.cooldownPeriod : null
    };
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.requestCount = 0;
    logger.info('Circuit breaker manually reset to CLOSED state');
    this.emit('stateChange', 'CLOSED');
  }
  
  startMonitoring() {
    setInterval(() => {
      const status = this.getStatus();
      logger.info('Circuit breaker status:', status);
      this.emit('monitoring', status);
    }, this.monitoringPeriod);
  }
  
  // Gradual recovery - allow more requests in half-open state based on success rate
  shouldAllowRequest() {
    if (this.state !== 'HALF_OPEN') {
      return true;
    }
    
    // Allow 1 request per monitoring period initially, then gradually increase
    const timeSinceHalfOpen = Date.now() - (this.lastFailureTime || Date.now());
    const allowedRequests = Math.floor(timeSinceHalfOpen / this.monitoringPeriod) + 1;
    
    return this.successCount < allowedRequests;
  }
}

module.exports = CircuitBreaker;
