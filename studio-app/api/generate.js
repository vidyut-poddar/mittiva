// Vercel serverless function — calls Google Lyria 3 with a server-side key.
// Returns raw audio bytes (avoids the 4.5 MB base64/JSON response cap) with
// the generated lyrics passed back in the X-Song-Lyrics header (base64 UTF-8).
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'Server is missing the GEMINI_API_KEY environment variable.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  const prompt = (body.prompt || '').toString().trim();
  const model = body.model === 'lyria-3-clip-preview' ? 'lyria-3-clip-preview' : 'lyria-3-pro-preview';

  if (!prompt) { res.status(400).json({ error: 'A prompt is required.' }); return; }
  if (prompt.length > 5000) { res.status(400).json({ error: 'Prompt is too long (max 5000 characters).' }); return; }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      const msg = (data && data.error && data.error.message) || `Lyria API error (${upstream.status}).`;
      // 400 from Lyria is usually a blocked/invalid prompt -> surface as 422
      res.status(upstream.status === 400 ? 422 : upstream.status).json({ error: msg });
      return;
    }

    const content = (((data || {}).candidates || [])[0] || {}).content || {};
    const parts = content.parts || [];

    let audioB64 = null;
    let mime = 'audio/mpeg';
    const texts = [];

    for (const p of parts) {
      if (p.inlineData && p.inlineData.data) {
        audioB64 = p.inlineData.data;
        if (p.inlineData.mimeType) mime = p.inlineData.mimeType;
      } else if (p.text) {
        texts.push(p.text);
      }
    }

    if (!audioB64) {
      const fb = data && data.promptFeedback;
      const reason =
        (fb && fb.blockReason && ('Blocked by safety filters: ' + fb.blockReason)) ||
        (texts.length ? texts.join('\n') : '') ||
        'No audio was returned — the prompt may have been blocked by Lyria’s safety/compliance filters.';
      res.status(422).json({ error: typeof reason === 'string' ? reason : 'Generation was blocked.' });
      return;
    }

    const audio = Buffer.from(audioB64, 'base64');
    const lyrics = Buffer.from(texts.join('\n\n').slice(0, 8000), 'utf8').toString('base64');

    res.setHeader('Content-Type', mime);
    res.setHeader('X-Song-Mime', mime);
    res.setHeader('X-Song-Lyrics', lyrics);
    res.setHeader('X-Song-Model', model);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(audio);
  } catch (e) {
    res.status(504).json({ error: 'Upstream request to Lyria failed: ' + (e && e.message ? e.message : String(e)) });
  }
};
