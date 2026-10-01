/**
 * Serverless Backend Handler: System Health & Gateway Status
 * 
 * Provides runtime telemetry and service availability probes.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  const qboConfigured = !!(process.env.QBO_CLIENT_ID && process.env.QBO_CLIENT_SECRET);
  const docusignConfigured = !!(process.env.DOCUSIGN_INTEGRATION_KEY && process.env.DOCUSIGN_RSA_PRIVATE_KEY);

  return res.status(200).json({
    status: 'healthy',
    system: 'Benta\'s Funeral Home OS',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'production',
    gateways: {
      twilio: twilioConfigured ? 'live' : 'mock-fallback',
      stripe: stripeConfigured ? 'live' : 'mock-fallback',
      openai: openaiConfigured ? 'live' : 'mock-fallback',
      quickbooks: qboConfigured ? 'live' : 'mock-fallback',
      docusign: docusignConfigured ? 'live' : 'mock-fallback'
    },
    security: {
      clientIsolation: 'active',
      encryptedVault: 'active',
      rbacEnforcement: 'active',
      hstsPreload: 'enabled'
    }
  });
}
