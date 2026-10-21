import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Check, AlertCircle, Bug } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (email: string, name: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);

    // Simulate authenticating local profile securely
    setTimeout(() => {
      setLoading(false);
      const displayName = name.trim() || email.split('@')[0];
      localStorage.setItem('bugtrail_user_email', email);
      localStorage.setItem('bugtrail_user_name', displayName);
      setSuccessMsg(mode === 'signin' ? 'Successfully signed in!' : 'Account created successfully!');
      setTimeout(() => {
        onSuccess(email, displayName);
        onClose();
      }, 600);
    }, 500);
  };

  return (
    <div className="fixed inset-[#000000]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFF9F4] border-[2.5px] border-[#2F2E33] rounded-3xl shadow-[8px_8px_0px_#2F2E33] max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#2F2E33] border-2 border-[#2F2E33] bg-white rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#24C566] border-2 border-[#2F2E33] shadow-[3px_3px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
            <Bug className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold font-display text-[#2F2E33]">
              {mode === 'signin' ? 'Welcome Back!' : 'Join BugTrail AI'}
            </h2>
            <p className="text-xs font-bold text-[#858B98]">
              {mode === 'signin' ? 'Log in to save progress & track streaks' : 'Start your C & Python debugging journey'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#E4E1DF] border-2 border-[#2F2E33] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-[#24C566] text-[#2F2E33] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]'
                : 'text-[#2F2E33] hover:text-[#000000]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-[#24C566] text-[#2F2E33] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]'
                : 'text-[#2F2E33] hover:text-[#000000]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Error or Success */}
        {error && (
          <div className="mb-4 p-3 bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl text-xs font-bold text-[#2F2E33] flex items-center gap-2 shadow-[2px_2px_0px_#2F2E33]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-xl text-xs font-bold text-[#2F2E33] flex items-center gap-2 shadow-[2px_2px_0px_#2F2E33]">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2F2E33] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#858B98]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#2F2E33] rounded-xl text-sm font-bold text-[#2F2E33] focus:outline-none focus:ring-2 focus:ring-[#24C566] shadow-[2px_2px_0px_#2F2E33]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2F2E33] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#858B98]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#2F2E33] rounded-xl text-sm font-bold text-[#2F2E33] focus:outline-none focus:ring-2 focus:ring-[#24C566] shadow-[2px_2px_0px_#2F2E33]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2F2E33] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#858B98]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-[#2F2E33] rounded-xl text-sm font-bold text-[#2F2E33] focus:outline-none focus:ring-2 focus:ring-[#24C566] shadow-[2px_2px_0px_#2F2E33]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#858B98] hover:text-[#2F2E33]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-sm py-3 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin font-mono">⚡ Processing...</span>
            ) : mode === 'signin' ? (
              'Sign In to BugTrail'
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
