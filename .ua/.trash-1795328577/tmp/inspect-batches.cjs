const fs = require('fs');
const b = JSON.parse(fs.readFileSync('C:/Users/Asus/Desktop/Codebenders/.ua/intermediate/batches.json', 'utf8'));
console.log('Total batches:', b.batches.length);
b.batches.forEach((batch, i) => {
  console.log(`Batch ${batch.batchIndex}: ${batch.files.length} files -> ${batch.files.slice(0, 3).map(f => f.path).join(', ')}${batch.files.length > 3 ? '...' : ''}`);
});
