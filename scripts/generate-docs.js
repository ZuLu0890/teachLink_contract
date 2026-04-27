const fs = require('fs');
const path = require('path');
const specs = require('../src/swagger');

// Create docs directory if it doesn't exist
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Export OpenAPI specification as JSON
const jsonPath = path.join(docsDir, 'openapi.json');
fs.writeFileSync(jsonPath, JSON.stringify(specs, null, 2));
console.log(`✅ OpenAPI JSON specification exported to: ${jsonPath}`);

// Export OpenAPI specification as YAML
const yaml = require('js-yaml');
const yamlPath = path.join(docsDir, 'openapi.yaml');
fs.writeFileSync(yamlPath, yaml.dump(specs));
console.log(`✅ OpenAPI YAML specification exported to: ${yamlPath}`);

// Export version-specific documentation
const package = require('../package.json');
const version = package.version;
const versionDir = path.join(docsDir, `v${version}`);
if (!fs.existsSync(versionDir)) {
  fs.mkdirSync(versionDir, { recursive: true });
}

const versionJsonPath = path.join(versionDir, 'openapi.json');
fs.writeFileSync(versionJsonPath, JSON.stringify(specs, null, 2));
console.log(`✅ Version-specific documentation exported to: ${versionJsonPath}`);

console.log(`\n📚 Documentation generation complete for version ${version}`);
console.log(`📖 Access interactive docs at: http://localhost:3000/api-docs`);
