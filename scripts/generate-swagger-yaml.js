const YAML = require('yamljs');
const swaggerSpec = require('../src/swagger/swagger');
const fs = require('fs');
const path = require('path');

try {
  // Convert JSON to YAML
  const yamlString = YAML.stringify(swaggerSpec, 10, 2);

  // Write to file
  const outputPath = path.join(__dirname, '..', 'docs', 'api.yaml');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, yamlString, 'utf8');

  console.log('✅ Swagger YAML documentation generated successfully!');
  console.log(`📄 File saved to: ${outputPath}`);

  // Also generate JSON version
  const jsonOutputPath = path.join(__dirname, '..', 'docs', 'api.json');
  fs.writeFileSync(jsonOutputPath, JSON.stringify(swaggerSpec, null, 2), 'utf8');
  console.log(`📄 JSON file saved to: ${jsonOutputPath}`);

} catch (error) {
  console.error('❌ Error generating swagger documentation:', error);
  process.exit(1);
}
