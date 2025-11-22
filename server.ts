// Atualização
// bun --no-warnings --watch server.mjs

/* 
curl --location --request POST 'http://localhost:3000/cor?cor=teste' \
--header 'Content-Type: application/json' \
--data-raw '{}'
*/

import { serve } from 'bun';

/* NOTA - forma de definir rotas com BUN */
const routes_2 = {
  '/mundo': () =>
    new Response(JSON.stringify({ ola: 'mundo' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
};

const server = serve({
  /* NOTA - rotas podem ser usadas em um objeto na função serve */

  routes: {
    '/ola': () => new Response('Ola'),
    ...routes_2,
  },

  async fetch(req) {
    const url = new URL(req.url, 'http://localhost:3000');

    const pathname = url.pathname;

    const cor_1 = url.searchParams.get('cor');

    // NOTA - HEADERS de request -->
    /* console.log(req.headers); */
    /* console.log(req.headers.get('content-type')); // Content type */
    // <-- HEADERS de request

    // NOTA - Obtenção do body por Buffer/ chunks -->
    /* const chunks = [];
    if (req.body) {
      for await (const chunk of req.body) {
        chunks.push(chunk);
      }
    }
    let body = Buffer.concat(chunks).toString('utf-8'); */
    // <-- Obtenção do body por Buffer/ chunks

    if (req.method === 'GET' && pathname === '/') {
      return new Response(JSON.stringify({ data: 'Bem vindo ao BUN - Home' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Methods': 'POST, GET',
        },
      });
      // NOTA - ou com parse direto para JSON
      /* return Response.json({ data: 'Bem vindo ao BUN' }); */
    }

    if (req.method === 'POST' && pathname === '/cor') {
      // NOTA - Obtenção do body por Buffer/ chunks -->
      /* const { cor_2 } = JSON.parse(body); */
      // <-- Obtenção do body por Buffer/ chunks

      // NOTA - Mas pode o body ser obtido também por
      const { cor_2 } = (await req.json()) as { cor_2: string };
      return new Response(JSON.stringify({ cor_1, cor_2 }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Methods': 'POST, GET',
        },
      });
    }

    return new Response('Not found', {
      status: 404,
    });
  },
});

console.log('Server running at ' + server.url);
