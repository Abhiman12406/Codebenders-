const fs = require('fs');

const uaDir = 'C:/Users/Asus/Desktop/Codebenders/.ua';
const projectRoot = 'C:/Users/Asus/Desktop/Codebenders';
const gitCommitHash = '2a8d7d0f01cdbe77e486186ba4ea60cb001620fc';

// 1. Write final knowledge graph
fs.copyFileSync(`${uaDir}/intermediate/assembled-graph.json`, `${uaDir}/knowledge-graph.json`);
console.log('Saved knowledge-graph.json');

// Move code lessons
fs.copyFileSync(`${uaDir}/intermediate/code-lessons.normalized.json`, `${uaDir}/code-lessons.json`);
console.log('Published code-lessons.json');

// 2. Prepare fingerprint input
const scanResult = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/scan-result.json`, 'utf8'));
const filePaths = scanResult.files.map(f => f.path);

const fingerprintInput = {
  projectRoot,
  filePaths,
  gitCommitHash
};

fs.writeFileSync(`${uaDir}/intermediate/fingerprint-input.json`, JSON.stringify(fingerprintInput, null, 2));
console.log('Fingerprint input prepared for', filePaths.length, 'files.');
