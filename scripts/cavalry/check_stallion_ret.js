async function check() {
  const r = await fetch('http://127.0.0.1:8080/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'script', code: '"RETURN_VAL_12345"' })
  });
  console.log('Status:', r.status);
  console.log('Text:', await r.text());
}
check();
