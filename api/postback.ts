
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MINIMUM_DEPOSIT = 10;
const PREDICTIONS_AWARDED = 15;

interface UserData {
  registered: boolean;
  deposit: number;
  predictionsLeft: number;
}

// Helper function to find a parameter value from a list of possible keys
const findParam = (query: VercelRequest['query'], aliases: string[]): string | undefined => {
    for (const alias of aliases) {
        const value = query[alias];
        if (value) {
            const param = Array.isArray(value) ? value[0] : value;
            // Ensure we don't return an empty string if the parameter is present but empty
            if (param) return param;
        }
    }
    return undefined;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const playerIdAliases = ['sub1', 'subid1', 'user_id', 'player_id', 'subid', 'visitor_id'];
  const eventTypeAliases = ['goal', 'event_type', 'event', 'status'];
  const amountAliases = ['amount', 'payout', 'revenue'];

  const playerId = findParam(req.query, playerIdAliases);
  const eventType = findParam(req.query, eventTypeAliases);
  const amountStr = findParam(req.query, amountAliases);

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'A valid user identifier (e.g., sub1, user_id) is required.' });
  }

  try {
    const key = `user:${playerId}`;
    let userData: UserData = (await kv.get(key)) || { registered: false, deposit: 0, predictionsLeft: 0 };
    const oldDeposit = userData.deposit;

    // Standardize common affiliate event names, case-insensitively
    let standardizedEventType = '';
    const lowerEventType = eventType?.toLowerCase();
    
    if (lowerEventType === 'registration' || lowerEventType === 'reg') {
        standardizedEventType = 'registration';
    } else if (['first_deposit', 'first-deposit', 'recurring_deposit', 'dep', 'ftd', 'deposit'].includes(lowerEventType || '')) {
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
