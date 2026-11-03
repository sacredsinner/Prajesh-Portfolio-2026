const fs = require('fs');
const buf = fs.readFileSync('C:/Program Files/Cavalry/Api.dll');
const str = buf.toString('latin1');

// Search for error string about setOutFrame argument count
const idx = str.indexOf('setOutFrame');
console.log('Search around setOutFrame for type signatures:');
const slice = str.slice(idx - 2000, idx + 2000);
// Look for arg strings
const matches = slice.match(/Expected \d+ but got/g);
console.log('Arg count patterns:', matches);
