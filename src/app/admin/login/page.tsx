'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get('redirect') || '/admin';

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => {
        if (res.ok) {
          if (typeof window !== 'undefined') localStorage.setItem('admin_session', 'authenticated');
          router.replace(redirectTo);
        } else {
          if (typeof window !== 'undefined') localStorage.removeItem('admin_session');
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined') localStorage.removeItem('admin_session');
      });
  }, [redirectTo, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('OTP sent to your email!');
        setStep('OTP');
      } else {
        toast.error(data.error || 'Invalid credentials.');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_session', 'authenticated');
        }
        toast.success('Welcome back, Admin!');
        router.push(redirectTo);
      } else {
        toast.error(data.error || 'Incorrect OTP. Please try again.');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 gradient-purple rounded-2xl flex items-center justify-center mx-auto mb-5 glow animate-pulse-glow">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-[var(--font-outfit)] text-white mb-2">
            Admin <span className="gradient-text">Portal</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {step === 'CREDENTIALS' 
              ? 'Enter your admin email and password.' 
              : 'Enter the 6-digit OTP sent to your email.'}
          </p>
        </div>

        {step === 'CREDENTIALS' ? (
          <form onSubmit={handleSendOtp} className="glass rounded-2xl p-8 border border-purple-900/30">
            <div className="mb-4">
              <label className="text-sm text-purple-300 font-medium block mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@travelnjoy.com"
                className="input-dark"
                required
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label className="text-sm text-purple-300 font-medium block mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="input-dark pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Send OTP
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="glass rounded-2xl p-8 border border-purple-900/30">
             <div className="mb-6">
              <label className="text-sm text-purple-300 font-medium block mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                6-Digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                maxLength={6}
                className="input-dark text-center text-2xl tracking-widest"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Verify & Login
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep('CREDENTIALS')}
              className="mt-4 w-full text-sm text-gray-400 hover:text-purple-300 transition-colors"
            >
              Back to Email/Password
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
            Two-Factor Authentication Protected
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
