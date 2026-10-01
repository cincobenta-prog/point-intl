/**
 * Serverless Backend Handler: Stripe Payment Intent & Split-Pay Creation
 * 
 * Uses server-side process.env.STRIPE_SECRET_KEY to initialize Stripe PaymentIntents.
 * The master secret key is NEVER exposed to the frontend browser.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { 
      amount, 
      currency = 'usd', 
      caseNumber, 
      decedentName, 
      payerEmail, 
      payerName, 
      paymentMethodType = 'card', 
      isSplitPay = false 
    } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid or missing payment amount.' });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
      const amountInCents = Math.round(Number(amount) * 100);

      const params = new URLSearchParams();
      params.append('amount', amountInCents.toString());
      params.append('currency', currency);
      params.append('description', `Benta's Funeral Home - Case ${caseNumber || 'General'} (${decedentName || 'Memorial'})`);
      if (payerEmail) params.append('receipt_email', payerEmail);
      params.append('metadata[caseNumber]', caseNumber || '');
      params.append('metadata[decedentName]', decedentName || '');
      params.append('metadata[payerName]', payerName || '');
      params.append('metadata[isSplitPay]', isSplitPay ? 'true' : 'false');
      params.append('metadata[paymentMethodType]', paymentMethodType);

      // Automatic payment methods configuration
      params.append('automatic_payment_methods[enabled]', 'true');

      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();

      if (response.ok) {
        return res.status(200).json({
          success: true,
          clientSecret: data.client_secret,
          paymentIntentId: data.id,
          amount: data.amount / 100,
          status: data.status,
          isSimulated: false
        });
      } else {
        return res.status(response.status).json({
          success: false,
          error: data.error?.message || 'Failed to create Stripe PaymentIntent',
          code: data.error?.code
        });
      }
    }

    // High-fidelity sandbox / simulated checkout if secret key is in demo mode
    const simulatedIntentId = `pi_sim_${Math.random().toString(36).substring(2, 12)}`;
    return res.status(200).json({
      success: true,
      clientSecret: `${simulatedIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`,
      paymentIntentId: simulatedIntentId,
      amount: Number(amount),
      status: 'requires_payment_method',
      isSimulated: true
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error creating PaymentIntent'
    });
  }
}
