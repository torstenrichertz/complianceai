// netlify/functions/claude.js
// ─────────────────────────────────────────────
// Serverless proxy — versteckt den Anthropic API-Key vor dem Browser.
// Der Key steht nur in Netlify Environment Variables, nie im Frontend-Code.
//
// SETUP:
// 1. Diese Datei in netlify/functions/claude.js speichern
// 2. In Netlify Dashboard → Site Settings → Environment Variables:
//    ANTHROPIC_API_KEY = sk-ant-... (Ihr echter Key)
// 3. Deploy — fertig. Frontend ruft /api/claude auf, nie direkt Anthropic.
// ─────────────────────────────────────────────

exports.handler = async (event) => {

  // Nur POST erlauben
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS — erlaubt Anfragen von Ihrer eigenen Domain
  const headers = {
    'Access-Control-Allow-Origin': '*',   // Produktiv: durch 'https://complianceai.de' ersetzen
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // API Key aus Umgebungsvariable — NIEMALS hardcoden
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key not configured. Bitte ANTHROPIC_API_KEY in Netlify setzen.' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Sicherheit: Nur erlaubte Felder weiterleiten
    const payload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: body.max_tokens || 2000,
      messages: body.messages,
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
