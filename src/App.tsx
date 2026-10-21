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
import { NotFoundView } from './views/NotFoundView';
import { CHALLENGES } from './data/challenges';
import { Bug, Sparkles, AlertCircle, Loader2, Mail, Shield, FileText, CheckCircle2, X } from 'lucide-react';

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
    if (path === '/' || path === '') return 'landing';
    if (path === '/signin') return 'signin';
    if (path === '/signup') return 'signup';
    if (path === '/reset-password') return 'reset-password';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/challenges') return 'challenges';
    if (path === '/workspace') return 'workspace';
    if (path === '/scanner') return 'scanner';
    if (path === '/progress') return 'progress';
    if (path === '/about') return 'about';
    return '404';
  };

  const [currentTab, setCurrentTab] = useState<AppTab>(getTabFromPath);
  const [activeChallengeId, setActiveChallengeId] = useState<string>(CHALLENGES[0].id);
  const [authRedirectNotice, setAuthRedirectNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Sync state with browser location
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update dynamic page title & meta description per route
  useEffect(() => {
    const metaMap: Record<AppTab, { title: string; desc: string }> = {
      landing: {
        title: 'BugTrail AI — Find the Bug. Understand the Fix.',
        desc: 'Interactive C and Python debugging learning platform with progressive hints, verified solutions, code scanner, and an empathetic AI tutor.'
      },
      dashboard: {
        title: 'Dashboard | BugTrail AI',
        desc: 'Track your debugging progress, level XP, daily streaks, and recommended code challenges.'
      },
      challenges: {
        title: 'Debug Challenges | BugTrail AI',
        desc: 'Explore hands-on debugging scenarios covering pointer errors, memory leaks, off-by-one bugs, and syntax defects.'
      },
      workspace: {
        title: 'Challenge Workspace | BugTrail AI',
        desc: 'Analyze buggy C and Python code, unlock progressive clues, and test your root cause diagnosis.'
      },
      scanner: {
        title: 'Code Scanner & Static Analysis | BugTrail AI',
        desc: 'Paste your C or Python code for instant line-by-line static analysis and verified fix suggestions.'
      },
      progress: {
        title: 'Your Progress & Achievements | BugTrail AI',
        desc: 'View your completed challenges, solved accuracy percentage, unlocked badges, and learning history.'
      },
      about: {
        title: 'How It Works & Safety | BugTrail AI',
        desc: 'Learn about the pedagogical architecture, deterministic verification, and safety guarantees behind BugTrail AI.'
      },
      signin: {
        title: 'Sign In | BugTrail AI',
        desc: 'Sign in to sync your debugging progress, XP, and AI Tutor sessions across devices.'
      },
      signup: {
        title: 'Create Free Account | BugTrail AI',
        desc: 'Join university students and self-taught coders mastering software debugging.'
      },
      'reset-password': {
        title: 'Reset Password | BugTrail AI',
        desc: 'Set a new password for your BugTrail AI account.'
      },
      '404': {
        title: '404 - Page Not Found | BugTrail AI',
        desc: 'The requested debugging scenario or route was not found.'
      }
    };

    const currentMeta = metaMap[currentTab] || metaMap.landing;
    document.title = currentMeta.title;

    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', currentMeta.desc);
  }, [currentTab]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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
    if (tab !== 'landing' && tab !== '404') {
      path = `/${tab}`;
    } else if (tab === '404') {
      path = window.location.pathname;
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
            showToast('Welcome back! Signed in successfully.');
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
        onNavigateToHome={() => {
          showToast('Account created! Welcome to BugTrail AI.');
          handleNavigate('dashboard');
        }}
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
    <div className="min-h-screen bg-[#FFF9F4] text-[#2F2E33] flex flex-col font-sans selection:bg-[#24C566]/30 overflow-x-clip">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-xl px-4 py-3 text-xs font-extrabold text-[#2F2E33] shadow-[4px_4px_0px_#2F2E33] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#24C566] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

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
              <span>Syncing progress with Supabase PostgreSQL Database...</span>
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
            onStartDebugging={() => handleNavigate(user ? 'dashboard' : 'challenges')}
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
            onRecordSubmission={(chId, isCorrect, optId, xp) => {
              recordSubmission(chId, isCorrect, optId, xp);
              if (isCorrect) {
                showToast(`Correct! +${xp} XP awarded to your progress.`);
              }
            }}
            onRevealHint={revealHint}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            progress={progress}
            levelInfo={levelInfo}
            accuracyPercent={accuracyPercent}
            onResetProgress={() => {
              resetProgress();
              showToast('Progress has been reset.');
            }}
            onSelectChallenge={handleSelectChallenge}
          />
        )}

        {currentTab === 'about' && <AboutView />}

        {currentTab === '404' && (
          <NotFoundView
            onNavigateToHome={() => handleNavigate('landing')}
            onNavigateToDashboard={() => handleNavigate(user ? 'dashboard' : 'signin')}
            onNavigateToChallenges={() => handleNavigate('challenges')}
          />
        )}
      </main>

      {/* Playful Neo-Brutalist Footer */}
      <footer className="mt-12 border-t-2 border-[#2F2E33] bg-white py-8 text-xs font-bold text-[#2F2E33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleNavigate(user ? 'dashboard' : 'landing')}
              className="w-8 h-8 rounded-xl bg-[#24C566] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33] shrink-0"
              aria-label="BugTrail AI Home"
            >
              <Bug className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div>
              <span className="font-extrabold font-display text-sm text-[#2F2E33]">BugTrail AI</span>
              <p className="text-[11px] font-bold text-[#858B98]">
                Find the bug. Follow the clues. Understand the fix.
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-extrabold text-[#2F2E33]">
            <button onClick={() => handleNavigate('landing')} className="hover:text-[#24C566] transition-colors">
              Home
            </button>
            <button onClick={() => handleNavigate('challenges')} className="hover:text-[#24C566] transition-colors">
              Challenges
            </button>
            <button onClick={() => handleNavigate('scanner')} className="hover:text-[#24C566] transition-colors">
              Code Scanner
            </button>
            <button onClick={() => handleNavigate('about')} className="hover:text-[#24C566] transition-colors">
              How It Works
            </button>
            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="hover:text-[#24C566] transition-colors"
            >
              Terms &amp; Privacy
            </button>
            <a
              href="mailto:support@bugtrail.ai"
              className="flex items-center gap-1 hover:text-[#24C566] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>support@bugtrail.ai</span>
            </a>
          </div>

          {/* Dynamic Copyright Year & DB Status */}
          <div className="text-[11px] font-bold text-[#858B98] flex flex-col items-center lg:items-end gap-1">
            <span>&copy; {new Date().getFullYear()} BugTrail AI. All rights reserved.</span>
            <span>{isConfigured ? 'Supabase PostgreSQL DB Connected' : 'Local Demo Mode Active'}</span>
          </div>

        </div>
      </footer>

      {/* Terms & Privacy Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-[#2F2E33]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-brutal bg-white p-6 max-w-lg w-full space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b-2 border-[#2F2E33] pb-3">
              <div className="flex items-center gap-2 font-extrabold font-display text-lg text-[#2F2E33]">
                <Shield className="w-5 h-5 text-[#24C566]" />
                <span>Terms of Service &amp; Privacy Policy</span>
              </div>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="p-1 rounded-lg border-2 border-[#2F2E33] hover:bg-[#FFF9F4]"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-[#2F2E33] leading-relaxed">
              <div className="p-3 bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl space-y-1">
                <h4 className="font-extrabold text-[#2F2E33]">1. Educational Purpose &amp; Safety</h4>
                <p className="text-[#858B98]">
                  BugTrail AI is an educational platform designed to teach debugging techniques. It does not execute arbitrary untrusted binaries or user code on server infrastructure.
                </p>
              </div>

              <div className="p-3 bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl space-y-1">
                <h4 className="font-extrabold text-[#2F2E33]">2. Privacy &amp; Data Protection</h4>
                <p className="text-[#858B98]">
                  We store only your account email and challenge learning metrics (XP, solved challenges, and streak). We do not sell, scrape, or share your data with advertisers.
                </p>
              </div>

              <div className="p-3 bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl space-y-1">
                <h4 className="font-extrabold text-[#2F2E33]">3. Questions &amp; Inquiries</h4>
                <p className="text-[#858B98]">
                  For any questions or data deletion requests, email us directly at{' '}
                  <a href="mailto:support@bugtrail.ai" className="text-[#2F2E33] underline font-extrabold">
                    support@bugtrail.ai
                  </a>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsTermsModalOpen(false)}
              className="btn-primary w-full text-xs py-2.5 mt-2"
            >
              Understood
            </button>
          </div>
        </div>
      )}

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
