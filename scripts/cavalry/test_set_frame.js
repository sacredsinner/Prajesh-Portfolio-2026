const http = require('http');
const fs = require('fs');
const path = require('path');

const targetPath = "C:/Users/blcne/Documents/GitHub/Prajesh-Portfolio-2026/scripts/cavalry/showreel/renders/test_real_scene02.png";
if (fs.existsSync(targetPath)) {
  fs.unlinkSync(targetPath);
}

// In Cavalry, let's see what api.setFrame does
const cavalryScript = `
api.setFrame(360);
api.renderPNGFrame("${targetPath.replace(/\\/g, '/')}", 100);
`;

const req = http.request('http://127.0.0.1:8080/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Stallion:', body);
    setTimeout(() => {
      if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        console.log('Render created! Size:', stats.size);
      } else {
        console.log('File not created.');
      }
    }, 2000);
  });
});

req.write(JSON.stringify({ type: 'script', code: cavalryScript }));
req.end();
