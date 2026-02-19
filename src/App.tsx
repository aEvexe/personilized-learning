import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/layout/Header';
import { Toast } from './components/layout/Toast';
import { TranslatePopup } from './components/shared/TranslatePopup';
import { CorrectAnswerOverlay } from './components/shared/CorrectAnswerOverlay';
import { LottieCompletionOverlay } from './components/modals/LottieCompletionOverlay';
import { DebugConsole } from './components/shared/DebugConsole';
import AuthModal from './components/auth/AuthModal';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import CurriculumPage from './pages/CurriculumPage';
import UnitPage from './pages/UnitPage';
import LessonPage from './pages/LessonPage';
import ProgressPage from './pages/ProgressPage';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const { isAuthenticated } = useAuth();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Expose showToast globally for services to use
  (window as any).__showToast = showToast;

  return (
    <div className="app-container">
      <Header
        onLoginClick={() => setShowAuthModal(true)}
        onDebugToggle={() => setShowDebug(prev => !prev)}
      />

      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage onLoginClick={() => setShowAuthModal(true)} />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/curriculum" element={<CurriculumPage />} />
          <Route path="/unit/:unitIndex" element={<UnitPage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Routes>
      </div>

      {showAuthModal && !isAuthenticated && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <TranslatePopup />
      <CorrectAnswerOverlay />
      <LottieCompletionOverlay />
      <DebugConsole visible={showDebug} />
    </div>
  );
}
