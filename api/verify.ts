import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MINIMUM_DEPOSIT = 5;
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
  const { event, playerId, fdp_usd, dep_sum_usd, status } = req.query;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required and must be a string.' });
  }

  try {
    const key = `user:${playerId}`;
    let userData: PostbackUserData = (await kv.get(key)) || { registered: false, deposit: 0, predictionsLeft: 0 };
    const oldDeposit = userData.deposit;

    const eventStr = Array.isArray(event) ? event[0] : event;

    switch (eventStr) {
      case 'registration':
        userData.registered = true;
        console.log(`[POSTBACK] Registration for player: ${playerId}`);
        break;
      
      case 'deposit_confirmed':
        const fdpUsdStr = Array.isArray(fdp_usd) ? fdp_usd[0] : fdp_usd;
        const depositAmount = parseFloat(fdpUsdStr || '') || 0;
        if (depositAmount > 0) {
            userData.deposit += depositAmount;
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
            console.log(`[POSTBACK] Deposit confirmed for player: ${playerId}, Amount: $${depositAmount}, New Total: $${userData.deposit}, Predictions: ${userData.predictionsLeft}`);
        }
        break;

      case 'redeposit':
        const depSumUsdStr = Array.isArray(dep_sum_usd) ? dep_sum_usd[0] : dep_sum_usd;
        const reDepositAmount = parseFloat(depSumUsdStr || '') || 0;
        if (reDepositAmount > 0) {
            userData.deposit += reDepositAmount;
            userData.predictionsLeft = (userData.predictionsLeft || 0) + PREDICTIONS_AWARDED;
            console.log(`[POSTBACK] Re-deposit for player: ${playerId}, Amount: $${reDepositAmount}, New Total: $${userData.deposit}, Predictions: ${userData.predictionsLeft}`);
        }
        break;
      
      case 'deposit_rejected':
          console.log(`[POSTBACK] Deposit rejected for player: ${playerId}. Status: ${status}`);
          break;

      default:
        console.log(`[POSTBACK] Received unknown event type '${eventStr}' for player: ${playerId}`);
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
  
  const { action } = req.query;

  if (action === 'postback') {
    return handlePostback(req, res);
  }
  
  // Default action is 'verify' for normal login flow
  return handleVerify(req, res);
}