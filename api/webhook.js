// api/webhook.js
import Stripe from "stripe";
import redis from "../lib/redis.js";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function bufferToString(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  try {
    const sig = req.headers["stripe-signature"];
    const raw = await bufferToString(req);
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, secret);
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 🎉 EVENTO: Compra concluída
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✔ checkout.session.completed:", session.customer_email);
    }

    // 💰 EVENTO: Fatura paga (inclui compra e renovação)
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;

      const priceId = invoice?.lines?.data?.[0]?.price?.id;

      // Preço / plano do Stripe
      const BASIC = process.env.STRIPE_BASIC_PLAN_ID;
      const PRO = process.env.STRIPE_PRO_PLAN_ID;
      const STUDIO = process.env.STRIPE_STUDIO_PLAN_ID;

      let creditsToAdd = 0;

      if (priceId === BASIC) creditsToAdd = 100;
      if (priceId === PRO) creditsToAdd = 500;
      if (priceId === STUDIO) creditsToAdd = 1500;

      if (creditsToAdd === 0) {
        console.log("⚠ invoice.paid ignorado (priceId não encontrado)", priceId);
        return res.status(200).json({ ignored: true });
      }

      // Email do cliente
      let email = invoice.customer_email;

      if (!email && invoice.customer) {
        const customer = await stripe.customers.retrieve(invoice.customer);
        email = customer.email;
      }

      if (!email) {
        console.log("⚠ invoice.paid sem email, ignorado.");
        return res.status(200).json({ ignored: true });
      }

      email = email.toLowerCase();

      const key = `credits:email:${email}`;
      const currentCredits = Number((await redis.get(key)) || 0);

      await redis.set(key, String(currentCredits + creditsToAdd));

      console.log(`✅ +${creditsToAdd} créditos adicionados para ${email}`);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).send(`Webhook handler error: ${err.message}`);
  }
}
