import React, { useState } from 'react';
import { Smartphone, ShieldCheck, Train, CheckCircle2, ArrowRight } from 'lucide-react';
import { EmployeeProfile } from '../types/railway';

interface LoginModalProps {
  onLoginSuccess: (mobile: string, defaultProfile?: Partial<EmployeeProfile>) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    // Simulate SMS dispatch
    setTimeout(() => {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(generated);
      setOtpSent(true);
      setLoading(false);
      setOtpCode('');
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode !== simulatedOtp && otpCode !== '123456') {
      setError('Incorrect OTP. Please enter the 6-digit code shown or 123456.');
      return;
    }

    onLoginSuccess(mobileNumber);
  };

  const handleAutoFillOtp = () => {
    setOtpCode(simulatedOtp || '123456');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Railway Branding Header */}
        <div className="bg-[#0B3C68] text-white p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Train className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Train className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-300 tracking-wider uppercase">
                Indian Railways Running Staff
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Spell Duty Manager
              </h1>
            </div>
          </div>
          <p className="text-xs text-blue-100/90 mt-3">
            14-Day Spell Duty Records & 24-Hour Railway Time Calculations
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Mobile Number Login
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 pointer-events-none">
                    <span className="text-slate-700 font-semibold">+91</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-16 pr-10 py-3 text-base font-medium rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 transition-all font-mono"
                    autoFocus
                  />
                  <Smartphone className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Enter your registered railway mobile number to access your duty spells.
                </p>
              </div>

              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || mobileNumber.length < 10}
                className="w-full py-3.5 px-4 bg-[#0B3C68] hover:bg-[#082a4a] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-slate-400">
                  Secure OTP verification for Loco Pilots, ALPs, & Guards
                </span>
              </div>
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
                    onClick={handleAutoFillOtp}
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
                  className="w-full py-3 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 transition-all font-mono"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="py-3 px-4 border border-slate-300 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  disabled={otpCode.length < 6}
                  className="flex-1 py-3 px-4 bg-[#0B3C68] hover:bg-[#082a4a] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify & Open Spells
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
