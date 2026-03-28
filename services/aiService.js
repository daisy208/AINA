const INCIDENT_TYPES = ["verbal", "physical", "financial", "threat"];

function parseGeminiJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

async function analyzeIncidentText(text) {
  if (!text) {
    return null;
  }

  // Graceful fallback if API key is not configured.
  if (!process.env.GEMINI_API_KEY) {
    return {
      category: "verbal",
      who: "unknown",
      when: "unknown",
      type: "verbal",
      severityScore: 3,
      source: "fallback"
    };
  }

  const prompt = `You are a safety incident classifier.\nReturn strict JSON with keys: category, who, when, type, severityScore.\nAllowed category/type values: verbal, physical, financial, threat.\nseverityScore must be integer 1-10.\nText: ${text}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const body = await response.json();
  const raw = body?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) {
    throw new Error('Gemini returned empty response');
  }

  const parsed = parseGeminiJson(raw);

  return {
    category: INCIDENT_TYPES.includes(parsed.category) ? parsed.category : 'verbal',
    who: parsed.who || 'unknown',
    when: parsed.when || 'unknown',
    type: INCIDENT_TYPES.includes(parsed.type) ? parsed.type : 'verbal',
    severityScore: Math.max(1, Math.min(10, Number(parsed.severityScore) || 1)),
    source: 'gemini',
    raw: parsed
  };
}

module.exports = { analyzeIncidentText };
