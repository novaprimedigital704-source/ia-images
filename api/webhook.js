import Stripe from "stripe";
import { Redis } from "@upstash/redis";

export const config = {
  api: { bodyParser: false }
};

function rawBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
  });
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function handler(req, res) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await rawBody(req);
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "invoice.paid") {
      const sub = event.data.object;
      const priceId = sub.lines.data[0].price.id;

      let creditsToAdd = 0;

      if (priceId === process.env.STRIPE_PRICE_BASIC) creditsToAdd = 100;
      if (priceId === process.env.STRIPE_PRICE_PRO) creditsToAdd = 500;
      if (priceId === process.env.STRIPE_PRICE_STUDIO) creditsToAdd = 1500;

      const ip = sub.customer_email; // melhor: email
      const key = `credits:${ip}`;

      const current = (await redis.get(key)) || 0;

      await redis.set(key, current + creditsToAdd);

      console.log("Créditos adicionados:", creditsToAdd);
    }

    res.status(200).send("OK");

  } catch (err) {
    res.status(400).send(`Webhook error: ${err.message}`);
  }
}
