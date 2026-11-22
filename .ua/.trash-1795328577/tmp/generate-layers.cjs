const fs = require('fs');

const uaDir = 'C:/Users/Asus/Desktop/Codebenders/.ua';
const graph = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/assembled-graph.json`, 'utf8'));

const fileLevelTypes = new Set(['file', 'config', 'document', 'service', 'pipeline', 'table', 'schema', 'resource', 'endpoint']);
const fileNodes = graph.nodes.filter(n => fileLevelTypes.has(n.type));

const layers = [
  {
    id: 'layer:frontend-ui',
    name: 'Frontend UI Components',
    description: 'React UI components, modals, visual effects, and main application layouts.',
    nodeIds: []
  },
  {
    id: 'layer:frontend-services',
    name: 'Client Services & State',
    description: 'Offline-first data sync service, API client wrappers, client-side forecast math, and seed data.',
    nodeIds: []
  },
  {
    id: 'layer:backend-api',
    name: 'Backend API & Storage',
    description: 'Express server entry point, modular route handlers, and local JSON database persistence.',
    nodeIds: []
  },
  {
    id: 'layer:business-engines',
    name: 'Financial & NLP Engines',
    description: 'Core domain calculation engines for cash flow forecasting and natural language draft invoice parsing.',
    nodeIds: []
  },
  {
    id: 'layer:testing-qa',
    name: 'Testing & Verification',
    description: 'Automated test suites covering API endpoints, calculation algorithms, and end-to-end user flows.',
    nodeIds: []
  },
  {
    id: 'layer:config-tooling',
    name: 'Configuration & Build Tooling',
    description: 'Vite build config, Tailwind styling, package manifests, and environment settings.',
    nodeIds: []
  },
  {
    id: 'layer:documentation-specs',
    name: 'Documentation & Product Specs',
    description: 'Architecture specifications, product requirements, design guidelines, and task plans.',
    nodeIds: []
  }
];

const layerMap = new Map();
layers.forEach(l => layerMap.set(l.id, l));

for (const node of fileNodes) {
  const p = node.filePath || '';
  let targetLayer = 'layer:config-tooling';

  if (p.startsWith('src/components/') || p === 'src/App.jsx' || p === 'src/main.jsx' || p === 'index.html' || p === 'src/index.css') {
    targetLayer = 'layer:frontend-ui';
  } else if (p.startsWith('src/lib/') || p.startsWith('src/data/')) {
    targetLayer = 'layer:frontend-services';
  } else if (p.startsWith('server/engine/')) {
    targetLayer = 'layer:business-engines';
  } else if (p.startsWith('server/routes/') || p === 'server/index.js' || p === 'server/store.js' || p.startsWith('server/data/')) {
    targetLayer = 'layer:backend-api';
  } else if (p.includes('test') || p.startsWith('scratch/')) {
    targetLayer = 'layer:testing-qa';
  } else if (node.type === 'document' || p.endsWith('.md') || p.startsWith('docs/') || p.startsWith('tasks/') || p.startsWith('references/')) {
    targetLayer = 'layer:documentation-specs';
  } else if (node.type === 'config' || p.endsWith('.config.js') || p.endsWith('.json') || p.startsWith('.')) {
    targetLayer = 'layer:config-tooling';
  }

  layerMap.get(targetLayer).nodeIds.push(node.id);
}

// Remove empty layers if any
const finalLayers = layers.filter(l => l.nodeIds.length > 0);

console.log('Total file nodes:', fileNodes.length);
finalLayers.forEach(l => console.log(`${l.name} (${l.id}): ${l.nodeIds.length} nodes`));

fs.writeFileSync(`${uaDir}/intermediate/layers.json`, JSON.stringify(finalLayers, null, 2));
console.log('layers.json written successfully.');
