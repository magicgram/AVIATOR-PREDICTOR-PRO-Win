
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

  // --- Enhanced Logging for Debugging ---
  console.log(`[POSTBACK RECEIVED] Full URL: ${req.url}`);
  console.log(`[POSTBACK RECEIVED] Query Parameters:`, req.query);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[POSTBACK RECEIVED] Body:`, req.body);
  }
  // ---

  // More flexible parameter extraction.
  const playerId = (req.query.user_id || req.query.sub1) as string | undefined;
  // Look for 'event_type' OR 'event'. This adds flexibility for different affiliate networks.
  const eventType = (req.query.event_type || req.query.event) as string | undefined;
  const amountStr = req.query.amount as string | undefined;

  if (!playerId || typeof playerId !== 'string' || playerId.trim() === '') {
    console.error('[POSTBACK FAIL] Missing or invalid player ID. Query:', req.query);
    return res.status(400).json({
        error: 'Required parameter `user_id` or `sub1` is missing or empty. Please check your affiliate panel and use the correct macro.',
        receivedQuery: req.query
    });
  }
  
  if (!eventType) {
    console.error('[POSTBACK FAIL] Missing event type. Query:', req.query);
    return res.status(400).json({
        error: "Required parameter `event_type` or `event` is missing. You must add this parameter to your postback URL manually (e.g., `&event_type=registration`).",
        receivedQuery: req.query
    });
  }

  const trimmedPlayerId = playerId.trim();

  try {
    const key = `user:${trimmedPlayerId}`;
    let userData: UserData = (await kv.get(key)) || { registered: false, deposit: 0, predictionsLeft: 0 };
    const oldDeposit = userData.deposit;

    const lowerEventType = eventType.toLowerCase();

    if (lowerEventType === 'registration') {
        userData.registered = true;
        await kv.set(key, userData);
        console.log(`[POSTBACK SUCCESS] Registration recorded for player: ${trimmedPlayerId}. Data:`, userData);
    } else if (lowerEventType === 'first_deposit' || lowerEventType === 'recurring_deposit') {
        const depositAmount = parseFloat(amountStr || '0');

        if (depositAmount > 0) {
            userData.deposit += depositAmount;
            userData.registered = true; // A deposit implies registration.

            if (oldDeposit < MINIMUM_DEPOSIT && userData.deposit >= MINIMUM_DEPOSIT) {
                userData.predictionsLeft = (userData.predictionsLeft || 0) + PREDICTIONS_AWARDED;
                console.log(`[POSTBACK] First qualifying deposit for ${trimmedPlayerId}. Awarded ${PREDICTIONS_AWARDED} predictions.`);
            } else if (oldDeposit >= MINIMUM_DEPOSIT) {
                userData.predictionsLeft = (userData.predictionsLeft || 0) + PREDICTIONS_AWARDED;
                console.log(`[POSTBACK] Subsequent deposit for ${trimmedPlayerId}. Awarded ${PREDICTIONS_AWARDED} more predictions.`);
            }
            await kv.set(key, userData);
            console.log(`[POSTBACK SUCCESS] Deposit (${eventType}) for ${trimmedPlayerId}, Amount: $${depositAmount}. New Data:`, userData);
        } else {
            console.warn(`[POSTBACK WARN] Deposit event for player ${trimmedPlayerId} had an invalid amount: '${amountStr}'. Query:`, req.query);
            return res.status(200).json({ success: true, message: `Deposit event received for player: ${trimmedPlayerId}, but amount was missing or invalid: ${amountStr}` });
        }
    } else {
        console.warn(`[POSTBACK WARN] Received unknown event type '${eventType}' for player: ${trimmedPlayerId}. Query:`, req.query);
        return res.status(200).json({ success: true, message: `Unknown event type '${eventType}' received and acknowledged.` });
    }

    return res.status(200).json({ success: true, message: 'Postback processed successfully.' });

  } catch (error) {
    console.error(`[POSTBACK CRITICAL ERROR] Error processing postback for Player ID ${trimmedPlayerId}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
