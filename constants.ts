
/**
 * @file This file contains shared constants for the application.
 */

// =================================================================================
// POSTBACK CONFIGURATION - VERY IMPORTANT!
// =================================================================================
//
// To fix issues with user registration and deposits not being detected, the
// postback URL has been updated and made more robust.
//
// Please update your affiliate network (1win, etc.) postback/S2S settings to
// use the following URL:
//
// https://<YOUR_APP_DOMAIN>/api/postback
//
// The app will automatically listen for common parameters:
// - User ID: `user_id` or `subid1`
// - Event Type: `event_type` or `goal` (e.g., 'reg', 'dep', 'ftd')
// - Amount: `amount` or `payout`
//
// Example Postback URL for Registration:
// https://<YOUR_APP_DOMAIN>/api/postback?subid1={user_id}&goal=reg
//
// Example Postback URL for Deposit:
// https://<YOUR_APP_DOMAIN>/api/postback?subid1={user_id}&goal=dep&payout={amount}
//
// =================================================================================


// =================================================================================
// AFFILIATE LINK CONFIGURATION NOTE
// =================================================================================
//
// The affiliate link is no longer hardcoded in this file.
// It is now managed via a Vercel Environment Variable for better security and
// ease of management.
//
// To configure the link:
// 1. Go to your Vercel project settings.
// 2. Navigate to the "Environment Variables" section.
// 3. Create a new variable with the key: AFFILIATE_LINK
// 4. Set the value to your full affiliate URL (e.g., https://your-affiliate-link.com/promo123).
// 5. Redeploy the application for the change to take effect.
//
// The application fetches this link at runtime via the `/api/get-config` endpoint.
//
// =================================================================================