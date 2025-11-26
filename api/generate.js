import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const MODEL = "black-forest-labs/FLUX.1-schnell";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido." });

  try {
    const { prompt } = req.body;

    if (!prompt)
      return res.status(400).json({ error: "Prompt obrigatório." });

    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    if (!HF_TOKEN)
      return res.status(500).json({ error: "HUGGINGFACE_TOKEN não configurado." });

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const key = `credits:${ip}`;

    let credits = await redis.get(key);

    if (credits === null) {
      credits = 10;
      await redis.set(key, credits);
    }

    if (credits <= 0) {
      return res.status(403).json({
        error: "Você não tem créditos suficientes.",
        needCredits: true
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/models/" + MODEL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    if (!response.ok) {
      let txt = await response.text();
      return res.status(500).json({ error: txt });
    }

    const buf = Buffer.from(await response.arrayBuffer());
    const base64 = buf.toString("base64");

    // Descontar crédito
    await redis.set(key, credits - 1);

    return res.status(200).json({
      imageUrl: `data:image/png;base64,${base64}`,
      credits: credits - 1
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
