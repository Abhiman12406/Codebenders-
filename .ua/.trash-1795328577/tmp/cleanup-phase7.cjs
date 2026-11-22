const fs = require('fs');
const path = require('path');

const uaDir = 'C:/Users/Asus/Desktop/Codebenders/.ua';
const gitCommitHash = '2a8d7d0f01cdbe77e486186ba4ea60cb001620fc';

// 3. Write meta.json
const meta = {
  lastAnalyzedAt: new Date().toISOString(),
  gitCommitHash: gitCommitHash,
  version: "1.0.0",
  analyzedFiles: 87
};
fs.writeFileSync(`${uaDir}/meta.json`, JSON.stringify(meta, null, 2));
console.log('meta.json written successfully.');

// 4. Move scratch/intermediate files into .trash-<timestamp>, preserving scan-result.json
const timestamp = Math.floor(Date.now() / 1000);
const trashDir = `${uaDir}/.trash-${timestamp}`;
fs.mkdirSync(trashDir, { recursive: true });

const intermediateDir = `${uaDir}/intermediate`;
if (fs.existsSync(intermediateDir)) {
  const items = fs.readdirSync(intermediateDir);
  for (const item of items) {
    if (item !== 'scan-result.json') {
      const src = path.join(intermediateDir, item);
      const dst = path.join(trashDir, item);
      try {
        fs.renameSync(src, dst);
      } catch (e) {
        // Fallback copy & delete
        fs.cpSync(src, dst, { recursive: true, force: true });
        fs.rmSync(src, { recursive: true, force: true });
      }
    }
  }
}

const tmpDir = `${uaDir}/tmp`;
if (fs.existsSync(tmpDir)) {
  const dst = path.join(trashDir, 'tmp');
  try {
    fs.renameSync(tmpDir, dst);
  } catch (e) {
    fs.cpSync(tmpDir, dst, { recursive: true, force: true });
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

console.log(`Cleaned up intermediate files into ${trashDir}, preserved scan-result.json.`);
