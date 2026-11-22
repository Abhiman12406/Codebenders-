const fs = require('fs');

const uaDir = 'C:/Users/Asus/Desktop/Codebenders/.ua';
const tour = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/tour.normalized.json`, 'utf8'));
const files = [];
tour.forEach(step => {
  step.nodeIds.forEach(id => {
    const p = id.replace(/^(file|document|config|service):/, '');
    files.push({ filePath: p, tourOrder: step.order, id });
  });
});
console.log('Total tour files:', files.length);
files.forEach(f => console.log(`Step ${f.tourOrder}: ${f.filePath} (${f.id})`));
