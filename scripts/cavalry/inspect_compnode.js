const fs = require('fs');
const buf = fs.readFileSync('C:/Program Files/Cavalry/Core.dll');
const str = buf.toString('latin1');

let idx = 0;
while ((idx = str.indexOf('compNode', idx)) !== -1) {
  console.log(str.slice(idx - 40, idx + 80).replace(/[^a-zA-Z0-9_\(\)\,\.\:\; ]/g, ' '));
  idx += 8;
  if (idx > 20000000) break;
}
