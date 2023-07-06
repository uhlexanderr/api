const router = require("express").Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51NMAwXLiTjTzJT4HG3xJ1EqZr03oSaAI8yxXOnCuyaGTA7ciBUYGEY3VsoGz1issidg9QS0BB97wZsnFxuQjAoeO005Y11IMrz');

router.post("/payment", (req, res) => {
  console.log("Received payment request");

  const { tokenId, amount } = req.body;

  if (!tokenId || !amount) {
    return res.status(400).json({ error: "Invalid request" });
  }

  stripe.charges.create(
    {
      source: tokenId,
      amount,
      currency: "php",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        console.error("Stripe error:", stripeErr);
        return res.status(500).json({ error: "Payment failed", message: stripeErr.message });
      } else {
        console.log("Stripe response:");
        return res.status(200).json(stripeRes);
      }
    }
  );
});


module.exports = router;
