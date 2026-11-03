const fs = require('fs');
const path = 'C:/Users/blcne/AppData/Roaming/Cavalry/Recovery/ebb9ee49-d3df-4d1c-8bf3-1d1c527e35a7/snapshot.cv';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const groups = data.nodes.filter(n => n.nodeType === 'group');
console.log('Total groups in scene:', groups.length);
groups.forEach(g => {
  const name = g.attributes.niceName ? g.attributes.niceName.value : 'unnamed';
  console.log(` - Group: ${g.nodeId} -> ${name}`);
});
