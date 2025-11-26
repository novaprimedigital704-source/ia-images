// api/generate.js
import Stripe from "stripe";
import redis from "../lib/redis.js";
import { Buffer } from "buffer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Domínios descartáveis
const disposableDomains = new Set([
  "mailinator.com", "tempmail.com", "10minutemail.com",
  "guerrillamail.com", "yopmail.com", "sharklasers.com",
  "trashmail.com", "dispostable.com", "fakeinbox.com",
  "getnada.com", "maildrop.cc", "spamgourmet.com",
  "mohmal.com", "linshiyouxiang.net"
]);

function isDisposableEmail(email) {
  const domain = email.split("@")[1].toLowerCase();
  return disposableDomains.has(domain);
}

const MODEL = process.env.HF_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido." });

  try {
    const { prompt, options, session_id } = req.body || {};

    if (!prompt || !session_id)
      return res.status(400).json({ error: "prompt e session_id são obrigatórios." });

    // 📌 1. Validar sessão real do Stripe (identidade segura)
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch {
      return res.status(400).json({ error: "session_id inválido." });
    }

    const email = session.customer_details?.email;
    if (!email)
      return res.status(400).json({ error: "Não foi possível obter email do Stripe." });

    const userEmail = email.toLowerCase();

    // 🚫 2. Bloquear email descartável
    if (isDisposableEmail(userEmail)) {
      return res.status(403).json({
        error: "Emails descartáveis não são permitidos para geração de imagens."
      });
    }

    // 📌 3. Buscar créditos do usuário
    const key = `credits:email:${userEmail}`;
    let credits = Number((await redis.get(key)) || 0);

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

    // 📌 4. Payload da IA
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

    // 📌 5. Enviar para HuggingFace
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

    if (contentType.includes("application/json")) {
      const json = await hfRes.json();
      return res.status(500).json({ error: json.error || json });
    }

    if (!hfRes.ok) {
      const txt = await hfRes.text();
      return res.status(500).json({ error: "Erro da HuggingFace: " + txt });
    }

    // 📌 6. Converter imagem
    const arrayBuffer = await hfRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // 📌 7. Descontar crédito
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
