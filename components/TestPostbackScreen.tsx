

import React, { useState } from 'react';
import * as authService from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

interface TestPostbackScreenProps {
  onBack: () => void;
}

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);


const TestPostbackScreen: React.FC<TestPostbackScreenProps> = ({ onBack }) => {
  const [userId, setUserId] = useState('testuser123');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleAction = async (action: (id: string, amount?: any) => Promise<string>, amount?: number) => {
    if (!userId) {
        setError(t('pleaseEnterUserId'));
        return;
    }
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
        const result = await action(userId, amount);
        if (result.startsWith('SUCCESS:')) {
            setMessage(result);
        } else { // It's an error from the service layer
            setError(result);
        }
    } catch(err) { // This handles network errors etc.
        setError(t('unexpectedErrorOccurred'));
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col text-gray-800">
      <header className="flex items-center mb-4 flex-shrink-0">
        <div className="w-10">
          <button onClick={onBack} className="p-2 rounded-full text-gray-600 hover:bg-red-100" aria-label={t('goBack')}>
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>
        <h1 className="text-xl md:text-2xl font-russo text-[#e51e2a] tracking-wide text-center flex-grow uppercase">{t('postbackTestingTool')}</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-grow overflow-y-auto px-1">
        <p className="text-center text-gray-500 text-sm mb-6 font-poppins">
          {t('postbackToolDescription')}
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="userIdTest" className="text-sm font-semibold text-gray-600 font-poppins">
              {t('userIdToTest')}
            </label>
            <input
              id="userIdTest"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="testuser123"
              className="mt-2 w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition duration-300"
            />
          </div>
          
          {error && (
              <div className="p-3 rounded-lg text-center text-sm bg-red-100 text-red-700 border border-red-200">
                  {error}
              </div>
          )}
          {message && (
              <div className="p-3 rounded-lg text-center text-sm bg-green-100 text-green-700 border border-green-200">
                  {message}
              </div>
          )}

          <button
            onClick={() => handleAction(authService.testRegistration)}
            disabled={isLoading}
            className="w-full py-3 bg-transparent border-2 border-[#e51e2a] rounded-xl text-[#e51e2a] font-russo font-bold text-lg hover:bg-red-50 disabled:opacity-70 transition duration-300"
          >
            {t('testRegistration')}
          </button>
          <button
            onClick={() => handleAction(authService.testFirstDeposit, 10)}
            disabled={isLoading}
            className="w-full py-3 bg-transparent border-2 border-[#e51e2a] rounded-xl text-[#e51e2a] font-russo font-bold text-lg hover:bg-red-50 disabled:opacity-70 transition duration-300"
          >
            {t('testFirstDeposit', { amount: '$10' })}
          </button>
          <button
            onClick={() => handleAction(authService.testFailedDeposit, 2)}
            disabled={isLoading}
            className="w-full py-3 bg-transparent border-2 border-[#e51e2a] rounded-xl text-[#e51e2a] font-russo font-bold text-lg hover:bg-red-50 disabled:opacity-70 transition duration-300"
          >
            {t('testFailedDeposit', { amount: '$2' })}
          </button>
          <button
            onClick={() => handleAction(authService.testReDeposit, 5)}
            disabled={isLoading}
            className="w-full py-3 bg-transparent border-2 border-[#e51e2a] rounded-xl text-[#e51e2a] font-russo font-bold text-lg hover:bg-red-50 disabled:opacity-70 transition duration-300"
          >
            {t('testReDeposit', { amount: '$5' })}
          </button>

          <div className="w-1/4 h-px bg-red-200 my-3 mx-auto"></div>

          <button
            onClick={() => handleAction(authService.clearUserData)}
            disabled={isLoading}
            className="w-full py-3 bg-transparent border-2 border-gray-400 rounded-xl text-gray-500 font-russo font-bold text-lg hover:bg-gray-100 disabled:opacity-70 transition duration-300"
          >
            {t('clearUserData')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TestPostbackScreen);