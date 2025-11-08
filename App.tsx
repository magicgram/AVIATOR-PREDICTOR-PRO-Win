import React, { useState, useCallback, useEffect } from 'react';
import LoginContainer from './components/LoginContainer';
import PredictorScreen from './components/PredictorScreen';
import OnboardingModal from './components/OnboardingModal';
import { User } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  return (
    <LanguageProvider>
      <div className="min-h-screen text-white font-sans flex items-center justify-center bg-[#e51e2a]">
        {showOnboarding && <OnboardingModal onClose={handleOnboardingClose} />}
        {user ? (
          <PredictorScreen 
            user={user} 
            onLogout={handleLogout} 
          />
        ) : (
          <LoginContainer 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}
      </div>
    </LanguageProvider>
  );
};

export default App;