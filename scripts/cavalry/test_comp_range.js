const http = require('http');

const testCode = `
var comp = api.getActiveComp();
console.log("Active comp:", comp);
try {
  api.setOutFrame(comp, 3000);
  console.log("setOutFrame(comp, 3000) succeeded");
} catch(e) {
  console.log("setOutFrame(comp, 3000) failed:", e.message);
  try {
    api.setOutFrame(3000);
    console.log("setOutFrame(3000) succeeded");
  } catch(e2) {
    console.log("setOutFrame(3000) failed:", e2.message);
  }
}

try {
  api.setInFrame(comp, 0);
  console.log("setInFrame(comp, 0) succeeded");
} catch(e) {
  try {
    api.setInFrame(0);
    console.log("setInFrame(0) succeeded");
  } catch(e2) {}
}

api.setFrame(0);
console.log("Set frame to 0");
`;

const req = http.request('http://127.0.0.1:8080/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let b = '';
  res.on('data', d => b += d);
  res.on('end', () => console.log('Stallion:', b));
});
req.write(JSON.stringify({ type: 'script', code: testCode }));
req.end();
