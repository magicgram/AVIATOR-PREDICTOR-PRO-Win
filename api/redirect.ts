import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // The affiliate link is fetched from environment variables.
  const affiliateLink = process.env.AFFILIATE_LINK;

  if (affiliateLink && typeof affiliateLink === 'string' && affiliateLink.trim() !== '') {
    res.status(200).json({ success: true, link: affiliateLink.trim() });
  } else {
    // This case will be reached if the AFFILIATE_LINK environment variable is not set.
    console.error('[CONFIG ERROR] AFFILIATE_LINK environment variable is not set or is empty.');
    res.status(404).json({ 
        success: false, 
        message: 'The registration link is not configured correctly. Please contact the site administrator.' 
    });
  }
}