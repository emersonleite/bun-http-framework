const resp = await fetch('http://localhost:3000/cor?cor=verde', {
  method: 'POST',
  body: JSON.stringify({ cor_2: 'azul' }),
});

const body = await resp.json();

console.log(body);
