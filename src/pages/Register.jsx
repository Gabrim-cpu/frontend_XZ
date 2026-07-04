import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';
import { signInWithGoogle, syncSession } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
  });

  // Age decides the role automatically: 50 and above join as Seniors.
  const parsedAge = parseInt(form.age, 10);
  const derivedRole = Number.isNaN(parsedAge) ? null : parsedAge >= 50 ? 'Senior' : 'Youth';

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Plain-language messages a senior can act on — no technical codes.
  const friendlyError = (err) => {
    const code = err?.code || '';
    const msg = err?.message || '';
    if (code.includes('unauthorized-domain')) return 'Google sign-up is not available on this web address yet. Please use the email form below.';
    if (code.includes('popup-closed') || code.includes('cancelled')) return 'The Google window was closed too soon. Please try again and wait a moment.';
    if (code.includes('network') || msg.includes('fetch')) return 'We could not reach the internet. Please check your connection and try again.';
    if (code.includes('email-already-in-use')) return 'An account with this email already exists. Please press "Sign in" instead.';
    if (code.includes('invalid-email')) return 'That email address does not look right. Please check it.';
    if (code.includes('weak-password')) return 'Please choose a longer password — at least 8 characters.';
    if (code.includes('too-many-requests')) return 'Too many tries. Please wait a minute and try again.';
    return 'Something went wrong. Please try again.';
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!form.email.match(/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/)) {
      setError('Please enter a valid email');
      return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (Number.isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
      setError('Please enter your age');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        role: derivedRole,
        age: parsedAge,
        language,
      });

      navigate('/profile');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Google sign-up: age/role are collected on the profile page afterwards,
  // since Google only gives us name, email and photo.
  const handleGoogleSignUp = async () => {
    setError('');
    setSubmitting(true);
    try {
      const user = await signInWithGoogle();
      if (!user) return;
      const idToken = await user.getIdToken();
      const session = await syncSession(idToken, { language });
      navigate(session.isNewUser || !session.user?.is_onboarded ? '/profile' : '/dashboard');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-[100dvh] w-full flex bg-white">
      {/* LEFT — form */}
      <div className="flex-1 lg:w-1/2 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 pt-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition lg:hidden">
            <img src={logoXZ} alt="XZ" className="h-16 w-16" />
            <span className="text-base font-extrabold text-brand-burgundy">XZ</span>
          </button>
          <span className="hidden lg:block" aria-hidden />
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-burgundy transition px-2 py-2 ml-auto"
            aria-label="Back to sign in"
          >
            <ArrowLeft className="w-4 h-4" /> Sign in
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2">
          <div className="w-full max-w-sm space-y-4 animate-fade-in-up">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-extrabold text-brand-burgundy mb-1">Join XZ</h1>
              <p className="text-gray-600 text-base font-medium">Create your account and start building roots.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm" role="alert">
                {error}
              </div>
            )}

            {/* Google sign-up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all min-h-[48px] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">or</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <label htmlFor="name" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="Your name"
                  className="w-full mt-1 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="you@example.com"
                  className="w-full mt-1 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    value={form.password}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="At least 8 characters"
                    className="w-full mt-1 px-4 pr-12 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="age" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age</label>
                  {derivedRole && (
                    <span className="text-xs font-bold text-brand-burgundy bg-brand-burgundy/5 rounded-full px-3 py-1">
                     XZ Classified you as a {derivedRole}
                    </span>
                  )}
                </div>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min={10}
                  max={120}
                  value={form.age}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="e.g. 24 or 65"
                  className="w-full mt-1 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-burgundy text-white py-3 px-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed mt-3"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create Account '
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Already joined XZ before?{' '}
              <Link to="/login" className="text-brand-burgundy font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — burgundy story panel (desktop only, mirror of the sign-in page) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-burgundy text-white overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="relative z-10 flex items-center gap-3 hover:opacity-80 transition w-fit ml-auto">
          <img src={logoXZ} alt="XZ" className="w-16 h-16 brightness-0 invert" />
        </button>

        {/* Headline */}
        <div className="relative z-10 max-w-md ml-auto text-right animate-fade-in-up">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Sharing  {' '}
            <span className="text-white/60">wisdom </span>strengthening the connection.
          </h1>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src={logoXZ} alt="" className="w-[62%] h-[62%] brightness-0 invert opacity-[0.09]" />
        </div>

        {/* Footer tagline */}
        <div className="relative z-10 space-y-4 text-right">
          <p className="text-white/50 text-sm italic leading-relaxed font-serif">
            Join as a Youth or a Senior —<br />
            either way, you arrive with something to give<br />
            and leave with something learned.
=======
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#FBF9F6] via-white to-[#f3e8e6] flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-6 py-2 lg:px-16">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={logoXZ} alt="XZ" className="h-11 w-11" />
          <span className="text-sm font-bold text-brand-burgundy">XZ</span>
        </button>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-burgundy transition px-2 py-2"
          aria-label="Back to sign in"
        >
          <ArrowLeft className="w-4 h-4" /> Sign in
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2">
        <div className="w-full max-w-sm space-y-4 animate-fade-in-up">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand-burgundy mb-0.5">Join XZ</h1>
            <p className="text-gray-500 text-sm">Create your account and start building roots.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label htmlFor="name" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Your name"
                className="w-full mt-1 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                placeholder="you@example.com"
                className="w-full mt-1 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
                placeholder="At least 8 characters"
                className="w-full mt-1 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[44px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="age" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age</label>
                {derivedRole && (
                  <span className="text-xs font-bold text-brand-burgundy bg-brand-burgundy/5 rounded-full px-3 py-1">
                    You'll join as a {derivedRole}
                  </span>
                )}
              </div>
              <input
                id="age"
                name="age"
                type="number"
                min={10}
                max={120}
                value={form.age}
                onChange={handleChange}
                disabled={submitting}
                placeholder="e.g. 24 or 65"
                className="w-full mt-1 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-burgundy text-white py-3 px-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-burgundy font-bold hover:underline">
              Sign in
            </Link>
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
          </p>
          <div className="flex gap-2 justify-end">
            <div className="h-1 w-4 bg-white/20 rounded-full" />
            <div className="h-1 w-10 bg-white/70 rounded-full" />
            <div className="h-1 w-4 bg-white/20 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
}
