

import React, { useState, useCallback } from 'react';
import { verifyUser, VerificationResponse } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginScreenProps {
  onLoginSuccess: (playerId: string, predictionsLeft: number) => void;
  affiliateLink: string | null;
  onOpenSidebar: () => void;
  onOpenGuide: () => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const GuideIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);


const DepositMessage: React.FC<{
  onBack: () => void;
  onRegister: () => void;
  isRegistering: boolean;
  affiliateLink: string | null;
}> = React.memo(({ onBack, onRegister, isRegistering, affiliateLink }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full max-w-sm mx-auto text-white text-center animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-4">{t('depositMessageTitle')}</h2>
      <div className="mb-6 font-poppins space-y-3">
          <p>{t('depositMessageSync')}</p>
          <p>{t('depositMessageDeposit')}</p>
          <p>{t('depositMessageAccess')}</p>
      </div>
      <div className="space-y-4">
        <button
          onClick={onRegister}
          disabled={!affiliateLink || isRegistering}
          className="w-full py-3 bg-white rounded-lg text-red-500 font-bold text-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 shadow-[0_4px_10px_rgba(150,20,20,0.4)]"
        >
          {isRegistering ? (
            <div className="flex justify-center items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('redirecting')}...
            </div>
          ) : (
             <div className="flex justify-center items-center">
                <span>{t('depositAndGetAccess').toUpperCase()}</span>
             </div>
          )}
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 bg-transparent border-2 border-white/50 rounded-lg text-white font-semibold text-lg hover:bg-white/10 transition duration-300"
        >
          {t('back').toUpperCase()}
        </button>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
});

const ReDepositMessage: React.FC<{
  onBack: () => void;
  onRegister: () => void;
  isRegistering: boolean;
  affiliateLink: string | null;
}> = React.memo(({ onBack, onRegister, isRegistering, affiliateLink }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full max-w-sm mx-auto text-white text-center animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-4">{t('reDepositMessageTitle')}</h2>
      <p className="mb-6 font-poppins">{t('reDepositMessageContinue')}</p>
      <div className="space-y-4">
        <button
          onClick={onRegister}
          disabled={!affiliateLink || isRegistering}
          className="w-full py-3 bg-white rounded-lg text-red-500 font-bold text-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 shadow-[0_4px_10px_rgba(150,20,20,0.4)]"
        >
          {isRegistering ? (
            <div className="flex justify-center items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('redirecting')}...
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <span>{t('depositAgain').toUpperCase()}</span>
            </div>
          )}
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 bg-transparent border-2 border-white/50 rounded-lg text-white font-semibold text-lg hover:bg-white/10 transition duration-300"
        >
          {t('back').toUpperCase()}
        </button>
      </div>
    </div>
  );
});


