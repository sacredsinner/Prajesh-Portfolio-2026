const fs = require('fs');
const buf = fs.readFileSync('C:/Program Files/Cavalry/Api.dll');
const str = buf.toString('latin1');

// Look for 'api' registration or global template
const idx = str.indexOf('io.scenery.api');
console.log('io.scenery.api index:', idx);
if (idx !== -1) {
  console.log(str.slice(idx - 100, idx + 200));
}

// Also check where "writeToFile" is registered
const idx2 = str.indexOf('"writeToFile"');
console.log('"writeToFile" with quotes:', idx2);
