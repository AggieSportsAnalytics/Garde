export function errorHandler(error) {
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
