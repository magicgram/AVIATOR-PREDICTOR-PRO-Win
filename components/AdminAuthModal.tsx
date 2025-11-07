

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || t('incorrectPassword'));
      }
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-red-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="w-full max-w-sm bg-white text-gray-800 rounded-2xl p-6 md:p-8 flex flex-col animate-fade-in shadow-2xl">
        <h1 className="text-2xl font-russo text-center text-[#e51e2a] mb-2 uppercase">{t('adminAccess')}</h1>
        <p className="text-center text-gray-500 mb-6 font-poppins">{t('enterPasswordToAccessTestPage')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition duration-300"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-lg text-center text-sm bg-red-100 text-red-700 border border-red-200">
                {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-transparent border-2 border-gray-300 rounded-xl text-gray-500 font-russo font-bold text-lg hover:bg-gray-100 transition duration-300"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="py-3 bg-[#f8d7da] rounded-xl text-[#e51e2a] font-russo font-bold text-lg tracking-wider hover:bg-[#f6c8cc] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isLoading ? t('verifying') : t('submit')}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(AdminAuthModal);