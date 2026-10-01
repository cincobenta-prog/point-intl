/**
 * Serverless Backend Handler: AI Family Concierge & Obituary Assistant
 * 
 * Proxies AI queries to OpenAI / Gemini / Claude using server-side API keys.
 * Raw Bearer keys are NEVER exposed to the frontend.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { messages, model = 'gpt-4o', temperature = 0.7, userQuery, caseContext } = typeof req.body === 'string' 
      ? JSON.parse(req.body) 
      : (req.body || {});

    const openaiApiKey = process.env.OPENAI_API_KEY;

    // If server OpenAI key is available, call OpenAI API
    if (openaiApiKey && openaiApiKey.startsWith('sk-')) {
      const formattedMessages = messages || [
        {
          role: 'system',
          content: `You are the compassionate 24/7 Family Care Concierge for Benta's Funeral Home, Inc., located at 630 Saint Nicholas Avenue, Harlem, NY 10030 (established 1928, NYS Reg #08850). You speak with warmth, dignity, cultural reverence, and legal accuracy regarding NYC/NYS burial benefits, NYS PHL § 4201, and Form AP-47.\n\n${caseContext ? `Case Context:\n${JSON.stringify(caseContext, null, 2)}` : ''}`
        },
        {
          role: 'user',
          content: userQuery || 'How can Benta Funeral Home assist our family today?'
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          temperature: typeof temperature === 'number' ? temperature : 0.7,
          messages: formattedMessages
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        return res.status(200).json({
          success: true,
          content,
          model: data.model || model,
          usage: data.usage
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        return res.status(200).json({
          success: true,
          content: `Thank you for contacting Benta's Funeral Home. Director Jason Benta (Managing LFD #08850) and our care team at 630 Saint Nicholas Avenue are available 24/7 to assist your family with immediate intake, NYS Form AP-47 authorization, and chapel scheduling. Please call our direct line at (212) 281-8850 for immediate director support.`,
          isFallback: true,
          upstreamNotice: errorData.error?.message || 'OpenAI API quota or availability limit'
        });
      }
    }

    // Fallback if no OpenAI API Key configured on server
    return res.status(200).json({
      success: true,
      content: `Thank you for contacting Benta's Funeral Home. Director Jason Benta and our staff at 630 St. Nicholas Ave are dedicated to guiding your family through all arrangements, NYS Form AP-47 authorizations, and cemetery logistics with dignity.`,
      isMock: true
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error processing AI request'
    });
  }
}
