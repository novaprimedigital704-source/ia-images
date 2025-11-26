// api/checkout.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Emails descartáveis
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
    let { plan, priceId, email } = req.body || {};

    // Normalizar email
    if (!email)
      return res.status(400).json({ error: "Email é obrigatório." });

    email = email.toLowerCase().trim();

    // Bloquear descartáveis
    if (isDisposableEmail(email)) {
      return res.status(403).json({
        error: "Emails temporários ou descartáveis não são permitidos."
      });
    }

    // Se veio "plan", converter para priceId
    const priceMap = {
      basic: process.env.STRIPE_BASIC_PLAN_ID,
      pro: process.env.STRIPE_PRO_PLAN_ID,
      studio: process.env.STRIPE_STUDIO_PLAN_ID,
    };

    if (!priceId && plan) {
      priceId = priceMap[plan];
    }

    if (!priceId) {
      return res.status(400).json({
        error: "priceId ou plano inválido."
      });
    }

    const origin =
      req.headers.origin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURICompo
