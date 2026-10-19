import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Compass, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../api/client';
import { setAuth } from '../../api/authStorage';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/api/v1/auth/login', data);
      const { token, id, email, fullName, roles } = response.data;
      const roleList: string[] = Array.isArray(roles) ? roles : [];
      const role = roleList.includes('ADMIN') ? 'ADMIN' : roleList.includes('GUIDE') ? 'GUIDE' : 'CUSTOMER';
      setAuth({
        token,
        role,
        user: {
          id,
          email: email || data.email,
          fullName: fullName || (email || data.email),
          role,
          roles: roleList,
        },
      });
      toast.success('Login successful!');
      // Return the user to where they were headed (e.g. a pre-filled booking)
      // instead of always dumping them on the home page.
      const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
      const fallback = role === 'ADMIN' ? '/admin' : '/';
      const target = from?.pathname && from.pathname !== '/login'
        ? `${from.pathname}${from.search ?? ''}`
        : fallback;
      navigate(target, { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-16 bg-gradient-to-br from-teal-50 via-gray-50 to-teal-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-teal-600 font-bold text-2xl mb-2">
            <Compass className="w-8 h-8 text-teal-600" />
            <span>Explore Cambodia</span>
          </Link>
          <p className="text-sm text-gray-500">Sign in to your account to continue exploring</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                {...register('email')}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-teal-600 hover:underline font-medium">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" state={location.state} className="text-teal-600 font-semibold hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      await apiClient.post('/api/v1/auth/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phone,
      });
      setEmail(data.email);
      toast.success('Registration successful! Please enter the 6-digit OTP sent to your email.');
      setStep('otp');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code');
      return;
    }
    try {
      setLoading(true);
      await apiClient.post('/api/v1/auth/verify-registration', { email, otp });
      toast.success('Email verified successfully! Please sign in.');
      navigate('/login', { state: location.state });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await apiClient.post('/api/v1/auth/resend-registration-otp', { email });
      toast.success('A new verification code has been sent to your email.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-16 bg-gradient-to-br from-teal-50 via-gray-50 to-teal-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-teal-600 font-bold text-2xl mb-2">
            <Compass className="w-8 h-8 text-teal-600" />
            <span>Explore Cambodia</span>
          </Link>
          <p className="text-sm text-gray-500">
            {step === 'form' ? 'Create your account to start booking unforgettable tours' : `Enter the 6-digit OTP sent to ${email}`}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
                  placeholder="+855 12 345 678"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Creating Account...' : 'Continue to Verification'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">6-Digit Verification Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-center tracking-widest text-xl font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-gray-50/50"
                  placeholder="123456"
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">Enter the 6-digit code sent to your email. It expires in 10 minutes.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Verifying...' : 'Verify & Complete'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-sm font-semibold text-teal-600 hover:underline disabled:opacity-50"
              >
                Didn't receive the code? Resend
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="text-teal-600 font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      setLoading(true);
      await apiClient.post('/api/v1/auth/forgot-password', { email });
      toast.success('A 6-digit reset code has been sent to your email.');
      navigate('/reset-password', { state: { email } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-16 bg-gradient-to-br from-teal-50 via-gray-50 to-teal-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <Compass className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your email address and we'll send you a 6-digit code to reset your password.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? 'Sending code...' : 'Send Reset Code'}
          </button>
        </form>

        <div className="mt-8 text-sm">
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = (location.state as { email?: string } | null)?.email ?? '';
  const [email, setEmail] = useState(passedEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }
    try {
      setResending(true);
      await apiClient.post('/api/v1/auth/forgot-password', { email });
      toast.success('A new reset code has been sent to your email.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await apiClient.post('/api/v1/auth/reset-password', { email, otp, newPassword: password });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-16 bg-gradient-to-br from-teal-50 via-gray-50 to-teal-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <Compass className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h2>
          <p className="text-sm text-gray-500">Enter the 6-digit code we sent you and choose a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Verification Code</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-11 pr-4 py-3.5 text-center tracking-widest text-xl font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-gray-50/50"
                placeholder="123456"
                required
              />
            </div>
            <div className="text-right mt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-semibold text-teal-600 hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={showNew ? 'Hide password' : 'Show password'}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm bg-gray-50/50"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={showConfirm ? 'Hide password' : 'Show password'}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};
