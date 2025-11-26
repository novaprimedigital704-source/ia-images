// api/credits.js
import redis from "../lib/redis.js";

export default async function handler(req, res) {
  try {
    const email =
      (req.body && req.body.email) ||
      (req.query && req.query.email);

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email é obrigatório." });
    }

    const key = `credits:email:${email.toLowerCase()}`;

    let credits = await redis.get(key);

    if (credits === null) {
      // Créditos iniciais apenas uma vez
      credits = "10";
      await redis.set(key, credits);
    }

    return res.status(200).json({ credits: Number(credits) });
  } catch (err) {
    console.error("credits error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
