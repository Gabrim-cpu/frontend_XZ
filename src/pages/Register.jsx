import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
          </p>
        </div>
      </div>
    </div>
  );
}
