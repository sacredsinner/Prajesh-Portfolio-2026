const http = require('http');
const fs = require('fs');
const path = require('path');

const targetPath = "C:/Users/blcne/Documents/GitHub/Prajesh-Portfolio-2026/scripts/cavalry/showreel/renders/real_frame80.png";
if (fs.existsSync(targetPath)) {
  fs.unlinkSync(targetPath);
}

const cavalryScript = `
try {
  var comp = api.getActiveComp();
  api.setFrame(80);
  api.renderPNGFrame("${targetPath.replace(/\\/g, '/')}", 100);
} catch (err) {
  // If there's an error, write it or let it throw
  throw new Error("RENDER_ERROR: " + err.message);
}
`;

const req = http.request('http://127.0.0.1:8080/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Stallion:', d);
    setTimeout(() => {
      if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        console.log('SUCCESS! File exists! Size:', stats.size);
      } else {
        console.log('File does NOT exist yet. Check logs.');
      }
    }, 2000);
  });
});
req.write(JSON.stringify({ type: 'script', code: cavalryScript }));
req.end();
