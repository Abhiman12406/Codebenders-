const fs = require('fs');
const scanData = JSON.parse(fs.readFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/tmp/ua-scan-files.json', 'utf8'));
const input = {
  projectRoot: 'C:/Users/Asus/Desktop/Codebenders',
  files: scanData.files
};
fs.writeFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/tmp/ua-import-map-input.json', JSON.stringify(input, null, 2));
console.log('Import input written successfully.');
