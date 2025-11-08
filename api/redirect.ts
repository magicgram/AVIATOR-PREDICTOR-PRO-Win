import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const affiliateLink = process.env.AFFILIATE_LINK;

  if (affiliateLink && typeof affiliateLink === 'string' && affiliateLink.trim() !== '') {
    res.status(200).json({ success: true, link: affiliateLink.trim() });
  } else {
    // This is a server-side configuration issue, but we return a user-friendly error
    // instead of a 500 status, so the frontend can handle it.
    console.error('[CONFIG ERROR] AFFILIATE_LINK environment variable is not set or is empty.');
    res.status(404).json({ 
        success: false, 
        message: 'The registration link is not configured correctly. Please contact the site administrator.' 
    });
  }
}
