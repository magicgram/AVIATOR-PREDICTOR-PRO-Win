import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers to allow requests from anywhere.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Fetch the affiliate link from environment variables.
  let affiliateLink = process.env.AFFILIATE_LINK || '';

  if (affiliateLink) {
    affiliateLink = affiliateLink.trim();
    // Ensure it's a full URL if it's not empty after trimming
    if (affiliateLink && !/^(https?:\/\/)/i.test(affiliateLink)) {
      affiliateLink = `https://${affiliateLink}`;
    }
  }

  return res.status(200).json({ affiliateLink });
}
