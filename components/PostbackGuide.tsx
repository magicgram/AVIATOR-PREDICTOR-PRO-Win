
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

const PostbackUrlComponent: React.FC<{
  title: string;
  description: string;
  baseUrl: string;
  params: Array<{ key: string; value: string; desc: string }>;
}> = React.memo(({ title, description, baseUrl, params }) => {
  const url = `${baseUrl}?${params.map(p => `${p.key}=${p.value}`).join('&')}`;
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 mb-3">{description}</p>
        <div className="space-y-2 text-sm">
          {params.map(p => (
            <div key={p.key}>
              <p><code className="text-xs bg-red-100 text-red-700 p-1 rounded">{p.key}</code>: {p.desc}</p>
            </div>
          ))}
        </div>
        <CopyableUrl url={url} />
    </div>
  );
});

const PostbackGuide: React.FC<PostbackGuideProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [domain, setDomain] = useState('');

    useEffect(() => {
        setDomain(window.location.origin);
    }, []);
    
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
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h2 className="font-bold text-lg text-blue-800">Step 1: Find Your Network's Macros</h2>
                    <p className="text-sm text-gray-700 mt-2">
                        In your affiliate panel, find the list of available "macros" or "placeholders". These are special codes that your network replaces with real data. You need to find the macros for:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                        <li><strong>User ID:</strong> This is usually <code>{'{user_id}'}</code> or sometimes <code>{'{sub1}'}</code>.</li>
                        <li><strong>Deposit Amount:</strong> This is almost always <code>{'{amount}'}</code>.</li>
                    </ul>
                    <p className="text-sm text-gray-700 mt-2">
                        The URLs below use these standard macros. If your network uses different ones, you must replace them.
                    </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h2 className="font-bold text-lg text-green-800">Step 2: Set Up Your Postback URLs</h2>
                   <p className="text-sm text-gray-700 mt-2">
                        Your affiliate panel should have separate sections or fields to set a postback for each event (Registration, First Deposit, etc.). Copy the full URL below and paste it into the correct field.
                    </p>
                </div>

                <div className="space-y-4">
                    <PostbackUrlComponent 
                      title={t('postbackGuideRegistrationTitle')}
                      description={t('postbackGuideRegistrationDesc')}
                      baseUrl={`${domain}/api/postback`}
                      params={[
                        { key: 'event_type', value: 'registration', desc: 'This tells our app it was a registration. This part is static and you type it exactly as shown.' },
                        { key: 'user_id', value: '{user_id}', desc: "This is your network's macro for the user's Player ID." }
                      ]}
                    />

                    <PostbackUrlComponent 
                      title={t('postbackGuideFtdTitle')}
                      description={t('postbackGuideFtdDesc')}
                      baseUrl={`${domain}/api/postback`}
                      params={[
                        { key: 'event_type', value: 'first_deposit', desc: 'Tells our app it was a first deposit. Type it exactly as shown.' },
                        { key: 'user_id', value: '{user_id}', desc: "Your network's macro for the Player ID." },
                        { key: 'amount', value: '{amount}', desc: "Your network's macro for the deposit amount." }
                      ]}
                    />

                     <PostbackUrlComponent 
                      title={t('postbackGuideDepTitle')}
                      description={t('postbackGuideDepDesc')}
                      baseUrl={`${domain}/api/postback`}
                      params={[
                        { key: 'event_type', value: 'recurring_deposit', desc: 'Tells our app it was another deposit. Type it exactly as shown.' },
                        { key: 'user_id', value: '{user_id}', desc: "Your network's macro for the Player ID." },
                        { key: 'amount', value: '{amount}', desc: "Your network's macro for the deposit amount." }
                      ]}
                    />
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="font-bold text-lg text-red-800">Troubleshooting: Still not working?</h2>
                    <p className="text-sm text-gray-700 mt-2">
                        If users are still not being registered, try these common fixes:
                    </p>
                    <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 space-y-2">
                        <li>
                            <strong>Check the Player ID macro:</strong> In your affiliate link setup (the one you give to users), make sure you are passing the Player ID correctly. Many platforms require you to set this in a parameter like `sub1`. If you set it as `sub1=PLAYER_ID`, then your postback macro for the ID might be <code>{'{sub1}'}</code> instead of <code>{'{user_id}'}</code>. Try replacing <code>user_id={'{user_id}'}</code> with <code>user_id={'{sub1}'}</code> in the URLs above.
                        </li>
                        <li>
                            <strong>Check the event type parameter:</strong> Some networks use `event` instead of `event_type`. Our server now accepts both, but try changing `event_type=registration` to `event=registration` in your URL if the first option doesn't work.
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default PostbackGuide;
