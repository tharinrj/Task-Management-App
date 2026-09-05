'use client';

import { useState, useEffect, useRef, FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes

export default function RegisterPage() {
  // Step 1 state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 state
  const [step, setStep] = useState<1 | 2>(1);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Shared state
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, verifyOtp, resendOtp, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 2) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown === OTP_EXPIRY_SECONDS]); // restart when resend resets countdown

  if (user) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Step 1: Submit registration form
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      setStep(2);
      setCountdown(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      // Focus first OTP input after transition
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Take only last char
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (newDigits.every((d) => d !== '') && newDigits.join('').length === OTP_LENGTH) {
      handleOtpSubmit(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Move back on backspace if current field is empty
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...otpDigits];
      newDigits[index - 1] = '';
      setOtpDigits(newDigits);
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    // Focus appropriate input
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();

    // Auto-submit if full
    if (newDigits.every((d) => d !== '') && newDigits.join('').length === OTP_LENGTH) {
      handleOtpSubmit(newDigits.join(''));
    }
  };

  const handleOtpSubmit = async (otp?: string) => {
    const code = otp || otpDigits.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await verifyOtp(email, code);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      // Clear OTP on failure
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await resendOtp(email);
      setCountdown(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setSuccessMessage('A new code has been sent to your email');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="bg-mesh" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {step === 1 ? 'Create account' : 'Verify email'}
          </h1>
          <p className="text-sm text-zinc-400">
            {step === 1
              ? 'Sign up to start managing your tasks'
              : (
                  <>
                    We sent a 6-digit code to{' '}
                    <span className="text-purple-400 font-medium">{email}</span>
                  </>
                )}
          </p>
        </div>

        {/* Form card */}
        <div className="glass-strong rounded-2xl p-8">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {successMessage}
            </div>
          )}

          {step === 1 ? (
            /* ───────── STEP 1: Registration Form ───────── */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={isLoading}
                className="w-full btn-gradient !py-3 !rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Sending verification code...' : 'Continue'}
              </button>
            </form>
          ) : (
            /* ───────── STEP 2: OTP Verification ───────── */
            <div className="space-y-6">
              {/* OTP Digit Inputs */}
              <div>
                <label className="block text-xs text-zinc-400 mb-3 uppercase tracking-wider text-center">
                  Enter verification code
                </label>
                <div className="flex justify-center gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="otp-input"
                      style={{
                        width: '48px',
                        height: '56px',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 700,
                        fontFamily: "'Courier New', monospace",
                        letterSpacing: '0',
                        padding: '0',
                        borderRadius: '12px',
                        caretColor: '#7c3aed',
                      }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Countdown & Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-zinc-500">
                    Code expires in{' '}
                    <span className="text-zinc-300 font-medium tabular-nums">
                      {formatTime(countdown)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Code expired
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className="mt-2 text-sm font-medium transition-colors disabled:cursor-not-allowed"
                  style={{
                    color: canResend ? '#a78bfa' : '#52525b',
                  }}
                >
                  {isLoading ? 'Sending...' : 'Resend code'}
                </button>
              </div>

              {/* Verify Button */}
              <button
                id="verify-otp-submit"
                type="button"
                onClick={() => handleOtpSubmit()}
                disabled={isLoading || otpDigits.some((d) => !d)}
                className="w-full btn-gradient !py-3 !rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              {/* Go back */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setSuccessMessage('');
                }}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Back to registration
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <span className="text-sm text-zinc-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
