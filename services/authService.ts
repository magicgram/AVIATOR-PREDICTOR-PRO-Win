
// This service now makes real API calls to the backend.

export interface VerificationResponse {
  success: boolean;
  status?: 'LOGGED_IN' | 'NEEDS_DEPOSIT' | 'NOT_REGISTERED' | 'INVALID_ID' | 'SERVER_ERROR' | 'NEEDS_REDEPOSIT';
  message?: string;
  predictionsLeft?: number;
}

// This is the REAL verification function that calls our backend.
export const verifyUser = async (playerId: string): Promise<VerificationResponse> => {
  if (!playerId || playerId.length < 3) {
    return {
      success: false,
      status: 'INVALID_ID',
      message: 'Please enter a valid Player ID.',
    };
  }

  try {
    // We assume the API is at the same domain, so we use a relative path.
    // Vercel will route /api/verify to our serverless function.
    const response = await fetch(`/api/verify?playerId=${encodeURIComponent(playerId)}`);
    
    if (!response.ok) {
        // Handle server errors (like 500)
        console.error("API server returned an error:", response.status);
        return {
            success: false,
            status: 'SERVER_ERROR',
            message: 'Could not connect to the verification service. Please try again later.'
        };
    }

    const data: VerificationResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Network error during verification:", error);
    return {
      success: false,
      status: 'SERVER_ERROR',
      message: 'A network error occurred. Please check your connection and try again.'
    };
  }
};

// This function calls an endpoint to decrement a user's prediction count.
export const usePrediction = async (playerId: string): Promise<{ success: boolean; predictionsLeft?: number; message?: string }> => {
  try {
    const response = await fetch(`/api/use-prediction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to use prediction.');
    }
    return data;
  } catch (error) {
    console.error("Error using prediction:", error);
    return { success: false, message: (error as Error).message };
  }
};


// --- Postback Simulation Functions ---
// These functions are used by the TestPostbackScreen to simulate callbacks from the affiliate network.
// They call our own backend API endpoints, which then update the Vercel KV database,
// mimicking a real-world scenario.

/**
 * A robust handler for fetch API responses. It checks for non-OK status codes
 * and attempts to parse a meaningful error message from the response body,
 * preventing JSON parsing errors on HTML error pages.
 */
const handleApiResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
            // Try to parse error response as JSON, as our API routes do.
            const errorJson = await response.json();
            errorMsg = errorJson.message || errorJson.error || errorMsg;
        } catch (e) {
            // If not JSON (e.g., HTML error from Vercel), try to get text.
            try {
                const errorText = await response.text();
                if(errorText) errorMsg = errorText;
            } catch (e2) {
                // Ignore if we can't get text body.
            }
        }
        throw new Error(errorMsg);
    }
    // If response is OK, parse the JSON body.
    return response.json();
};

const simulatePostback = async (params: Record<string, string>): Promise<string> => {
    // The action is now determined by the endpoint, so 'action' param is not needed.
    const queryString = new URLSearchParams(params).toString();
    try {
        // Route the postback simulation through the new /api/postback endpoint
        const response = await fetch(`/api/postback?${queryString}`);
        const result = await handleApiResponse(response);
        const id = params.user_id || params.playerId;
        const event = params.event_type || params.event;
        return `SUCCESS: Simulated '${event}' for Player ID '${id}'. Server responded: ${result.message}`;
    } catch (err: any) {
         const event = params.event_type || params.event;
         return `ERROR: Simulating '${event}'. ${err.message}`;
    }
};

export const testRegistration = (playerId: string): Promise<string> => {
    return simulatePostback({ event_type: 'registration', user_id: playerId });
};

export const testFirstDeposit = (playerId: string, amount: number): Promise<string> => {
    return simulatePostback({ 
        event_type: 'first_deposit', 
        user_id: playerId, 
        amount: String(amount)
    });
};

export const testReDeposit = (playerId: string, amount: number): Promise<string> => {
    return simulatePostback({
        event_type: 'recurring_deposit',
        user_id: playerId,
        amount: String(amount)
    });
};

// This function calls an endpoint to clear a specific user's data from the database.
export const clearUserData = async (playerId: string): Promise<string> => {
    try {
        const response = await fetch(`/api/clear-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerId }),
        });
        const result = await handleApiResponse(response);
        return `SUCCESS: ${result.message}`;
    } catch (err: any) {
        return `ERROR: Clearing data for '${playerId}'. ${err.message}`;
    }
};