
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51QkxRkP5D7WqTYQ8yWdipbmY4eciPP30vBhWnuTO2ghQ6zh2TPhU3i7utZQAVuBG1PiaFSVa8x1JazitDOmtOW6700aF0E9GfJ');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount } = JSON.parse(req.body); //cents
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
      });
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
