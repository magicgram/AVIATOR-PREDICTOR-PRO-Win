
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MINIMUM_DEPOSIT = 10;
const PREDICTIONS_AWARDED = 15;

// --- Verification Logic ---

interface VerifyUserData {
  registered: boolean;
  deposit: number;
  predictionsLeft: number;
}

async function handleVerify(req: VercelRequest, res: VercelResponse) {
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

// --- Postback Logic ---

interface PostbackUserData {
  registered: boolean;
  deposit: number;
  predictionsLeft: number;
}

async function handlePostback(req: VercelRequest, res: VercelResponse) {
  const { event_type, user_id, amount } = req.query;

  // Map user_id to playerId for internal consistency
  const playerId = Array.isArray(user_id) ? user_id[0] : user_id;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'user_id is required and must be a string.' });
  }

  try {
    const key = `user:${playerId}`;
    let userData: PostbackUserData = (await kv.get(key)) || { registered: false, deposit: 0, predictionsLeft: 0 };
    const oldDeposit = userData.deposit;

    const eventTypeStr = Array.isArray(event_type) ? event_type[0] : event_type;

    switch (eventTypeStr) {
      case 'registration':
        userData.registered = true;
        console.log(`[POSTBACK] Registration for player: ${playerId}`);
        break;
      
      case 'first_deposit':
      case 'recurring_deposit':
        const amountStr = Array.isArray(amount) ? (amount[0] as string) : (amount as string);
        const depositAmount = parseFloat(amountStr || '0');

        if (depositAmount > 0) {
            userData.deposit += depositAmount;
            // A deposit implies the user must be registered.
            userData.registered = true; 
            
            // If the user's total deposit was below the minimum and now it's at or above, grant initial predictions.
            if (oldDeposit < MINIMUM_DEPOSIT && userData.deposit >= MINIMUM_DEPOSIT) {
                userData.predictionsLeft = (userData.predictionsLeft || 0) + PREDICTIONS_AWARDED;
                console.log(`[POSTBACK] First qualifying deposit for ${playerId}. Awarded ${PREDICTIONS_AWARDED} predictions.`);
            }
            // Otherwise, if this is just another deposit on top of an already-qualified account, grant more predictions.
            else if (oldDeposit >= MINIMUM_DEPOSIT) {
                userData.predictionsLeft = (userData.predictionsLeft || 0) + PREDICTIONS_AWARDED;
                 console.log(`[POSTBACK] Subsequent deposit for ${playerId}. Awarded ${PREDICTIONS_AWARDED} more predictions.`);
            }
            console.log(`[POSTBACK] Deposit (${eventTypeStr}) confirmed for player: ${playerId}, Amount: $${depositAmount}, New Total: $${userData.deposit}, Predictions: ${userData.predictionsLeft}`);
        }
        break;

      default:
        console.log(`[POSTBACK] Received unknown event type '${eventTypeStr}' for player: ${playerId}`);
        return res.status(200).json({ success: true, message: 'Unknown event type received but acknowledged.' });
    }

    await kv.set(key, userData);
    
    return res.status(200).json({ success: true, message: 'Postback processed.' });

  } catch (error) {
    console.error('[POSTBACK ERROR] Error processing postback:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// --- Main Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { action, playerId } = req.query;

  if (action === 'postback') {
    return handlePostback(req, res);
  }
  
  // If playerId is present, it's a verification request.
  if (playerId) {
    return handleVerify(req, res);
  }

  // Otherwise, it's a config request (the new default for GET).
  const affiliateLink = process.env.AFFILIATE_LINK || '';
  return res.status(200).json({ affiliateLink });
}
