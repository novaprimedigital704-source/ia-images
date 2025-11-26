// lib/redis.js
import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error("❌ ERRO: Variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN não foram configuradas.");
  throw new Error("Upstash Redis não configurado.");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
