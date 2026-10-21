import React, { useState, useEffect, useRef } from 'react';
import { Award, Flame, Menu, X, Bug, User, LogOut, ShieldCheck, Database } from 'lucide-react';
import { LevelInfo } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export type AppTab =
  | 'landing'
  | 'dashboard'
  | 'challenges'
  | 'workspace'
  | 'progress'
  | 'about'
  | 'scanner'
  | 'signin'
  | 'signup'
  | 'reset-password'
  | '404';

interface NavbarProps {
  currentTab: AppTab;
  onNavigate: (tab: AppTab) => void;
  totalXp: number;
  streakDays: number;
  levelInfo: LevelInfo;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  totalXp,
  streakDays,
  levelInfo
}) => {
  const { user, profile, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const navItems: { id: AppTab; label: string; isNew?: boolean }[] = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'challenges', label: 'Debug Challenges' },
    { id: 'scanner', label: 'Code Scanner', isNew: true },
    { id: 'progress', label: 'Progress' },
    { id: 'about', label: 'How It Works' }
  ];

  const handleNavClick = (tab: AppTab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    handleNavClick('landing');
  };

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuOpen && headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || null;

  return (
    <header ref={headerRef} className="sticky top-3 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className="bg-white border-[2.5px] border-[#2F2E33] rounded-2xl shadow-[4px_4px_0px_#2F2E33] px-4 sm:px-6 py-3 transition-all">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Brand: clickable and navigates to appropriate route */}
          <button
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
            aria-label="BugTrail AI Home"
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24C566] rounded-xl group shrink-0 transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#24C566] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
              <Bug className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold font-display tracking-tight text-[#2F2E33] leading-none">
                BugTrail <span className="text-[#24C566]">AI</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#858B98] flex items-center gap-1">
                {isConfigured ? (
                  <>
                    <Database className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Supabase DB</span>
                  </>
                ) : (
                  <span>Local Demo Mode</span>
                )}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-bold" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24C566] ${
                    isActive
                      ? 'bg-[#E5E0FA] text-[#2F2E33] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]'
                      : 'text-[#2F2E33] hover:bg-[#FFF9F4] hover:border-2 hover:border-[#2F2E33]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-full bg-[#9AF7A0] text-[#2F2E33] border border-[#2F2E33]">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Learner Stats & Auth Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Streak Counter */}
            <div
              title={`${streakDays} day streak`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2F2E33] bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33]"
            >
              <Flame className="w-4 h-4 text-[#2F2E33] fill-[#2F2E33]" />
              <span className="font-mono">{streakDays}</span>
              <span className="hidden lg:inline">d</span>
            </div>

            {/* Total XP */}
            <button
              onClick={() => handleNavClick('progress')}
              title={`Level ${levelInfo.levelNumber}: ${totalXp} Total XP earned`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2F2E33] bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24C566]"
            >
              <Award className="w-4 h-4" />
              <span className="font-mono">{totalXp} XP</span>
            </button>

            {/* Auth Buttons / Profile Indicator */}
            {displayName ? (
              <div className="flex items-center gap-2">
                <div
                  title={`Signed in as ${displayName}`}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-extrabold text-[#2F2E33] bg-[#ADDCE8] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33]"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="max-w-[110px] truncate">{displayName}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2 text-[#2F2E33] bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:bg-rose-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24C566]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('signin')}
                  className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24C566] ${
                    currentTab === 'signin' ? 'bg-[#24C566] text-[#2F2E33]' : 'bg-[#ADDCE8] text-[#2F2E33]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-extrabold rounded-xl border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] transition-all bg-[#24C566] text-[#2F2E33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24C566]"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button with accessible labels & state */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#2F2E33] border-2 border-[#2F2E33] rounded-xl bg-[#FFF9F4] shadow-[2px_2px_0px_#2F2E33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24C566]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobile-navigation-drawer"
            aria-label="Mobile Navigation Drawer"
            className="md:hidden pt-4 mt-3 border-t-2 border-[#2F2E33] flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={currentTab === item.id ? 'page' : undefined}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between border-2 border-[#2F2E33] transition-all ${
                  currentTab === item.id
                    ? 'bg-[#E5E0FA] shadow-[2px_2px_0px_#2F2E33]'
                    : 'bg-white hover:bg-[#FFF9F4]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded bg-[#9AF7A0] border border-[#2F2E33]">
                      NEW
                    </span>
                  )}
                </div>
              </button>
            ))}

            {!displayName ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleNavClick('signin')}
                  className="w-full text-center px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-[#ADDCE8] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="w-full text-center px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-[#24C566] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full text-center px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-rose-200 text-rose-950 border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] mt-2"
              >
                Sign Out ({displayName})
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
