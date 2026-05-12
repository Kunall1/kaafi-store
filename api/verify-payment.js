// ─── api/verify-payment.js ───────────────────────────────────────────────────
// Vercel Serverless Function — verifies Razorpay payment signature.
//
// WHY: After payment, Razorpay sends back 3 values. We MUST verify the
// signature server-side using our secret key. If we skip this, anyone could
// fake a successful payment by sending random data.
//
// POST /api/verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
//         customer, items, total }
// Returns: { success: true, orderId: 'KAAFI-XXXXX' }
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto';

export default async function handler(req, res) {
  // ── Only allow POST ────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customer,
    items,
    total,
  } = req.body;

  // ── Validate required fields ───────────────────────────────────────────────
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment fields' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[verify-payment] Missing RAZORPAY_KEY_SECRET');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  // ── Verify HMAC-SHA256 signature ───────────────────────────────────────────
  // Razorpay generates: HMAC_SHA256(order_id + "|" + payment_id, key_secret)
  // If this doesn't match, the payment data was tampered with.
  const body              = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.warn('[verify-payment] Signature mismatch — possible fraud attempt');
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  // ── Signature is valid — generate a readable order number ─────────────────
  const orderId = 'KAAFI-' + Date.now().toString(36).toUpperCase();

  // ── Send confirmation email via Resend ─────────────────────────────────────
  // We do this here (server-side) so the email fires exactly once,
  // even if the user closes the tab before the client finishes.
  try {
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey && customer?.email) {
      // Build the items table HTML
      const itemsHtml = (items || []).map(item => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#888;">
            ${item.name} — ${item.color} / ${item.selectedSize} × ${item.qty}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:13px;font-weight:700;color:#fff;text-align:right;">
            ₹${item.price * item.qty}
          </td>
        </tr>
      `).join('');

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    'KAAFI <noreply@kaafi.online>',
          to:      [customer.email],
          subject: `Order Confirmed — ${orderId}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#000;">
              <div style="background:#000;color:#fff;font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:48px 24px;">

                <!-- Logo -->
                <h1 style="font-size:36px;letter-spacing:0.06em;margin:0 0 4px;font-weight:900;">KAAFI</h1>
                <p style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#444;margin:0 0 40px;">Founder's Drop</p>

                <!-- Greeting -->
                <h2 style="font-size:22px;font-weight:700;letter-spacing:0.01em;margin:0 0 12px;">
                  Thank You, ${(customer.name || '').split(' ')[0]}
                </h2>
                <p style="font-size:13px;color:#888;line-height:1.7;margin:0 0 8px;">
                  Your order <strong style="color:#fff;">${orderId}</strong> is confirmed.
                </p>
                <p style="font-size:13px;color:#888;line-height:1.7;margin:0 0 36px;">
                  We'll ship within 3–5 business days. You'll get a tracking update when it dispatches.
                </p>

                <!-- Divider -->
                <div style="height:1px;background:#1a1a1a;margin-bottom:24px;"></div>

                <!-- Order items -->
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                  <tbody>${itemsHtml}</tbody>
                </table>

                <!-- Total -->
                <div style="display:flex;justify-content:space-between;padding:14px 0;border-top:1px solid #333;margin-bottom:32px;">
                  <span style="font-size:13px;font-weight:700;">Total</span>
                  <span style="font-size:17px;font-weight:700;">₹${total}</span>
                </div>

                <!-- Shipping address -->
                <div style="padding:16px 20px;background:#0a0a0a;border:1px solid #1a1a1a;margin-bottom:40px;">
                  <p style="font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#444;margin:0 0 10px;font-weight:700;">Shipping To</p>
                  <p style="font-size:13px;color:#888;line-height:1.7;margin:0;">
                    ${customer.name}<br/>
                    ${customer.address}<br/>
                    ${customer.city} — ${customer.pincode}<br/>
                    ${customer.phone}
                  </p>
                </div>

                <!-- Footer -->
                <p style="font-size:10px;color:#2a2a2a;text-align:center;letter-spacing:0.1em;text-transform:uppercase;margin:0;">
                  © 2026 KAAFI · All Rights Reserved
                </p>
              </div>
            </body>
            </html>
          `,
        }),
      });
    }
  } catch (emailErr) {
    // Don't fail the whole request if email fails — order is still valid
    console.error('[verify-payment] Email send failed:', emailErr.message);
  }

  // ── All good — return success ──────────────────────────────────────────────
  return res.status(200).json({ success: true, orderId });
}
