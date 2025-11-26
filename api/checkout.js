// api/checkout.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Emails descartáveis conhecidos
const disposableDomains = new Set([
  "mailinator.com", "tempmail.com", "10minutemail.com",
  "guerrillamail.com", "yopmail.com", "sharklasers.com",
  "trashmail.com", "dispostable.com", "fakeinbox.com",
  "getnada.com", "maildrop.cc", "spamgourmet.com",
  "mohmal.com", "linshiyouxiang.net"
]);

function isDisposableEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomains.has(domain);
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido." });

  try {
    const { priceId, email } = req.body || {};

    if (!priceId)
      return res.status(400).json({ error: "priceId é obrigatório." });

    if (!email)
      return res.status(400).json({ error: "email é obrigatório." });

    const normalizedEmail = email.toLowerCase().trim();

    // 🚫 Anti-fraude: bloquear emails descartáveis
    if (isDisposableEmail(normalizedEmail)) {
      return res.status(403).json({
        error: "Emails temporários/descartáveis não são permitidos."
      });
    }

    // 🔒 Origem confiável (Vercel / localhost)
    const origin =
      req.headers.origin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    console.log("📦 Criando checkout:", {
      email: normalizedEmail,
      priceId,
      origin
    });

    // Criar checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: normalizedEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(
        normalizedEmail
      )}`,
      cancel_url: `${origin}/cancel`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("❌ checkout error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
