
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Enforce POST method for this action
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { playerId } = req.body;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required in the request body.' });
  }

  try {
    const key = `user:${playerId}`;
    // kv.del returns the number of keys deleted.
    const result = await kv.del(key);
    
    if (result > 0) {
      console.log(`[DATA CLEARED] for player: ${playerId}`);
      return res.status(200).json({ success: true, message: `Data for player ${playerId} cleared.` });
    } else {
      console.log(`[DATA CLEAR] No data found for player: ${playerId}`);
      return res.status(404).json({ success: false, message: `No data found for player ${playerId} to clear.` });
    }

  } catch (error) {
    console.error(`[CLEAR ERROR] for Player ID ${playerId}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
