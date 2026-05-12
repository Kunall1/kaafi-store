// ─── api/create-order.js ─────────────────────────────────────────────────────
// Vercel Serverless Function — creates a Razorpay order server-side.
//
// Why server-side? The Razorpay Key Secret must NEVER be exposed to the browser.
// This route runs only on Vercel's servers.
//
// POST /api/create-order
// Body: { amount: number (₹), receipt: string }
// Returns: { id, amount, currency }
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // ── Only allow POST ────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, receipt } = req.body;

  // ── Validate input ─────────────────────────────────────────────────────────
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('[create-order] Missing Razorpay env vars');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    // ── Call Razorpay REST API directly (no SDK needed) ────────────────────
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        amount:   Math.round(amount * 100), // Razorpay uses paise (₹1 = 100 paise)
        currency: 'INR',
        receipt:  receipt || `kaafi_${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[create-order] Razorpay error:', data);
      return res.status(response.status).json({
        error: data.error?.description || 'Failed to create order',
      });
    }

    // Return only what the frontend needs
    return res.status(200).json({
      id:       data.id,       // Razorpay order ID (e.g. order_abc123)
      amount:   data.amount,   // In paise (e.g. 99900 for ₹999)
      currency: data.currency, // "INR"
    });

  } catch (err) {
    console.error('[create-order] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
