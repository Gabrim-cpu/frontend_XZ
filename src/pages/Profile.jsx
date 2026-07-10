import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { Upload, X, Check, ArrowRight } from 'lucide-react';
import BackgroundPattern from '../components/BackgroundPattern';
import { compressImage } from '../utils/imageUtils';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';

const nicheFields = ['history', 'sociology', 'anthropology', 'literature', 'philosophy', 'technology', 'arts', 'music', 'cooking', 'crafts'];

export default function Profile() {
  const navigate = useNavigate();
  const { appUser, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState(appUser?.display_name || '');
  const [age, setAge] = useState(appUser?.age || '');
  const [bio, setBio] = useState(appUser?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(appUser?.avatar_url || null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  // One global interest list — matching uses it for both what you can share
  // and what you want to learn, so the app pairs people automatically.
  const [interests, setInterests] = useState(() => {
    const merged = [...(appUser?.share_interests || []), ...(appUser?.learn_interests || [])];
    return [...new Set(merged)];
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Age decides the identity automatically: 50 and above join as Seniors.
  const parsedAge = parseInt(age, 10);
  const identity = Number.isNaN(parsedAge) ? null : parsedAge >= 50 ? 'Senior' : 'Youth';

  const toggleInterest = (interest) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress before saving — the avatar travels as base64 in the profile
        // update, and full-size photos exceed server body limits (413).
        setProfilePhoto(await compressImage(file, { maxDim: 512 }));
        setProfilePhotoFile(file);
      } catch (err) {
        setError('Could not read that image. Try a different one.');
      }
    }
  };

  const clearPhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identity) {
      setError('Please enter your age');
      return;
    }

    setSubmitting(true);

    try {
      await updateProfile({
        identity,
        display_name: displayName || undefined,
        age: parsedAge,
        bio: bio || undefined,
        avatar_url: profilePhoto || undefined,
        learn_interests: interests,
        share_interests: interests,
      });
      await refreshUser?.();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <BackgroundPattern />
      <header className="flex items-center gap-3 px-6 py-6 lg:px-16 border-b border-gray-100 relative z-10">
        <img src={logoXZ} alt="XZ" className="h-8 w-8" />
        <span className="text-lg font-bold text-brand-burgundy">XZ</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 max-w-2xl mx-auto w-full relative z-10">
        <div className="w-full bg-white rounded-3xl shadow-lg p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-burgundy mb-2">Complete Your Profile</h1>
            <p className="text-gray-500">Tell us about yourself to personalize your experience.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Photo</label>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">Add photo</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-brand-burgundy text-white rounded-xl font-semibold text-sm min-h-[44px] hover:opacity-90"
                  >
                    Upload Photo
                  </button>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm min-h-[44px] hover:bg-gray-50"
                    >
                      <X className="h-5 w-5 mx-auto" />
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
              <input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full mt-1.5 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base min-h-[52px] focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy"
              />
            </div>

            {/* Age — decides Youth/Senior automatically. Only asked here if it
                wasn't provided at signup; otherwise just show the result. */}
            {appUser?.age ? (
              identity && (
                <span className="inline-block text-xs font-bold text-brand-burgundy bg-brand-burgundy/5 rounded-full px-3 py-1.5">
                  {identity === 'Senior' ? 'Senior' : 'Youth'} · {age} years
                </span>
              )
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="age" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age</label>
                  {identity && (
                    <span className="text-xs font-bold text-brand-burgundy bg-brand-burgundy/5 rounded-full px-3 py-1">
                      You're joining as a {identity}
                    </span>
                  )}
                </div>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 24 or 65"
                  className="w-full mt-1.5 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base min-h-[52px] focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy"
                />
              </div>
            )}

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="text-xs font-bold text-gray-400 uppercase tracking-wider">About You</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself (optional)"
                rows={4}
                className="w-full mt-1.5 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy resize-none"
              />
            </div>

            {/* Interests — one list; the app matches you automatically */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your interests</label>
              <p className="text-xs text-gray-400 mt-1">Pick what you're interested in — we'll automatically match you with people across generations who share them.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {nicheFields.map((field) => {
                  const active = interests.includes(field);
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleInterest(field)}
                      className={`px-4 py-2.5 rounded-full font-semibold flex items-center gap-1.5 transition min-h-[44px] text-sm ${
                        active ? 'bg-brand-burgundy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {active && <Check className="h-4 w-4" />}
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-burgundy text-white py-4 rounded-2xl font-semibold text-base min-h-[56px] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>Continue to Dashboard <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
