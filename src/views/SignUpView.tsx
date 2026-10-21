import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Bug,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Auth3DScene } from '../components/auth/Auth3DScene';

interface SignUpViewProps {
  onNavigateToSignIn: () => void;
  onNavigateToHome: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({
  onNavigateToSignIn,
  onNavigateToHome
}) => {
  const { signUp, signInWithGoogle, isConfigured } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);

  // Password strength logic
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const getStrengthLabel = () => {
    if (strength === 0) return { label: 'Empty', color: 'bg-slate-300' };
    if (strength <= 25) return { label: 'Weak', color: 'bg-[#FFB8B0]' };
    if (strength <= 50) return { label: 'Fair', color: 'bg-[#ADDCE8]' };
    if (strength <= 75) return { label: 'Good', color: 'bg-[#9AF7A0]' };
    return { label: 'Strong', color: 'bg-[#24C566]' };
  };

  const strengthInfo = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms of Service to create an account.');
      return;
    }

    setIsLoading(true);

    try {
      const { error, needConfirmation } = await signUp(email.trim(), password, fullName.trim());

      if (error) {
        if (error.message.includes('already registered')) {
          setErrorMsg('An account with this email address already exists. Please sign in instead.');
        } else {
          setErrorMsg(error.message);
        }
      } else if (needConfirmation) {
        setIsConfirmationSent(true);
      } else {
        onNavigateToHome();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-[#2F2E33] flex flex-col font-sans p-4 sm:p-6 lg:p-8 selection:bg-[#24C566]/30">
      
      {/* Top Header */}
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
          onClick={onNavigateToSignIn}
          className="px-4 py-2 text-xs font-extrabold text-[#2F2E33] bg-[#ADDCE8] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          Sign In Instead
        </button>
      </div>

      {/* Main Two-Column Container */}
      <div className="max-w-7xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: 3D Scene */}
        <div className="lg:col-span-6 w-full hidden lg:block h-[560px]">
          <Auth3DScene />
        </div>

        {/* Right Column: SignUp Form Card */}
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
                    Supabase environment variables are not configured. Submitting this form will automatically create a local demo profile.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      signUp('student@bugtrail.ai', 'demo12345', 'Demo Student').then(() => onNavigateToHome());
                    }}
                    className="w-full py-2 px-3 bg-[#24C566] text-[#2F2E33] border-2 border-[#2F2E33] rounded-lg text-xs font-extrabold shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Demo Sign Up</span>
                  </button>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33] tracking-tight">
                Create Account
              </h1>
              <p className="text-sm font-bold text-[#858B98]">
                Join computer science learners mastering C &amp; Python debugging.
              </p>
            </div>

            {/* Confirmation Pending Card */}
            {isConfirmationSent ? (
              <div className="bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-2xl p-6 space-y-4 shadow-[4px_4px_0px_#2F2E33] animate-in fade-in">
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#2F2E33] flex items-center justify-center text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]">
                  <CheckCircle2 className="w-6 h-6 text-[#24C566]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold font-display text-[#2F2E33]">Verification Email Sent</h3>
                  <p className="text-xs font-bold text-[#2F2E33] leading-relaxed">
                    We sent a confirmation link to <span className="font-mono underline">{email}</span>. Please click the link in your email to activate your account!
                  </p>
                </div>
                <button
                  onClick={onNavigateToSignIn}
                  className="btn-primary w-full text-sm py-3 flex items-center justify-center gap-2"
                >
                  <span>Go to Sign In Page</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                
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
                  <span>Sign Up with Google</span>
                </button>

                <div className="flex items-center gap-3 my-1">
                  <div className="h-0.5 bg-[#E4E1DF] flex-1" />
                  <span className="text-[10px] font-mono font-extrabold text-[#858B98] uppercase">or with email</span>
                  <div className="h-0.5 bg-[#E4E1DF] flex-1" />
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl p-3.5 flex items-start gap-3 text-[#2F2E33] text-xs font-extrabold shadow-[2px_2px_0px_#2F2E33] animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#2F2E33]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#2F2E33] font-mono">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#858B98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ada Lovelace"
                      disabled={isLoading}
                      className="w-full bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-[#2F2E33] placeholder-[#858B98] focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2F2E33] transition-all"
                    />
                  </div>
                </div>

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
                    {password && (
                      <span className="text-[10px] font-mono font-extrabold text-[#2F2E33]">
                        Strength: <span className="underline">{strengthInfo.label}</span>
                      </span>
                    )}
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="h-2 w-full bg-[#E4E1DF] border border-[#2F2E33] rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#2F2E33] font-mono">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#858B98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl py-2.5 pl-10 pr-10 text-sm font-bold text-[#2F2E33] placeholder-[#858B98] focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2F2E33] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#858B98] hover:text-[#2F2E33]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className={`w-5 h-5 rounded-md border-2 border-[#2F2E33] flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                      agreeTerms
                        ? 'bg-[#24C566] text-[#2F2E33] shadow-[1px_1px_0px_#2F2E33]'
                        : 'bg-[#FFF9F4]'
                    }`}
                  >
                    {agreeTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <label
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className="text-xs font-bold text-[#2F2E33] cursor-pointer leading-tight select-none"
                  >
                    I agree to the <span className="underline">Terms of Service</span> and acknowledge privacy policies.
                  </label>
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            )}

            {/* Bottom Switch Link */}
            <div className="text-center text-xs font-bold text-[#858B98] pt-2 font-mono">
              Already have an account?{' '}
              <button
                onClick={onNavigateToSignIn}
                className="font-extrabold text-[#2F2E33] underline hover:text-[#24C566]"
              >
                Sign In
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="max-w-7xl w-full mx-auto text-center text-xs font-bold text-[#858B98] mt-6">
        BugTrail AI • Neo-Brutalist Authentication with Supabase
      </div>

    </div>
  );
};
