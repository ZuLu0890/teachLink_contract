# API Documentation Setup

This document describes the automated API documentation implementation for the TeachLink Contract Management API.

## Overview

The API documentation is implemented using:
- **swagger-ui-express**: Serves the Swagger UI interface
- **swagger-jsdoc**: Generates OpenAPI 3.0 specification from JSDoc comments
- **js-yaml**: Export documentation in YAML format
- **GitHub Actions**: Automated documentation generation in CI/CD

## Features

### ✅ Auto-generated Documentation
- Documentation is automatically generated from JSDoc comments in the code
- No manual maintenance of separate documentation files needed
- Always in sync with the actual API implementation
- Automatic generation on every push/PR via GitHub Actions

### ✅ Examples Included
- Request/response examples for all endpoints
- Schema definitions with example values
- Parameter examples for query and path parameters
- Interactive "Try it out" functionality enabled

### ✅ Version Tracking
- API version dynamically pulled from package.json
- Version-specific documentation exported to `docs/v{version}/` directory
- Version information displayed in Swagger UI header
- Easy to update version - just update package.json
- Historical versions preserved in docs directory

### ✅ Search Functionality
- Built-in search/filter in Swagger UI
- Filter endpoints by tags (Health, Contracts)
- Search operations by name
- Alphabetically sorted tags and operations
- Keyboard shortcut (Ctrl/Cmd + K) for quick search access
- Enhanced search with custom JavaScript enhancements

## Accessing Documentation

Once the server is running, access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints Documented

### Health Endpoints
- `GET /health` - Health check with circuit breaker status
- `POST /test/failure` - Simulate failure for testing

### Contract Endpoints
- `GET /contracts` - List all contracts with filters
- `GET /contracts/:id` - Get a specific contract
- `POST /contracts` - Create a new contract
- `PUT /contracts/:id` - Update a contract
- `DELETE /contracts/:id` - Delete a contract

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Access the documentation:
```
http://localhost:3000/api-docs
```

## Generating Documentation

### Manual Generation

Generate OpenAPI specification files (JSON and YAML):
```bash
npm run docs:generate
```

This will create:
- `docs/openapi.json` - OpenAPI specification in JSON format
- `docs/openapi.yaml` - OpenAPI specification in YAML format
- `docs/v{version}/openapi.json` - Version-specific documentation

### Automated Generation

Documentation is automatically generated via GitHub Actions on:
- Push to main, develop, or feature branches
- Pull requests to main or develop
- Release publications

The workflow:
1. Installs dependencies
2. Generates documentation files
3. Uploads artifacts (retained for 30 days)
4. Deploys to GitHub Pages on releases

## Adding Documentation to New Endpoints

To add documentation to a new endpoint, add JSDoc comments above the route handler:

```javascript
/**
 * @swagger
 * /endpoint:
 *   get:
 *     tags: [Category]
 *     summary: Brief description
 *     description: Detailed description
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
app.get('/endpoint', (req, res) => {
  // handler code
});
```

## Schema Definitions

Schemas are defined in `src/swagger.js` under `components.schemas`. Common schemas include:
- `Contract` - Contract object structure
- `CreateContractRequest` - Request body for creating contracts
- `HealthResponse` - Health check response with circuit breaker status
- `Error` - Error response structure

## Customization

The Swagger UI can be customized in `src/index.js`:
- `customSiteTitle` - Page title
- `customCss` - Custom CSS styling
- `swaggerOptions` - UI behavior options (filter, sorting, etc.)

## Exporting Documentation

### Via Script (Recommended)
```bash
npm run docs:generate
```

### Via API Endpoint
To export the OpenAPI specification as JSON:
```bash
curl http://localhost:3000/api-docs/swagger.json > openapi.json
```

To export as YAML:
```bash
curl http://localhost:3000/api-docs/swagger.yaml > openapi.yaml
```

## Version Management

To update the API version:
1. Update the version in `package.json`
2. Run `npm run docs:generate` to create version-specific documentation
3. Commit the changes

The documentation will automatically reflect the new version in Swagger UI and create a new version-specific directory.
