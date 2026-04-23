# TeachLink Contract Management System

A contract management system with circuit breaker pattern implementation to prevent cascading failures.

## Features

- **Circuit Breaker Pattern**: Prevents cascading failures by implementing a circuit breaker with configurable failure thresholds
- **Cooldown Period**: Implements automatic recovery with configurable cooldown periods
- **Gradual Recovery**: Supports gradual recovery through half-open state testing
- **Status Monitoring**: Real-time monitoring and logging of circuit breaker status
- **REST API**: Express-based REST API for contract management

## Circuit Breaker Implementation

The circuit breaker pattern includes:

### States
- **CLOSED**: Normal operation, requests pass through
- **OPEN**: Circuit is open, requests are rejected
- **HALF_OPEN**: Testing state, limited requests allowed to check recovery

### Configuration
- **Failure Threshold**: Number of failures before opening circuit (default: 5)
- **Cooldown Period**: Time to wait before attempting recovery (default: 60 seconds)
- **Monitoring Period**: Status check interval (default: 30 seconds)

### Features
- **Failure Threshold**: Configurable number of consecutive failures before opening
- **Cooldown Period**: Automatic recovery after specified time
- **Gradual Recovery**: Half-open state for testing service recovery
- **Status Monitoring**: Real-time status tracking and logging
- **Event Emission**: Events for state changes and monitoring

## Installation

```bash
npm install
```

## Usage

### Start the server
```bash
npm start
```

### Development mode
```bash
npm run dev
```

### Run tests
```bash
npm test
```

### Watch tests
```bash
npm run test:watch
```

## API Endpoints

### Health Check
```
GET /health
```
Returns the health status and circuit breaker information.

### Get Contract
```
GET /contracts/:id
```
Retrieves a specific contract by ID.

### Create Contract
```
POST /contracts
```
Creates a new contract.

## Circuit Breaker Configuration

You can configure the circuit breaker by modifying the options in `src/index.js`:

```javascript
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,        // Number of failures before opening
  cooldownPeriod: 60000,      // Cooldown period in milliseconds
  monitoringPeriod: 30000,    // Status check interval in milliseconds
});
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (default: info)
- `EXTERNAL_API_URL`: External API URL for contract operations

## Testing

The test suite includes comprehensive tests for the circuit breaker functionality:

- Basic functionality tests
- Failure threshold tests
- Cooldown period tests
- Gradual recovery tests
- Status monitoring tests
- Manual reset tests

Run tests with:
```bash
npm test
```

## Logging

The application uses Winston for structured logging with:
- Console logging in development
- File logging for errors and combined logs
- JSON format for structured data

## Issue #261 - Circuit Breaker Implementation

This implementation addresses issue #261 by providing:

✅ **Failure Threshold**: Configurable number of consecutive failures
✅ **Cooldown Period**: Automatic recovery with configurable timeout
✅ **Gradual Recovery**: Half-open state for testing service recovery
✅ **Status Monitoring**: Real-time monitoring and logging

## License

MIT
