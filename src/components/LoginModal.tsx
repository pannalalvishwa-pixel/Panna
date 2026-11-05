import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Train,
  CheckCircle2,
  ArrowRight,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { EmployeeProfile } from '../types/railway';
import { validateEmployeePassword, getSampleInitialData } from '../utils/storage';

interface LoginModalProps {
  onLoginSuccess: (mobile: string, defaultProfile?: Partial<EmployeeProfile>) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [password, setPassword] = useState('railway123');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Password Login Handler
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const isValid = validateEmployeePassword(cleanMobile, password);
      if (!isValid) {
        setLoading(false);
        setError('Incorrect password. Default sample password is railway123.');
        return;
      }

      setLoading(false);
      onLoginSuccess(cleanMobile);
    }, 300);
  };

  // 2. OTP Request Handler
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(generated);
      setOtpSent(true);
      setLoading(false);
      setOtpCode('');
    }, 400);
  };

  // 3. OTP Verify Handler
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode !== simulatedOtp && otpCode !== '123456') {
      setError('Incorrect OTP. Please enter the code shown or 123456.');
      return;
    }

    onLoginSuccess(mobileNumber);
  };

  // One-click quick login with sample credentials
  const handleQuickLoginSample = () => {
    setMobileNumber('9876543210');
    setPassword('railway123');
    onLoginSuccess('9876543210');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Railway Branding Header */}
        <div className="bg-[#0B3C68] text-white p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Train className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <Train className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-300 tracking-wider uppercase">
                Indian Railways Running Staff
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Spell Duty Portal Login
              </h1>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 mt-3 text-xs text-blue-200">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Password Protected Employee Access</span>
          </div>
        </div>

        {/* Login Method Tabs */}
        <div className="px-6 pt-4 pb-1">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setError('');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'password'
                  ? 'bg-white text-[#0B3C68] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setError('');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'otp'
                  ? 'bg-white text-[#0B3C68] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OTP Login</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-3 space-y-4">
          {/* TAB 1: PASSWORD LOGIN */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-sm font-medium text-slate-500 pointer-events-none">
                    <span className="text-slate-800 font-bold">+91</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-16 pr-10 py-2.5 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 transition-all font-mono"
                    autoFocus
                  />
                  <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Login Password (पासवर्ड)
                  </label>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className="text-[11px] text-[#0B3C68] font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter login password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || mobileNumber.length < 10 || !password}
                className="w-full py-3 px-4 bg-[#0B3C68] hover:bg-[#082a4a] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Sign In with Password'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Sample Credentials Card & One-Click Auto-login */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B3C68] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#0B3C68]" /> Sample Employee Credentials:
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200/80 text-blue-950 px-1.5 py-0.5 rounded">
                    SER / SRC
                  </span>
                </div>
                <div className="text-slate-700 space-y-0.5">
                  <p>
                    Employee: <strong>Pannalal Kumar</strong> · <span className="text-[#0B3C68]">Tech I</span>
                  </p>
                  <p>
                    Mobile: <span className="font-mono font-bold text-slate-900">9876543210</span>
                  </p>
                  <p>
                    Default Password:{' '}
                    <code className="font-mono font-bold text-[#0B3C68] bg-white px-2 py-0.5 rounded border border-blue-200">
                      railway123
                    </code>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleQuickLoginSample}
                  className="w-full mt-1.5 py-1.5 px-3 bg-white hover:bg-blue-100 text-[#0B3C68] font-bold text-xs rounded-xl border border-blue-300 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>One-Tap Quick Login (Pannalal Kumar)</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: OTP LOGIN / VERIFY */}
          {loginMethod === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 text-sm font-medium text-slate-500 pointer-events-none">
                        <span className="text-slate-800 font-bold">+91</span>
                        <span className="text-slate-300">|</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-16 pr-10 py-2.5 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 transition-all font-mono"
                        autoFocus
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || mobileNumber.length < 10}
                    className="w-full py-3 px-4 bg-[#0B3C68] hover:bg-[#082a4a] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#0B3C68] shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-slate-700">
                      <p className="font-semibold text-slate-900">
                        OTP sent to +91 {mobileNumber}
                      </p>
                      <p className="mt-0.5 text-slate-600">
                        Verification Code:{' '}
                        <span className="font-mono font-bold text-[#0B3C68] tracking-widest text-sm bg-white px-2 py-0.5 rounded border border-blue-300">
                          {simulatedOtp}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Enter 6-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpCode(simulatedOtp || '123456')}
                        className="text-xs text-[#0B3C68] font-semibold hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Auto-fill OTP
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full py-2.5 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 transition-all font-mono"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="py-2.5 px-3 border border-slate-300 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={otpCode.length < 6}
                      className="flex-1 py-2.5 px-4 bg-[#0B3C68] hover:bg-[#082a4a] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify & Open Spells
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
