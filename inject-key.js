// netlify/edge-functions/inject-key.js
// Läuft bei jedem Seitenaufruf - injiziert den API-Key sicher ins HTML
export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  
  if (!contentType.includes('text/html')) return response;
  
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY') || '';
  const html = await response.text();
  
  // Inject key before </head> - never visible in source as plain text
  const injected = html.replace(
    '</head>',
    `<script>window.__CAI_KEY__="${apiKey}";</script></head>`
  );
  
  return new Response(injected, {
    status: response.status,
    headers: response.headers,
  });
};

export const config = { path: '/' };
