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

  // Simplified parameter extraction based on standard affiliate macros.
  const playerId = (req.query.user_id || req.query.sub1) as string | undefined;
  const eventType = req.query.event_type as string | undefined;
  const amountStr = req.query.amount as string | undefined;

  if (!playerId || typeof playerId !== 'string' || playerId.trim() === '') {
    console.error('[POSTBACK FAIL] Missing or empty playerId. Query:', req.query);
    return res.status(400).json({
        error: 'Required parameter `user_id` or `sub1` is missing or empty. Please ensure your postback URL includes the correct macro from your affiliate panel (e.g., {user_id}).',
        receivedQuery: req.query
    });
  }

  const trimmedPlayerId = playerId.trim();

  try {
    const key = `user:${trimmedPlayerId}`;
    let userData: UserData = (await kv.get(key)) || { registered: false, deposit: 0, predictionsLeft: 0 };
    const oldDeposit = userData.deposit;

    const lowerEventType = eventType?.toLowerCase();

    if (lowerEventType === 'registration') {
        userData.registered = true;
        console.log(`[POSTBACK] Registration for player: ${trimmedPlayerId}`);
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
            console.log(`[POSTBACK] Deposit (${eventType}) for ${trimmedPlayerId}, Amount: $${depositAmount}, New Total: $${userData.deposit}, Predictions: ${userData.predictionsLeft}`);
        } else {
            console.log(`[POSTBACK] Deposit event received for player: ${trimmedPlayerId}, but amount was missing or invalid: ${amountStr}`);
        }
    } else {
        console.log(`[POSTBACK] Received unknown or unhandled event type '${eventType}' for player: ${trimmedPlayerId}`);
        return res.status(200).json({ success: true, message: `Unknown event type '${eventType}' received but acknowledged.` });
    }

    await kv.set(key, userData);

    return res.status(200).json({ success: true, message: 'Postback processed.' });

  } catch (error) {
    console.error(`[POSTBACK ERROR] Error processing postback for Player ID ${trimmedPlayerId}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
