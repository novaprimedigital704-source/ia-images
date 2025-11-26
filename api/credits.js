import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function handler(req, res) {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const key = `credits:${ip}`;

    let credits = await redis.get(key);

    // Se não existe → cria o plano gratuito com 10 créditos
    if (credits === null) {
      credits = 10;
      await redis.set(key, credits);
    }

    return res.status(200).json({ credits });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
