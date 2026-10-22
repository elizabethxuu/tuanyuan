// Tuányuán: writes the closing reflection from the visitor's own answers.
// The prompt is built here, on the server, from validated inputs only; the browser never sends a prompt.
// Needs the environment variable ANTHROPIC_API_KEY. Optional: ANTHROPIC_MODEL.

const PHASES = ["new moon", "waxing crescent", "first quarter", "waxing gibbous", "full moon", "waning gibbous", "last quarter", "waning crescent"];
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const QUESTIONS = ["What are you ready to begin?", "What are you growing toward?", "Who, or what, makes you feel whole?", "What are you ready to set down?"];

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "Reflection is not configured" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  const phase = Number(body && body.phase), sign = Number(body && body.sign);
  const answers = Array.isArray(body && body.answers) ? body.answers.slice(0, 4) : [];
  if (!Number.isInteger(phase) || phase < 0 || phase > 7 || !Number.isInteger(sign) || sign < 0 || sign > 11) {
    return res.status(400).json({ error: "Invalid moon" });
  }
  const pairs = QUESTIONS.map((q, i) => ({ q, a: typeof answers[i] === "string" ? answers[i].trim().slice(0, 600) : "" })).filter(x => x.a);
  if (!pairs.length) return res.status(400).json({ error: "Nothing to reflect on" });

  const prompt = `You are writing one short reflection inside a quiet Mid-Autumn ritual app called Tuányuán (团圆, "reunion; roundness"). Its idea: the moon is always whole; we only experience it in phases.

FIXED CONTEXT (already calculated by the app; do not recalculate, correct, or add any astronomical or astrological detail):
- Birth moon phase: ${PHASES[phase]}
- Birth moon sign: ${SIGNS[sign]}

THE PERSON'S OWN WORDS:
${pairs.map(x => `Q: ${x.q}\nA: ${x.a}`).join("\n\n")}

WRITE a reflection of 80 to 120 words that:
- speaks to them as "you", in calm, plain, literary English
- mirrors their own words and images back, noticing the thread between their answers
- treats what they want to set down or what feels unfinished as part of their wholeness, not a flaw
- may touch the moon and their birth phase lightly, as image rather than meaning
- does NOT predict anything, give advice or steps, diagnose, use horoscope or therapy language, or invent facts about their life
- if their words carry grief or pain, acknowledge it simply and without fixing it
Return only the reflection as plain prose in one or two short paragraphs. No title, no quotation marks around the whole, no sign-off.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5", max_tokens: 400, messages: [{ role: "user", content: prompt }] })
    });
    if (!r.ok) return res.status(502).json({ error: "The reflection could not be written" });
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    if (!text) return res.status(502).json({ error: "Empty reflection" });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ text });
  } catch {
    return res.status(502).json({ error: "The reflection could not be written" });
  }
};
