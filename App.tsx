
import React, { useState, useCallback, useEffect } from 'react';
import LoginContainer from './components/LoginContainer';
import PredictorScreen from './components/PredictorScreen';
import OnboardingModal from './components/OnboardingModal';
import { User } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    // Fetch the affiliate link and admin feature status from our API endpoint
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/get-config');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const config = await response.json();
        setAffiliateLink(config.affiliateLink || ''); // Use empty string if link is missing
      } catch (error) {
        console.error("Could not fetch config:", error);
        setAffiliateLink(''); // Set to empty on error to prevent issues
      // FIX: Removed an extra closing brace to correct the try-catch-finally syntax. This was causing a scope issue which led to multiple 'Cannot find name' errors.
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  const handleLoginSuccess = useCallback((playerId: string, initialPredictions: number) => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    setUser({ playerId, predictionsLeft: initialPredictions });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  const handleOnboardingClose = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  }, []);
  
  if (isLoadingConfig) {
      return (
        <div className="min-h-screen text-white font-sans flex items-center justify-center bg-[#e51e2a]">
          <div className="flex justify-center items-center">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-slate-200">Loading...</span>
          </div>
        </div>
      );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen text-white font-sans flex items-center justify-center bg-[#e51e2a]">
        {showOnboarding && <OnboardingModal onClose={handleOnboardingClose} />}
        {user ? (
          <PredictorScreen 
            user={user} 
            onLogout={handleLogout} 
            affiliateLink={affiliateLink} 
          />
        ) : (
          <LoginContainer 
            onLoginSuccess={handleLoginSuccess} 
            affiliateLink={affiliateLink} 
          />
        )}
      </div>
    </LanguageProvider>
  );
};

export default App;