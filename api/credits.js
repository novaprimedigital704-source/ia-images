// api/credits.js
import Stripe from "stripe";
import redis from "../lib/redis.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Domínios descartáveis conhecidos
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

export default async function handler(req, res) {
  try {
    const { session_id } = req.body || {};

    if (!session_id) {
      return res.status(400).json({ error: "session_id é obrigatório." });
    }

    // 🔒 Valida sessão real no Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (err) {
      return res.status(400).json({ error: "session_id inválido." });
    }

    const email = session.customer_details?.email;

    if (!email) {
      return res.status(400).json({ error: "Não foi possível obter email do Stripe." });
    }

    const normalizedEmail = email.toLowerCase();

    // 🚫 Anti-fraude: bloquear emails descartáveis
    if (isDisposableEmail(normalizedEmail)) {
      return res.status(403).json({
        error: "Emails descartáveis não são permitidos nesta plataforma."
      });
    }

    const creditsKey = `credits:email:${normalizedEmail}`;
    const bonusKey = `initial_bonus_given:${normalizedEmail}`;

    // Consultar créditos
    let credits = await redis.get(creditsKey);

    // Consultar se já recebeu bônus inicial
    const alreadyGotBonus = await redis.get(bonusKey);

    if (credits === null) {
      credits = 0;
    }

    // Conceder bônus inicial APENAS 1 VEZ
    if (!alreadyGotBonus) {
      credits += 10; // bônus inicial
      await redis.set(bonusKey, "true");
    }

    await redis.set(creditsKey, String(credits));

    return res.status(200).json({
      email: normalizedEmail,
      credits
    });

  } catch (err) {
    console.error("credits error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
