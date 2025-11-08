import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Fetch the affiliate link from environment variables.
  let affiliateLink = process.env.AFFILIATE_LINK;

  if (!affiliateLink || typeof affiliateLink !== 'string' || affiliateLink.trim() === '') {
    // If the link is not configured, send an error response.
    // This makes it clear to the site owner that the variable is missing.
    console.error('[REDIRECT ERROR] AFFILIATE_LINK environment variable is not set or is empty.');
    return res.status(500).send('Affiliate link is not configured. Please contact the site administrator.');
  }
  
  affiliateLink = affiliateLink.trim();
  // Ensure it's a full URL.
  if (!/^(https?:\/\/)/i.test(affiliateLink)) {
    affiliateLink = `https://${affiliateLink}`;
  }

  // Issue a 307 Temporary Redirect to the affiliate link.
  // The browser will handle this redirection.
  res.redirect(307, affiliateLink);
}