const http = require('http');
const fs = require('fs');

const script = `
var comp = api.getActiveComp();
var inF = api.getInFrame(comp);
var outF = api.getOutFrame(comp);
var f = api.getFrame();
var info = "comp=" + comp + ", inFrame=" + inF + ", outFrame=" + outF + ", currentFrame=" + f;
api.writeToFile("C:/Users/blcne/Documents/GitHub/Prajesh-Portfolio-2026/test_api_write.txt", info, true);
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
      if (fs.existsSync('test_api_write.txt')) {
        console.log('File Content:', fs.readFileSync('test_api_write.txt', 'utf8'));
      } else {
        console.log('File not created yet');
      }
    }, 500);
  });
});
req.write(JSON.stringify({ type: 'script', code: script }));
req.end();
