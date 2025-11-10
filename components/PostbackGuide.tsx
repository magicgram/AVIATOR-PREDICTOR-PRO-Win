
import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PostbackGuideProps {
  onBack: () => void;
}

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

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

const CopyableUrl: React.FC<{ url: string }> = ({ url }) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [url]);

    return (
        <div className="mt-2 flex items-center justify-between bg-red-100 p-2 rounded-md">
            <code className="font-mono text-xs md:text-sm text-red-600 font-bold break-all">{url}</code>
            <button onClick={handleCopy} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors flex-shrink-0" aria-label={t('copy')}>
                {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};

const PostbackGuide: React.FC<PostbackGuideProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [domain, setDomain] = useState('');

    useEffect(() => {
        setDomain(window.location.origin);
    }, []);

    const regUrl = `${domain}/api/postback?event_type=registration&user_id={user_id}`;
    const ftdUrl = `${domain}/api/postback?event_type=first_deposit&user_id={user_id}&amount={amount}`;
    const depUrl = `${domain}/api/postback?event_type=recurring_deposit&user_id={user_id}&amount={amount}`;

    return (
        <div className="w-full h-full flex flex-col text-gray-800 font-poppins">
            <header className="flex items-center mb-4 flex-shrink-0">
                <div className="w-10">
                    <button onClick={onBack} className="p-2 rounded-full text-gray-600 hover:bg-red-100" aria-label={t('goBack')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                </div>
                <h1 className="text-lg md:text-xl font-russo text-[#e51e2a] tracking-wide text-center flex-grow uppercase">{t('postbackGuideTitle')}</h1>
                <div className="w-10"></div>
            </header>
            
            <div className="flex-grow overflow-y-auto px-1 space-y-6">
                <p className="text-center text-gray-500 text-sm" dangerouslySetInnerHTML={{ __html: t('postbackGuideDescription') }}/>
                
                {domain && (
                    <div className="p-2 text-center bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                        {t('postbackGuideImportant')}: <strong className="font-mono">{domain}</strong>
                    </div>
                )}

                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <h2 className="font-bold text-gray-800">{t('postbackGuideStep1Title')}</h2>
                    <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: t('postbackGuideStep1Desc') }} />
                </div>

                <div className="space-y-4">
                    <h2 className="text-center font-russo text-lg text-gray-800">{t('postbackGuideStep2Title')}</h2>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <h3 className="font-bold">{t('postbackGuideRegistrationTitle')}</h3>
                        <p className="text-sm text-gray-600">{t('postbackGuideRegistrationDesc')}</p>
                        <CopyableUrl url={regUrl} />
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <h3 className="font-bold">{t('postbackGuideFtdTitle')}</h3>
                        <p className="text-sm text-gray-600">{t('postbackGuideFtdDesc')}</p>
                        <CopyableUrl url={ftdUrl} />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <h3 className="font-bold">{t('postbackGuideDepTitle')}</h3>
                        <p className="text-sm text-gray-600">{t('postbackGuideDepDesc')}</p>
                        <CopyableUrl url={depUrl} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostbackGuide;
