const fs = require('fs');

const uaDir = 'C:/Users/Asus/Desktop/Codebenders/.ua';
const scanResult = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/scan-result.json`, 'utf8'));
const assembledGraph = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/assembled-graph.json`, 'utf8'));
const layers = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/layers.json`, 'utf8'));
const tour = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/tour.normalized.json`, 'utf8'));

const gitCommitHash = "2a8d7d0f01cdbe77e486186ba4ea60cb001620fc";

const fullGraph = {
  version: "1.0.0",
  project: {
    name: scanResult.name,
    languages: scanResult.languages,
    frameworks: scanResult.frameworks,
    description: scanResult.description,
    analyzedAt: new Date().toISOString(),
    gitCommitHash: gitCommitHash
  },
  nodes: assembledGraph.nodes,
  edges: assembledGraph.edges,
  layers: layers,
  tour: tour
};

fs.writeFileSync(`${uaDir}/intermediate/assembled-graph.json`, JSON.stringify(fullGraph, null, 2));
console.log('Full KnowledgeGraph assembled with', fullGraph.nodes.length, 'nodes,', fullGraph.edges.length, 'edges,', fullGraph.layers.length, 'layers,', fullGraph.tour.length, 'tour steps.');
