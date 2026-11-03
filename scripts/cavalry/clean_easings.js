const fs = require('fs');
const path = require('path');

const scenesDir = path.resolve(__dirname, 'showreel', 'scenes');
const files = fs.readdirSync(scenesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(scenesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace magicEasing on groups:
  // 1. g (the main scene group)
  content = content.replace(/api\.magicEasing\(g,\s*[^)]+\);?/g, '// magicEasing on group omitted for Cavalry compatibility');
  
  // 2. sub-groups that were causing errors
  content = content.replace(/api\.magicEasing\(ringGroup,\s*[^)]+\);?/g, '// magicEasing on ringGroup omitted');
  content = content.replace(/api\.magicEasing\(monoGroup,\s*[^)]+\);?/g, '// magicEasing on monoGroup omitted');
  content = content.replace(/api\.magicEasing\(cardGroup,\s*[^)]+\);?/g, '// magicEasing on cardGroup omitted');
  content = content.replace(/api\.magicEasing\(panelGroup,\s*[^)]+\);?/g, '// magicEasing on panelGroup omitted');
  content = content.replace(/api\.magicEasing\(toolGroup,\s*[^)]+\);?/g, '// magicEasing on toolGroup omitted');
  content = content.replace(/api\.magicEasing\(coreGroup,\s*[^)]+\);?/g, '// magicEasing on coreGroup omitted');
  content = content.replace(/api\.magicEasing\(nodeGroup,\s*[^)]+\);?/g, '// magicEasing on nodeGroup omitted');
  content = content.replace(/api\.magicEasing\(colGroup,\s*[^)]+\);?/g, '// magicEasing on colGroup omitted');
  content = content.replace(/api\.magicEasing\(domainGroup,\s*[^)]+\);?/g, '// magicEasing on domainGroup omitted');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Cleaned group magicEasing from:', file);
});
