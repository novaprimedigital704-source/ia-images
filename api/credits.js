// api/credits.js
import redis from "../lib/redis.js";

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
    const email = req.body?.email || req.query?.email;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório." });
    }

    const normalizedEmail = email.toLowerCase();

    // Anti-fraude: bloquear e-mails descartáveis
    if (isDisposableEmail(normalizedEmail)) {
      return res.status(403).json({
        error: "Emails descartáveis não são permitidos nesta plataforma."
      });
    }

    const creditsKey = `credits:email:${normalizedEmail}`;
    const bonusKey = `initial_bonus_given:${normalizedEmail}`;

    let credits = await redis.get(creditsKey);
    const alreadyGotBonus = await redis.get(bonusKey);

    if (credits === null) credits = 0;

    // Adiciona 10 créditos apenas 1 vez
    if (!alreadyGotBonus) {
      credits += 10;
      await redis.set(bonusKey, "true");
    }

    await redis.set(creditsKey, String(credits));

    return res.status(200).json({
      email: normalizedEmail,
      credits,
    });

  } catch (err) {
    console.error("credits error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
