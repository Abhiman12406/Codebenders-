const fs = require('fs');

const batches = JSON.parse(fs.readFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/intermediate/batches.json', 'utf8')).batches;
const batch1 = batches.find(b => b.batchIndex === 1);

const input = {
  projectRoot: 'C:/Users/Asus/Desktop/Codebenders',
  batchFiles: batch1.files,
  batchImportData: batch1.batchImportData || {}
};

fs.writeFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/tmp/ua-file-analyzer-input-1.json', JSON.stringify(input, null, 2));
console.log('Batch 1 input written. Files:', batch1.files.length);
