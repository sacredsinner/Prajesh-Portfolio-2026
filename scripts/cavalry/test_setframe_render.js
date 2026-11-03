const http = require('http');
const fs = require('fs');

const script = `
api.setFrame(80);
api.renderPNGFrame("C:/Users/blcne/Documents/GitHub/Prajesh-Portfolio-2026/scripts/cavalry/showreel/renders/test_frame80.png", 100);

api.setFrame(360);
api.renderPNGFrame("C:/Users/blcne/Documents/GitHub/Prajesh-Portfolio-2026/scripts/cavalry/showreel/renders/test_frame360.png", 100);
`;

const req = http.request('http://127.0.0.1:8080/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Stallion Response:', body);
    setTimeout(() => {
      const f80 = fs.existsSync('scripts/cavalry/showreel/renders/test_frame80.png');
      const f360 = fs.existsSync('scripts/cavalry/showreel/renders/test_frame360.png');
      console.log('Frame 80 exists:', f80);
      console.log('Frame 360 exists:', f360);
      if (f80 && f360) {
        const b80 = fs.readFileSync('scripts/cavalry/showreel/renders/test_frame80.png');
        const b360 = fs.readFileSync('scripts/cavalry/showreel/renders/test_frame360.png');
        console.log('Frame 80 size:', b80.length);
        console.log('Frame 360 size:', b360.length);
        console.log('Are they DIFFERENT (animated)?', !b80.equals(b360));
      }
    }, 1500);
  });
});
req.write(JSON.stringify({ type: 'script', code: script }));
req.end();
