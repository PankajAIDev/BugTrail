import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Bug } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ResetPasswordViewProps {
  onNavigateToHome: () => void;
  onNavigateToSignIn: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onNavigateToHome,
  onNavigateToSignIn
}) => {
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-[#2F2E33] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="card-brutal bg-white p-6 sm:p-8 max-w-md w-full space-y-6">
        
        {/* Logo Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#2F2E33] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#24C566] text-[#2F2E33] border-2 border-[#2F2E33] flex items-center justify-center font-extrabold shadow-[2px_2px_0px_#2F2E33]">
            <Bug className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold font-display text-lg tracking-tight text-[#2F2E33]">BugTrail AI</span>
            <p className="text-[11px] font-bold text-[#858B98] font-mono">Password Recovery Session</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-[#9AF7A0] border-2 border-[#2F2E33] flex items-center justify-center text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]">
              <CheckCircle2 className="w-6 h-6 text-[#24C566]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold font-display text-[#2F2E33]">Password Updated!</h2>
              <p className="text-xs font-bold text-[#858B98]">
                Your new password has been saved. You can now sign in with your updated credentials.
              </p>
            </div>
            <button
              onClick={onNavigateToSignIn}
              className="btn-primary w-full text-sm py-3 flex items-center justify-center gap-2"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold font-display text-[#2F2E33]">Set New Password</h2>
              <p className="text-xs font-bold text-[#858B98]">
                Enter a new secure password for your BugTrail AI account.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl p-3 flex items-start gap-2 text-[#2F2E33] text-xs font-extrabold shadow-[2px_2px_0px_#2F2E33]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[#2F2E33] font-mono">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#858B98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl py-2.5 pl-10 pr-10 text-sm font-bold text-[#2F2E33] focus:outline-none focus:bg-white"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[#2F2E33] font-mono">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#858B98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl py-2.5 pl-10 pr-10 text-sm font-bold text-[#2F2E33] focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-sm py-3.5 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div className="text-center text-xs font-bold text-[#858B98] pt-2 font-mono">
          <button onClick={onNavigateToHome} className="hover:underline text-[#2F2E33]">
            Return to BugTrail AI Home
          </button>
        </div>

      </div>
    </div>
  );
};