const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, affiliateLink, onOpenGuide, onOpenSidebar }) => {
  const [playerId, setPlayerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsDeposit, setNeedsDeposit] = useState(false);
  const [needsReDeposit, setNeedsReDeposit] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<Record<string, number>>({});
  const { t } = useLanguage();

  const handleContinue = async () => {
    setIsLoading(true);
    setError(null);
    setNeedsDeposit(false);
    setNeedsReDeposit(false);
    
    const idToVerify = playerId;

    try {
        const response: VerificationResponse = await verifyUser(idToVerify);
        if (response.success && typeof response.predictionsLeft !== 'undefined') {
            onLoginSuccess(idToVerify, response.predictionsLeft);
        } else {
            setPlayerId(''); // Clear input on failure
            if (response.status === 'NEEDS_DEPOSIT') {
                setNeedsDeposit(true);
            } else if (response.status === 'NEEDS_REDEPOSIT') {
                setNeedsReDeposit(true);
            } else if (response.status === 'NOT_REGISTERED') {
                const currentAttempts = loginAttempts[idToVerify] || 0;
                const newAttemptsCount = currentAttempts + 1;
                setLoginAttempts(prev => ({ ...prev, [idToVerify]: newAttemptsCount }));

                if (newAttemptsCount >= 3) {
                    setError(t('noRegistrationFoundAfterAttempts'));
                } else {
                    setError(response.message || t('youAreNotRegistered'));
                }
            } else {
                 if (response.success) {
                    setError(t('loginFailedNoCount'));
                } else {
                    setError(response.message || t('unknownErrorOccurred'));
                }
            }
        }
    } catch (err) {
        setPlayerId('');
        setError(t('unexpectedErrorOccurred'));
        console.error("Login attempt failed:", err);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRegister = useCallback(() => {
    if (affiliateLink) {
      setIsRegistering(true);
      setTimeout(() => {
        window.location.href = affiliateLink;
        setTimeout(() => setIsRegistering(false), 2000);
      }, 300);
    } else {
      alert(t('registrationLinkNotAvailable'));
    }
  }, [affiliateLink, t]);

  const handleBackFromDeposit = useCallback(() => setNeedsDeposit(false), []);
  const handleBackFromReDeposit = useCallback(() => setNeedsReDeposit(false), []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between relative overflow-hidden bg-[#e51e2a]">
      {needsDeposit ? (
          <div className="flex-grow flex items-center justify-center p-4">
            <DepositMessage onBack={handleBackFromDeposit} onRegister={handleRegister} isRegistering={isRegistering} affiliateLink={affiliateLink} />
          </div>
      ) : needsReDeposit ? (
          <div className="flex-grow flex items-center justify-center p-4">
            <ReDepositMessage onBack={handleBackFromReDeposit} onRegister={handleRegister} isRegistering={isRegistering} affiliateLink={affiliateLink} />
          </div>
      ) : (
          <>
            <header className="absolute top-0 right-0 p-4 z-20 flex items-center gap-2">
                <button onClick={onOpenGuide} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors" aria-label={t('openGuide')}>
                    <GuideIcon className="w-6 h-6" />
                </button>
                <button onClick={onOpenSidebar} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors" aria-label={t('openMenu')}>
                    <MenuIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="w-full max-w-sm flex flex-col items-center z-10 px-4 pt-12 sm:pt-16">
                <img src="https://i.postimg.cc/d0V9DrJY/Picsart-25-11-04-16-01-32-557.png" alt="Aviator Predictor Pro" className="w-48 object-contain -mb-2" draggable="false" onContextMenu={(e) => e.preventDefault()} />
                <h1 className="font-luckiest text-[2.5rem] leading-none text-white tracking-wide text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                    AVIATOR PREDICTOR PRO
                </h1>

                <div className="w-full flex flex-col items-center space-y-5 mt-12 sm:mt-16">
                    <div className="w-full">
                        <label htmlFor="playerId" className="font-poppins text-white text-xs font-bold mb-1.5 block text-left tracking-widest">
                            {t('playerIdLabel').toUpperCase()}
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <UserIcon />
                            </div>
                            <input
                                id="playerId"
                                type="text"
                                value={playerId}
                                onChange={(e) => setPlayerId(e.target.value)}
                                placeholder="12345678"
                                className="w-full pl-12 pr-4 py-3.5 bg-white border-0 rounded-xl text-black placeholder-gray-500 font-sans text-lg focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300 shadow-md"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={isLoading || !playerId}
                        className="w-full py-3 bg-[#f8d7da] rounded-xl text-[#e51e2a] font-russo font-bold text-xl tracking-wider hover:bg-[#f6c8cc] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[28px]">
                                <svg className="animate-spin h-5 w-5 text-[#b20e17]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <span>{t('continue')}</span>
                        )}
                    </button>
                </div>
                
                {error && (
                    <div className="w-full mt-4 p-3 rounded-md text-center text-sm bg-red-800/80 text-white border border-red-600 font-poppins">
                        {error}
                    </div>
                )}

                <div className="w-full text-center mt-8">
                    <p className="font-poppins text-white text-xs mb-2 font-bold tracking-wider">{t('dontHaveAccount').toUpperCase()}</p>
                    <button
                        onClick={handleRegister}
                        disabled={!affiliateLink || isRegistering}
                        className="w-full py-3 bg-white rounded-xl text-[#e51e2a] font-russo font-bold text-xl tracking-wider hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                        {isRegistering ? (
                            <div className="flex justify-center items-center h-[28px]">
                                <svg className="animate-spin h-5 w-5 text-[#b20e17]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <span>{t('registerHere')}</span>
                        )}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-[-1px] left-[-1px] right-[-1px] h-[calc(30vh+1px)] z-0 pointer-events-none">
              <div className="relative w-full h-full">
                <svg
                  className="absolute bottom-0 left-0 w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ filter: 'drop-shadow(0 -4px 5px rgba(0, 0, 0, 0.15))' }}
                >
                  <path d="M0,100 C35,100 70,20 100,20 V100 Z" fill="white" />
                </svg>

                <div className="absolute bottom-4 right-5 text-center z-10 pointer-events-auto">
                    <img 
                        src="https://i.postimg.cc/mZJK0nDd/20251104-203250.png" 
                        alt="Aviator Predictor Pro" 
                        className="w-24 opacity-30 mx-auto"
                        draggable="false" onContextMenu={(e) => e.preventDefault()}
                    />
                    <p className="font-luckiest text-sm -mt-3" style={{color: '#c0c0d0', opacity: 0.8}}>
                      AVIATOR PREDICTOR PRO
                    </p>
                </div>
              </div>
            </div>
          </>
      )}
    </div>
  );
};

export default LoginScreen;