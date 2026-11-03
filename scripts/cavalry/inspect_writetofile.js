const fs = require('fs');
const buf = fs.readFileSync('C:/Program Files/Cavalry/Api.dll');
const str = buf.toString('latin1');

const idx = str.indexOf('writeToFile');
console.log('Context of writeToFile:');
console.log(str.slice(idx - 100, idx + 100));
