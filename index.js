import express from "express";
import crypto from "crypto";

const app = express();
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

const MERCHANT_ID = process.env.MERCHANT_ID;

console.log(MERCHANT_ID);
const API_KEY = process.env.API_KEY;

app.post("/checkout", async (req, res) => {
  const { amount, currency } = req.body;

  const payload = {
    amount,
    currency,
    order_id: crypto.randomBytes(12).toString("hex"),
    url_callback: "https://2kwmbfhd-3000.brs.devtunnels.ms/webhook",
  };

  const sign = crypto
    .createHash("md5")
    .update(Buffer.from(JSON.stringify(payload)).toString("base64") + API_KEY)
    .digest("hex");

  const response = await fetch("https://api.cryptomus.com/v1/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      merchant: MERCHANT_ID,
      sign: sign,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  return res.json(data);
});

app.post("/webhook", (req, res) => {
  const { sign } = req.body;

  if (!sign) {
    return res.status(400).json({ message: "Invalid sign" });
  }

  const data = JSON.parse(req.rawBody);
  delete data.sign;

  const calculatedSign = crypto
    .createHash("md5")
    .update(Buffer.from(JSON.stringify(body)).toString("base64") + API_KEY)
    .digest("hex");

  if (sign !== calculatedSign) {
    return res.status(400).json({ message: "Invalid sign" });
  }

  console.log(req.body)

  return res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
