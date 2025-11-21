const resp = await fetch('http://localhost:3000/cor?cor=vermelho', {
  method: 'POST',
  body: JSON.stringify({ cor_2: 'azul' }),
});

console.log(resp);
