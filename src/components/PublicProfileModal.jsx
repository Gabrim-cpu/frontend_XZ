import React, { useState, useEffect } from 'react';
import { X, Mail, Heart, MessageCircle, Video, Phone } from 'lucide-react';
import { getPublicProfile } from '../services/apiService';
import { useLanguage } from '../context/LanguageContext';
import VideoCallModal from './VideoCallModal';

export default function PublicProfileModal({ userId, onClose }) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getPublicProfile(userId);
        setProfile(data.user || data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-burgundy" />
          <p className="mt-4 text-stone-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
          <p className="text-red-600">{error || t('profileNotFound')}</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2.5 bg-brand-burgundy text-white rounded-xl font-semibold min-h-[44px]"
          >
            {t('close')}
          </button>
        </div>
      </div>
    );
  }

  const isSenior = profile.identity === 'Senior';
  const displayName = profile.display_name || profile.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/30 p-0 md:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full rounded-t-3xl md:rounded-3xl p-6 shadow-xl md:max-w-md bg-white" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <button onClick={onClose} className="rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-stone-100" aria-label="Close profile">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="text-center">
          {/* Avatar */}
          <div className="mb-4 flex justify-center">
            <div className={`flex items-center justify-center overflow-hidden rounded-full bg-brand-burgundy font-bold text-white ring-4 ring-brand-burgundy/10 ${isSenior ? 'h-24 w-24 text-3xl' : 'h-20 w-20 text-2xl'}`}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>

          {/* Name & Role */}
          <h2 className={`font-bold ${isSenior ? 'text-2xl' : 'text-xl'}`}>{displayName}</h2>
          <p className={`mt-1 ${isSenior ? 'text-base' : 'text-sm'} text-stone-500`}>{profile.email}</p>
          <span className={`mt-2 inline-block rounded-full px-3 py-1 font-bold ${isSenior ? 'text-sm' : 'text-xs'} bg-brand-burgundy/10 text-brand-burgundy`}>
            {isSenior ? t('senior') : t('youth')}
          </span>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 bg-stone-50 rounded-2xl p-4">
              <p className={`${isSenior ? 'text-base' : 'text-sm'} text-stone-700 leading-relaxed`}>{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          <div className="mt-4">
            <p className={`font-bold text-stone-600 text-left ${isSenior ? 'text-sm' : 'text-xs'}`}>Intérêts & Passions</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {profile.share_interests?.length > 0 ? (
                profile.share_interests.map((interest, idx) => (
                  <span key={idx} className={`rounded-full px-3 py-1.5 font-semibold ${isSenior ? 'text-xs' : 'text-[10px]'} bg-emerald-50 text-emerald-700`}>
                    {interest}
                  </span>
                ))
              ) : (
                <p className={`${isSenior ? 'text-sm' : 'text-xs'} text-stone-400`}>Aucun intérêt spécifié</p>
              )}
            </div>
          </div>

          {/* Age */}
          {profile.age && (
            <div className="mt-4 text-center">
              <p className={`${isSenior ? 'text-sm' : 'text-xs'} text-stone-500`}>{profile.age} ans</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button className={`w-full flex items-center justify-center gap-2 rounded-xl bg-brand-burgundy px-5 py-3.5 font-bold text-white min-h-[48px] hover:opacity-90 transition ${isSenior ? 'text-base' : 'text-sm'}`}>
              <MessageCircle className="h-5 w-5" />
              Envoyer un message
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setCallType('audio'); setIsCallOpen(true); }}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold min-h-[44px] ${isSenior ? 'text-sm' : 'text-xs'} border-stone-200 text-stone-600 hover:bg-stone-50 transition`}>
                <Phone className="h-5 w-5" />
                Appel
              </button>
              <button
                onClick={() => { setCallType('video'); setIsCallOpen(true); }}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold min-h-[44px] ${isSenior ? 'text-sm' : 'text-xs'} border-stone-200 text-stone-600 hover:bg-stone-50 transition`}>
                <Video className="h-5 w-5" />
                Vidéo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      {isCallOpen && (
        <VideoCallModal
          contactName={displayName}
          onClose={() => { setIsCallOpen(false); setCallType(null); }}
          onStartCall={async () => {
            // Call setup will be implemented with WebRTC signaling
            console.log(`Starting ${callType} call with ${displayName}`);
          }}
        />
      )}
    </div>
  );
}
