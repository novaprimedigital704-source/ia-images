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

    // Evento de checkout concluído
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;
      console.log("checkout.session.completed for", email);
    }

    // Evento de pagamento da fatura (renovação mensal bem-sucedida)
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;

      // Price ID
      const priceId = invoice?.lines?.data?.[0]?.price?.id || null;

      // Email
      let email = invoice.customer_email;

      if (!email && invoice.customer) {
        const customer = await stripe.customers.retrieve(invoice.customer);
        email = customer.email;
      }

      if (!email) {
        console.warn("invoice.paid event sem email, ignorando");
      } else {
        let creditsToAdd = 0;

        if (priceId === process.env.STRIPE_PRICE_BASIC) creditsToAdd = 100;
        if (priceId === process.env.STRIPE_PRICE_PRO) creditsToAdd = 500;
        if (priceId === process.env.STRIPE_PRICE_STUDIO) creditsToAdd = 1500;

        const key = `credits:email:${email.toLowerCase()}`;

        const current = Number((await redis.get(key)) || 0);

        await redis.set(key, String(current + creditsToAdd));

        console.log(`Added ${creditsToAdd} credits to ${email}`);
      }
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).send(`Webhook handler error: ${err.message}`);
  }
}
