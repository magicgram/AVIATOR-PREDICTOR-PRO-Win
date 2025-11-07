
/**
 * @file This file contains shared constants for the application.
 */

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
