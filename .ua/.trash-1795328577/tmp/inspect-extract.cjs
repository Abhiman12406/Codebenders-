const fs = require('fs');

const res1 = JSON.parse(fs.readFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/tmp/ua-file-extract-results-1.json', 'utf8'));
console.log('Batch 1 results count:', res1.results.length);
res1.results.slice(0, 3).forEach(r => {
  console.log('File:', r.path, 'category:', r.fileCategory, 'funcs:', r.functions ? r.functions.length : 0, 'exports:', r.exports ? r.exports.length : 0);
  if (r.functions && r.functions.length) {
    console.log('  Functions sample:', r.functions.slice(0, 3).map(f => `${f.name} (${f.startLine}-${f.endLine})`).join(', '));
  }
});
