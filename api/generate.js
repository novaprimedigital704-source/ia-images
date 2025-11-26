// api/generate.js
import redis from "../lib/redis.js";
import { Buffer } from "buffer";

const MODEL = process.env.HF_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido." });

  try {
    const { prompt, options, email } = req.body || {};

    if (!prompt || !email)
      return res.status(400).json({ error: "Prompt e email são obrigatórios." });

    const userEmail = email.toLowerCase();
    const key = `credits:email:${userEmail}`;

    // Garantir créditos iniciais
    let credits = await redis.get(key);
    if (credits === null) {
      credits = "10";                 // sempre string
      await redis.set(key, credits);
    }

    credits = Number(credits);

    if (credits <= 0) {
      return res.status(402).json({
        error: "Sem créditos",
        needCredits: true,
        credits: 0,
      });
    }

    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    if (!HF_TOKEN)
      return res.status(500).json({ error: "HUGGINGFACE_TOKEN não configurado." });

    const payload = {
      inputs: prompt,
      parameters: {
        width: options?.width || 1024,
        height: options?.height || 1024,
        num_inference_steps: options?.num_inference_steps || 45,
        guidance_scale: options?.guidance_scale || 9,
        negative_prompt:
          options?.negative_prompt ||
          "low quality, blurry, deformed, watermark, text, bad anatomy, extra limbs",
      },
    };

    const hfRes = await fetch(
      `https://router.huggingface.co/hf-inference/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const contentType = hfRes.headers.get("content-type") || "";

    // Se veio erro JSON
    if (contentType.includes("application/json")) {
      const json = await hfRes.json();
      return res.status(500).json({
        error: json.error || json,
      });
    }

    if (!hfRes.ok) {
      const txt = await hfRes.text();
      return res.status(500).json({
        error: "Erro da HuggingFace: " + txt,
      });
    }

    const arrayBuffer = await hfRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Desconta crédito (sempre string)
    await redis.set(key, String(credits - 1));

    return res.status(200).json({
      imageUrl: `data:image/png;base64,${base64}`,
      credits: credits - 1,
    });

  } catch (err) {
    console.error("generate error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
