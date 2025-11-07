

import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import TestPostbackScreen from './TestPostbackScreen';
import LoginScreen from './LoginScreen';
import AdminAuthModal from './AdminAuthModal';
import GuideModal from './GuideModal';

interface LoginContainerProps {
  onLoginSuccess: (playerId: string, predictionsLeft: number) => void;
  affiliateLink: string | null;
}

const LoginContainer: React.FC<LoginContainerProps> = ({ onLoginSuccess, affiliateLink }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'testPostback'
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  }, []);

  const handleOpenSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const handleOpenGuide = useCallback(() => setIsGuideOpen(true), []);
  const handleCloseGuide = useCallback(() => setIsGuideOpen(false), []);

  const handleTestPostbackClick = useCallback(() => {
    setIsSidebarOpen(false);
    setShowAdminModal(true);
  }, []);

  const handleAdminSuccess = useCallback(() => {
    setShowAdminModal(false);
    setCurrentView('testPostback');
  }, []);

  const handleAdminClose = useCallback(() => setShowAdminModal(false), []);
  const handleBackToLogin = useCallback(() => setCurrentView('login'), []);

  const containerClasses = currentView === 'login'
    ? "w-full h-full"
    : "w-full max-w-md h-[90vh] max-h-[700px] flex flex-col p-6 bg-white text-gray-800 rounded-2xl shadow-2xl relative";

  return (
    <div className={containerClasses}>
      {isGuideOpen && <GuideModal onClose={handleCloseGuide} />}
      {showAdminModal && <AdminAuthModal onSuccess={handleAdminSuccess} onClose={handleAdminClose} />}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onNavigate={handleNavigate}
        onLogout={() => {}} // No-op when not logged in
        isLoggedIn={false}
        onTestPostbackClick={handleTestPostbackClick}
      />
      {currentView === 'testPostback' ? (
        <TestPostbackScreen onBack={handleBackToLogin} />
      ) : (
        <LoginScreen 
            onLoginSuccess={onLoginSuccess}
            affiliateLink={affiliateLink}
            onOpenSidebar={handleOpenSidebar}
            onOpenGuide={handleOpenGuide}
        />
      )}
    </div>
  );
};

export default LoginContainer;