/**
 * Serverless Backend Handler: Twilio SMS Dispatch
 * 
 * Securely dispatches cellular SMS messages via Twilio REST API.
 * Master AuthToken is kept strictly on the server and NEVER exposed to client browsers.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { to, body, from } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (!to || !body) {
      return res.status(400).json({ error: 'Missing required parameters: "to" and "body"' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const senderNumber = from || process.env.TWILIO_FROM_NUMBER || process.env.VITE_TWILIO_FROM_NUMBER || '+12122818850';

    if (!accountSid || !authToken) {
      // Mock / Sandbox simulation if credentials are not configured
      return res.status(200).json({
        success: true,
        messageSid: `SM_DEV_MOCK_${Math.random().toString(36).substring(2, 10)}`,
        isSimulated: true,
        status: 'queued',
        recipient: to
      });
    }

    // Format recipient (E.164)
    let cleanTo = to.replace(/[^\d+]/g, '');
    if (!cleanTo.startsWith('+')) {
      cleanTo = cleanTo.length === 10 ? `+1${cleanTo}` : `+${cleanTo}`;
    }

    const formData = new URLSearchParams();
    formData.append('To', cleanTo);
    if (senderNumber.startsWith('MG')) {
      formData.append('MessagingServiceSid', senderNumber);
    } else {
      formData.append('From', senderNumber);
    }
    formData.append('Body', body);

    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid.trim()}/Messages.json`;
    const basicAuth = Buffer.from(`${accountSid.trim()}:${authToken.trim()}`).toString('base64');

    const response = await fetch(twilioEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({
        success: true,
        messageSid: data.sid,
        status: data.status || 'sent',
        isSimulated: false
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: data.message || 'Twilio SMS dispatch rejected',
        code: data.code
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error processing SMS dispatch'
    });
  }
}
