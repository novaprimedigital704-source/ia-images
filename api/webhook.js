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

    // Eventos que nos interessam:
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;
      // Você pode adicionar créditos iniciais no primeiro pagamento (opcional)
      // Aqui, nós aguardamos invoice.paid para créditos mensais.
      console.log("checkout.session.completed for", email);
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      // Pegar o price id do primeiro line item
      const priceId = invoice.lines?.data?.[0]?.price?.id;
      // obter email; invoice may not contain customer_email, buscar via customer if needed
      let email = invoice.customer_email;
      if (!email && invoice.customer) {
        const cus = await stripe.customers.retrieve(invoice.customer);
        email = cus.email;
      }
      if (!email) {
        console.warn("invoice.paid without email, skipping");
      } else {
        let creditsToAdd = 0;
        if (priceId === process.env.STRIPE_PRICE_BASIC) creditsToAdd = 100;
        if (priceId === process.env.STRIPE_PRICE_PRO) creditsToAdd = 500;
        if (priceId === process.env.STRIPE_PRICE_STUDIO) creditsToAdd = 1500;

        const key = `credits:email:${email.toLowerCase()}`;
        const current = Number((await redis.get(key)) || 0);
        await redis.set(key, current + creditsToAdd);
        console.log(`Added ${creditsToAdd} credits to ${email}`);
      }
    }

    // Retorne 200 para Stripe
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("webhook error:", err);
    res.status(500).send(`Webhook handler error: ${err.message}`);
  }
}
