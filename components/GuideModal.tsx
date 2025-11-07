
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

interface GuideModalProps {
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();

    const handleCopy = () => {
        navigator.clipboard.writeText('OGGY').then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

  return (
    <div className="fixed inset-0 bg-red-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="w-full max-w-lg bg-white text-gray-800 rounded-2xl p-6 md:p-8 flex flex-col animate-fade-in shadow-2xl">
        <h1 className="text-3xl font-russo text-center text-[#e51e2a] mb-2 tracking-wide uppercase">{t('howToGetAccess')}</h1>
        <p className="text-center text-gray-500 mb-6 font-poppins">{t('followStepsToUnlock')}</p>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2 font-poppins">
            <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
                <div className="flex-shrink-0 pt-1 font-bold text-red-500 text-xl">1.</div>
                <div>
                <p>{t('guideStep1')}</p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
                <div className="flex-shrink-0 pt-1 font-bold text-red-500 text-xl">2.</div>
                <div>
                <p>{t('guideStep2')}</p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
                <div className="flex-shrink-0 pt-1 font-bold text-red-500 text-xl">3.</div>
                <div>
                <p>{t('guideStep3')}</p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg items-center">
                <div className="flex-shrink-0 font-bold text-red-500 text-xl">4.</div>
                <div className="flex-grow">
                <p>{t('guideStep4')}</p>
                <div className="mt-2 flex items-center justify-between bg-red-100 p-2 rounded-md">
                    <span className="font-mono text-lg text-red-600 font-bold">OGGY</span>
                    <button onClick={handleCopy} className="p-1 text-gray-500 hover:text-red-500 transition-colors" aria-label={t('copyPromocode')}>
                        {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>
                </div>
            </div>
            </div>
            
            <div className="w-full h-px bg-red-200 my-6"></div>

            <div>
                <h2 className="text-xl font-russo text-center text-[#e51e2a] mb-4 uppercase">{t('howToFindPlayerId')}</h2>
                <div className="space-y-4 text-gray-700">
                    <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex-shrink-0 pt-1 font-bold text-red-500 text-xl">1.</div>
                        <div><p>{t('playerIdStep1')}</p></div>
                    </div>
                    <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex-shrink-0 pt-1 font-bold text-red-500 text-xl">2.</div>
                        <div><p>{t('playerIdStep2')}</p></div>
                    </div>
                    <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex-shrink-0 pt-1 font-bold text-red-500 text-xl">3.</div>
                        <div><p>{t('playerIdStep3')}</p></div>
                    </div>
                    <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex-shrink-0 pt-1 font-bold text-red-500 text-xl">4.</div>
                        <div><p>{t('playerIdStep4')}</p></div>
                    </div>
                </div>
            </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-[#f8d7da] rounded-xl text-[#e51e2a] font-russo font-bold text-xl tracking-wider hover:bg-[#f6c8cc] transition-all duration-200 shadow-lg flex-shrink-0"
          aria-label={t('closeGuide')}
        >
          {t('gotIt')}
        </button>
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

export default React.memo(GuideModal);