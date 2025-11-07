import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface UserData {
  registered: boolean;
  deposit: number;
  predictionsLeft: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { playerId } = req.body;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ success: false, message: 'Player ID is required.' });
  }

  try {
    const key = `user:${playerId}`;
    const userData: UserData | null = await kv.get(key);

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (userData.predictionsLeft <= 0) {
      return res.status(400).json({ success: false, message: 'No predictions left.' });
    }

    // Decrement and save
    const updatedUserData = { ...userData, predictionsLeft: userData.predictionsLeft - 1 };
    await kv.set(key, updatedUserData);

    return res.status(200).json({ success: true, predictionsLeft: updatedUserData.predictionsLeft });

  } catch (error) {
    console.error(`[USE PREDICTION ERROR] for Player ID ${playerId}:`, error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
