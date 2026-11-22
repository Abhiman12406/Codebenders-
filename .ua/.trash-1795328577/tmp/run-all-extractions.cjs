const fs = require('fs');
const { execSync } = require('child_process');

const pluginRoot = 'C:/Users/Asus/.understand-anything-plugin';
const skillDir = `${pluginRoot}/skills/understand`;
const projectRoot = 'C:/Users/Asus/Desktop/Codebenders';
const uaDir = `${projectRoot}/.ua`;

const batchesData = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/batches.json`, 'utf8'));

for (const batch of batchesData.batches) {
  const idx = batch.batchIndex;
  const inputPath = `${uaDir}/tmp/ua-file-analyzer-input-${idx}.json`;
  const outputPath = `${uaDir}/tmp/ua-file-extract-results-${idx}.json`;

  const input = {
    projectRoot,
    batchFiles: batch.files,
    batchImportData: batch.batchImportData || {}
  };

  fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));

  try {
    execSync(`node "${skillDir}/extract-structure.mjs" "${inputPath}" "${outputPath}"`, { stdio: 'pipe' });
    console.log(`Batch ${idx} extracted successfully.`);
  } catch (err) {
    console.error(`Batch ${idx} extraction failed:`, err.message);
  }
}
