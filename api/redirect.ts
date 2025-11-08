import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // The affiliate link is now hardcoded directly in the application as requested.
  const affiliateLink = 'https://1wrpdq.com/casino/list?open=register&p=21oy&sub1={user_id}';

  if (affiliateLink && typeof affiliateLink === 'string' && affiliateLink.trim() !== '') {
    res.status(200).json({ success: true, link: affiliateLink.trim() });
  } else {
    // This case should not be reached with a hardcoded link, but it's kept as a fallback.
    console.error('[CONFIG ERROR] Hardcoded affiliate link is empty or invalid.');
    res.status(404).json({ 
        success: false, 
        message: 'The registration link is not configured correctly. Please contact the site administrator.' 
    });
  }
}
