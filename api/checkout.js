// api/checkout.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { priceId, email } = req.body || {};

    if (!priceId || !email) {
      return res.status(400).json({ error: "priceId e email são obrigatórios." });
    }

    // fallback safe para evitar erro no Vercel
    const origin =
      req.headers.origin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${origin}/cancel`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("checkout error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
