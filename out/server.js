// @bun
// server.ts
var {serve } = globalThis.Bun;
var server = serve({
  async fetch(req) {
    const url = new URL(req.url, "http://localhost:3000");
    const pathname = url.pathname;
    const cor_1 = url.searchParams.get("cor");
    if (req.method === "GET" && pathname === "/") {
      return new Response(JSON.stringify({ data: "Bem vindo ao BUN - Home" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "POST"
        }
      });
    }
    if (req.method === "POST" && pathname === "/cor") {
      const { cor_2 } = await req.json();
      return new Response(JSON.stringify({ cor_1, cor_2 }), { status: 200 });
    }
    return new Response("Not found", {
      status: 404
    });
  }
});
console.log("Server running at " + server.url);
