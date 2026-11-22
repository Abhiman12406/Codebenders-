const fs = require('fs');

const scanFiles = JSON.parse(fs.readFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/tmp/ua-scan-files.json', 'utf8'));
const importMapOutput = JSON.parse(fs.readFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/tmp/ua-import-map-output.json', 'utf8'));

const languages = Object.keys(scanFiles.stats.byLanguage).sort();

const scanResult = {
  name: "studioflow",
  description: "StudioFlow is an offline-first cash-flow and receivables tool for freelance designers featuring AR aging, What-If cash forecasting, crisis triage, and natural-language draft invoicing.",
  languages: languages,
  frameworks: ["React", "Vite", "Express", "Tailwind CSS", "Supabase", "GSAP"],
  files: scanFiles.files,
  totalFiles: scanFiles.totalFiles,
  filteredByIgnore: scanFiles.filteredByIgnore,
  estimatedComplexity: scanFiles.estimatedComplexity,
  importMap: importMapOutput.importMap
};

fs.writeFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/intermediate/scan-result.json', JSON.stringify(scanResult, null, 2));
console.log('scan-result.json written successfully. Total files:', scanResult.totalFiles);
