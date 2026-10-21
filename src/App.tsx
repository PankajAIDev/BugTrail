import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useProgress } from './hooks/useProgress';
import { Navbar, AppTab } from './components/Navbar';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { LibraryView } from './views/LibraryView';
import { WorkspaceView } from './views/WorkspaceView';
import { ProgressView } from './views/ProgressView';
import { AboutView } from './views/AboutView';
import { ScannerView } from './views/ScannerView';
import { SignInView } from './views/SignInView';
import { SignUpView } from './views/SignUpView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { CHALLENGES } from './data/challenges';
import { Bug, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

function AppContent() {
  const { user, isLoading: isAuthLoading, isConfigured } = useAuth();
  const {
    progress,
    levelInfo,
    accuracyPercent,
    isSyncing,
    syncError,
    recordSubmission,
    revealHint,
    resetProgress
  } = useProgress();

  // Helper to parse path name into AppTab
  const getTabFromPath = (): AppTab => {
    const path = window.location.pathname;
    if (path === '/signin') return 'signin';
    if (path === '/signup') return 'signup';
    if (path === '/reset-password') return 'reset-password';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/challenges') return 'challenges';
    if (path === '/scanner') return 'scanner';
    if (path === '/progress') return 'progress';
    if (path === '/about') return 'about';
    return 'landing';
  };

  const [currentTab, setCurrentTab] = useState<AppTab>(getTabFromPath);
  const [activeChallengeId, setActiveChallengeId] = useState<string>(CHALLENGES[0].id);
  const [authRedirectNotice, setAuthRedirectNotice] = useState<string | null>(null);

  // Sync state with browser location
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Protected route enforcement
  useEffect(() => {
    if (!isAuthLoading && !user) {
      const protectedTabs: AppTab[] = ['dashboard', 'progress'];
      if (protectedTabs.includes(currentTab)) {
        setAuthRedirectNotice(`Please sign in to access your personal ${currentTab}.`);
        handleNavigate('signin');
      }
    }
  }, [currentTab, user, isAuthLoading]);

  const handleNavigate = (tab: AppTab) => {
    // Check if trying to navigate to protected tab while unauthenticated
    if (!user && (tab === 'dashboard' || tab === 'progress')) {
      setAuthRedirectNotice(`Please sign in to access your personal ${tab}.`);
      setCurrentTab('signin');
      window.history.pushState({}, '', '/signin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentTab(tab);
    let path = '/';
    if (tab !== 'landing') {
      path = `/${tab}`;
    }
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChallenge = (id: string) => {
    setActiveChallengeId(id);
    handleNavigate('workspace');
  };

  // Render Loading Screen while Auth Session restores
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] text-[#2F2E33] flex items-center justify-center font-sans p-6">
        <div className="card-brutal bg-white p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#24C566] border-2 border-[#2F2E33] flex items-center justify-center text-[#2F2E33] mx-auto shadow-[2px_2px_0px_#2F2E33]">
            <Bug className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold font-display text-[#2F2E33]">BugTrail AI</h2>
            <p className="text-xs font-bold text-[#858B98] font-mono">Restoring session state...</p>
          </div>
          <Loader2 className="w-6 h-6 text-[#24C566] animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Dedicated full-screen authentication routes
  if (currentTab === 'signin') {
    return (
      <div>
        {authRedirectNotice && (
          <div className="bg-[#ADDCE8] border-b-2 border-[#2F2E33] p-3 text-center text-xs font-extrabold text-[#2F2E33]">
            {authRedirectNotice}
          </div>
        )}
        <SignInView
          onNavigateToSignUp={() => {
            setAuthRedirectNotice(null);
            handleNavigate('signup');
          }}
          onNavigateToHome={() => {
            setAuthRedirectNotice(null);
            handleNavigate('dashboard');
          }}
          onNavigateToResetPassword={() => {
            setAuthRedirectNotice(null);
            handleNavigate('reset-password');
          }}
        />
      </div>
    );
  }

  if (currentTab === 'signup') {
    return (
      <SignUpView
        onNavigateToSignIn={() => handleNavigate('signin')}
        onNavigateToHome={() => handleNavigate('dashboard')}
      />
    );
  }

  if (currentTab === 'reset-password') {
    return (
      <ResetPasswordView
        onNavigateToHome={() => handleNavigate('landing')}
        onNavigateToSignIn={() => handleNavigate('signin')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-[#2F2E33] flex flex-col font-sans selection:bg-[#24C566]/30">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        totalXp={progress.totalXp}
        streakDays={progress.streakDays}
        levelInfo={levelInfo}
      />

      {/* Sync Notification Banner */}
      {isSyncing && (
        <div className="max-w-7xl mx-auto px-4 w-full mb-2">
          <div className="bg-[#ADDCE8] border-2 border-[#2F2E33] rounded-xl px-4 py-1.5 text-xs font-bold flex items-center justify-between text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#24C566] animate-ping" />
              <span>Syncing progress with Firebase Firestore Database...</span>
            </div>
          </div>
        </div>
      )}

      {syncError && (
        <div className="max-w-7xl mx-auto px-4 w-full mb-2">
          <div className="bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl px-4 py-1.5 text-xs font-bold flex items-center justify-between text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]">
            <span>{syncError}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentTab === 'landing' && (
          <LandingView
            onStartDebugging={() => handleNavigate('dashboard')}
            onExploreChallenges={() => handleNavigate('challenges')}
            onOpenScanner={() => handleNavigate('scanner')}
            onSelectChallenge={handleSelectChallenge}
            onOpenAuth={(mode) => handleNavigate(mode)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            totalXp={progress.totalXp}
            completedIds={progress.completedChallengeIds}
            streakDays={progress.streakDays}
            accuracyPercent={accuracyPercent}
            levelInfo={levelInfo}
            attempts={progress.attempts}
            onSelectChallenge={handleSelectChallenge}
            onNavigateToLibrary={() => handleNavigate('challenges')}
            onNavigateToScanner={() => handleNavigate('scanner')}
          />
        )}

        {currentTab === 'challenges' && (
          <LibraryView
            completedIds={progress.completedChallengeIds}
            onSelectChallenge={handleSelectChallenge}
          />
        )}

        {currentTab === 'scanner' && <ScannerView />}

        {currentTab === 'workspace' && (
          <WorkspaceView
            key={activeChallengeId}
            challengeId={activeChallengeId}
            isCompleted={progress.completedChallengeIds.includes(activeChallengeId)}
            hintsRevealedCount={progress.hintsRevealed[activeChallengeId] || 0}
            onNavigateToLibrary={() => handleNavigate('challenges')}
            onSelectChallenge={handleSelectChallenge}
            onRecordSubmission={recordSubmission}
            onRevealHint={revealHint}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            progress={progress}
            levelInfo={levelInfo}
            accuracyPercent={accuracyPercent}
            onResetProgress={resetProgress}
            onSelectChallenge={handleSelectChallenge}
          />
        )}

        {currentTab === 'about' && <AboutView />}
      </main>

      {/* Playful Neo-Brutalist Footer */}
      <footer className="mt-12 border-t-2 border-[#2F2E33] bg-white py-8 text-xs font-bold text-[#2F2E33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#24C566] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
              <Bug className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold font-display text-sm text-[#2F2E33]">BugTrail AI</span>
              <p className="text-[11px] font-bold text-[#858B98]">
                Find the bug. Follow the clues. Understand the fix.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-extrabold text-[#2F2E33]">
            <button onClick={() => handleNavigate('landing')} className="hover:text-[#24C566] transition-colors">
              Home
            </button>
            <button onClick={() => handleNavigate('challenges')} className="hover:text-[#24C566] transition-colors">
              Challenges
            </button>
            <button onClick={() => handleNavigate('scanner')} className="hover:text-[#24C566] transition-colors">
              Code Scanner
            </button>
            <button onClick={() => handleNavigate('signin')} className="hover:text-[#24C566] transition-colors">
              Sign In
            </button>
            <button onClick={() => handleNavigate('signup')} className="hover:text-[#24C566] transition-colors">
              Sign Up
            </button>
          </div>

          <div className="text-[11px] font-bold text-[#858B98]">
            {isConfigured ? 'Connected to Supabase PostgreSQL' : 'Running in Local Demo Mode'}
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
