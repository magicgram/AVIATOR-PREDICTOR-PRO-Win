
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MINIMUM_DEPOSIT = 10;

// --- Verification Logic ---

interface VerifyUserData {
  registered: boolean;
  deposit: number;
  predictionsLeft: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // This endpoint is now ONLY for verifying a player ID during login.
  const { playerId } = req.query;

  if (!playerId || typeof playerId !== 'string' || playerId.length < 3) {
    return res.status(400).json({
      success: false,
      status: 'INVALID_ID',
      message: 'Please enter a valid Player ID.',
    });
  }

  try {
    const key = `user:${playerId}`;
    const userData: VerifyUserData | null = await kv.get(key);
    
    if (!userData || !userData.registered) {
      return res.status(200).json({
        success: false,
        status: 'NOT_REGISTERED',
        message: "❌ Sorry, this Player ID is not registered! Please use the 'Register Here' button and wait a few minutes before trying again.",
      });
    }

    if (userData.deposit < MINIMUM_DEPOSIT) {
      return res.status(200).json({
        success: false,
        status: 'NEEDS_DEPOSIT',
        message: `User is registered but needs to deposit at least $${MINIMUM_DEPOSIT}.`,
      });
    }
    
    // NEW: Check if a qualified user has run out of predictions.
    if (userData.predictionsLeft <= 0) {
        return res.status(200).json({
            success: false,
            status: 'NEEDS_REDEPOSIT',
            message: 'You have used all predictions. Deposit again to get more.',
            predictionsLeft: 0,
        });
    }

    // All checks passed, user can log in.
    return res.status(200).json({ 
        success: true, 
        status: 'LOGGED_IN',
        predictionsLeft: userData.predictionsLeft
    });

  } catch (error) {
    console.error(`[VERIFY ERROR] for Player ID ${playerId}:`, error);
    return res.status(500).json({
        success: false,
        status: 'SERVER_ERROR',
        message: 'An unexpected error occurred on our server. Please try again later.'
    });
  }
}
