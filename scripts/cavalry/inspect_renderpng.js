const fs = require('fs');
const buf = fs.readFileSync('C:/Program Files/Cavalry/ExtensionLayer.dll');
const str = buf.toString('latin1');
const idx = 25969378;
console.log('Before:');
console.log(str.slice(idx - 150, idx));
console.log('After:');
console.log(str.slice(idx, idx + 150));
