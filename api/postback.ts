
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MINIMUM_DEPOSIT = 10;
const PREDICTIONS_AWARDED = 15;

interface UserData {
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

  const { 
    event_type, user_id, amount, // Standard params
    goal, subid1, sub1, payout   // Potential alternative params
  } = req.query;

  // Helper to safely get a query parameter as a string from string | string[]
  const getQueryParam = (param: string | string[] | undefined): string | undefined => {
      return Array.isArray(param) ? param[0] : param;
  };

  const playerId = getQueryParam(user_id) || getQueryParam(subid1) || getQueryParam(sub1);
  const eventType = getQueryParam(event_type) || getQueryParam(goal);
  const amountStr = getQueryParam(amount) || getQueryParam(payout);

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'A valid user identifier (e.g., user_id, subid1, or sub1) is required.' });
  }

  try {
    const key = `user:${playerId}`;
    let userData: UserData = (await kv.get(key)) || { registered: false, deposit: 0, predictionsLeft: 0 };
    const oldDeposit = userData.deposit;

    // Standardize common affiliate event names
    let standardizedEventType = '';
    if (eventType === 'registration' || eventType === 'reg') {
        standardizedEventType = 'registration';
    } else if (['first_deposit', 'recurring_deposit', 'dep', 'ftd'].includes(eventType || '')) {
        standardizedEventType = 'deposit';
    }

    switch (standardizedEventType) {
      case 'registration':
        userData.registered = true;
        console.log(`[POSTBACK] Registration for player: ${playerId}`);
        break;
      
      case 'deposit':
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
            console.log(`[POSTBACK] Deposit (${eventType}) confirmed for player: ${playerId}, Amount: $${depositAmount}, New Total: $${userData.deposit}, Predictions: ${userData.predictionsLeft}`);
        }
        break;

      default:
        console.log(`[POSTBACK] Received unknown or unhandled event type '${eventType}' for player: ${playerId}`);
        // We still send a 200 OK to prevent the affiliate network from retrying constantly.
        return res.status(200).json({ success: true, message: `Unknown event type '${eventType}' received but acknowledged.` });
    }

    await kv.set(key, userData);
    
    return res.status(200).json({ success: true, message: 'Postback processed.' });

  } catch (error) {
    console.error(`[POSTBACK ERROR] Error processing postback for Player ID ${playerId}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
