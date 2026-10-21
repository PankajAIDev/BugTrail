import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Bug,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Auth3DScene } from '../components/auth/Auth3DScene';

interface SignInViewProps {
  onNavigateToSignUp: () => void;
  onNavigateToHome: () => void;
  onNavigateToResetPassword?: () => void;
}

export const SignInView: React.FC<SignInViewProps> = ({
  onNavigateToSignUp,
  onNavigateToHome
}) => {
  const { signIn, signInWithGoogle, resetPassword, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password modal
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Invalid email or password. Please double check and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Your email address has not been confirmed yet. Please check your inbox.');
        } else if (error.message.includes('Rate limit exceeded')) {
          setErrorMsg('Too many login attempts. Please wait a few moments before trying again.');
        } else {
          setErrorMsg(error.message);
        }
      } else {
        onNavigateToHome();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setResetErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSendingReset(true);

    try {
      const { error } = await resetPassword(forgotEmail.trim());
      if (error) {
        setResetErrorMsg(error.message);
      } else {
        setResetSentSuccess(true);
      }
    } catch (err: any) {
      setResetErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-[#2F2E33] flex flex-col font-sans p-4 sm:p-6 lg:p-8 selection:bg-[#24C566]/30">
      
      {/* Top Navigation */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between mb-6">
        <button
          onClick={onNavigateToHome}
          className="flex items-center gap-2.5 focus-visible:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#24C566] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33] font-extrabold">
            <Bug className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-extrabold font-display tracking-tight text-[#2F2E33] leading-none">
              BugTrail <span className="text-[#24C566]">AI</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#858B98]">
              Find the bug. Understand the fix.
            </span>
          </div>
        </button>

        <button
          onClick={onNavigateToSignUp}
          className="px-4 py-2 text-xs font-extrabold text-[#2F2E33] bg-[#24C566] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          Create Free Account
        </button>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: 3D Scene */}
        <div className="lg:col-span-6 w-full hidden lg:block h-[540px]">
          <Auth3DScene />
        </div>

        {/* Right Column: SignIn Card */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className="card-brutal bg-white p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              {!isConfigured && (
                <div className="bg-[#E5E0FA] border-2 border-[#2F2E33] rounded-xl p-3.5 space-y-2 shadow-[2px_2px_0px_#2F2E33]">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-xs font-mono font-extrabold text-[#2F2E33]">
                      <Sparkles className="w-3.5 h-3.5 text-[#24C566]" />
                      <span>Local Demo Mode Active</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-[#2F2E33]/80 leading-relaxed">
                    Supabase environment variables are not configured. You can test all features instantly using Local Demo Mode or click below.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('student@bugtrail.ai');
                      setPassword('demo12345');
                      signIn('student@bugtrail.ai', 'demo12345').then(() => onNavigateToHome());
                    }}
                    className="w-full py-2 px-3 bg-[#24C566] text-[#2F2E33] border-2 border-[#2F2E33] rounded-lg text-xs font-extrabold shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Demo Sign In</span>
                  </button>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm font-bold text-[#858B98]">
                Sign in to sync your debugging progress, level XP, and AI Tutor sessions.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl p-3.5 flex items-start gap-3 text-[#2F2E33] text-xs font-extrabold shadow-[2px_2px_0px_#2F2E33] animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#2F2E33]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#2F2E33] font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#858B98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    disabled={isLoading}
                    className="w-full bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-[#2F2E33] placeholder-[#858B98] focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2F2E33] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#2F2E33] font-mono">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-xs font-mono font-extrabold text-[#2F2E33] underline hover:text-[#24C566]"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#858B98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl py-2.5 pl-10 pr-10 text-sm font-bold text-[#2F2E33] placeholder-[#858B98] focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2F2E33] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#858B98] hover:text-[#2F2E33]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  const { error } = await signInWithGoogle();
                  setIsLoading(false);
                  if (!error) {
                    onNavigateToHome();
                  }
                }}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white border-2 border-[#2F2E33] rounded-xl text-xs font-extrabold text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="h-0.5 bg-[#E4E1DF] flex-1" />
                <span className="text-[10px] font-mono font-extrabold text-[#858B98] uppercase">or with email</span>
                <div className="h-0.5 bg-[#E4E1DF] flex-1" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-sm py-3.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#2F2E33] border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Bottom Switch Link */}
            <div className="text-center text-xs font-bold text-[#858B98] pt-2 font-mono">
              Don&apos;t have an account yet?{' '}
              <button
                onClick={onNavigateToSignUp}
                className="font-extrabold text-[#2F2E33] underline hover:text-[#24C566]"
              >
                Sign Up Free
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-[#2F2E33]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-brutal bg-white p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b-2 border-[#2F2E33] pb-3">
              <div className="flex items-center gap-2 font-extrabold font-display text-[#2F2E33] text-lg">
                <KeyRound className="w-5 h-5 text-[#24C566]" />
                <span>Reset Your Password</span>
              </div>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetSentSuccess(false);
                  setResetErrorMsg(null);
                }}
                className="p-1 rounded-lg border-2 border-[#2F2E33] hover:bg-[#FFF9F4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSentSuccess ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-xl text-[#2F2E33] text-xs font-bold flex items-start gap-2 shadow-[2px_2px_0px_#2F2E33]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#24C566]" />
                  <span>Password recovery link sent! Check your email inbox to reset your password.</span>
                </div>
                <button
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="btn-secondary w-full text-xs py-2.5"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendResetEmail} className="space-y-3">
                <p className="text-xs font-bold text-[#858B98]">
                  Enter your registered email address and we will send you a password recovery link.
                </p>

                {resetErrorMsg && (
                  <div className="p-3 bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl text-[#2F2E33] text-xs font-bold shadow-[2px_2px_0px_#2F2E33]">
                    {resetErrorMsg}
                  </div>
                )}

                <div className="relative">
                  <Mail className="w-4 h-4 text-[#858B98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@university.edu"
                    disabled={isSendingReset}
                    className="w-full bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-[#2F2E33] focus:outline-none focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="btn-primary w-full text-xs py-2.5"
                >
                  {isSendingReset ? 'Sending Email...' : 'Send Recovery Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl w-full mx-auto text-center text-xs font-bold text-[#858B98] mt-6">
        BugTrail AI • Neo-Brutalist Authentication with Supabase
      </div>

    </div>
  );
};
