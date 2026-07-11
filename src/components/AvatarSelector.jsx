import React, { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { compressImage } from '../utils/imageUtils';

const AVATAR_PRESETS = [
  { id: 'avatar1', char: 'A', color: 'bg-blue-500' },
  { id: 'avatar2', char: 'B', color: 'bg-purple-500' },
  { id: 'avatar3', char: 'C', color: 'bg-pink-500' },
  { id: 'avatar4', char: 'D', color: 'bg-amber-500' },
  { id: 'avatar5', char: 'E', color: 'bg-emerald-500' },
  { id: 'avatar6', char: 'F', color: 'bg-indigo-500' },
  { id: 'avatar7', char: 'G', color: 'bg-rose-500' },
  { id: 'avatar8', char: 'H', color: 'bg-cyan-500' },
];

export default function AvatarSelector({ onClose, onAvatarChange }) {
  const { t } = useLanguage();
  const { appUser, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(appUser?.avatar_url || null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, { maxDim: 512 });
        setUploadedImage(compressed);
        setSelectedAvatarId(null); // Clear preset selection
      } catch (err) {
        console.error('Could not read that image', err);
      }
    }
  };

  const handleSave = async () => {
    if (!uploadedImage && !selectedAvatarId) return;
    setIsLoading(true);
    try {
      const avatarToSave = uploadedImage || (selectedAvatarId ? `avatar-preset-${selectedAvatarId}` : null);
      await updateProfile({
        avatar_url: avatarToSave,
      });
      await refreshUser?.();
      if (onAvatarChange) onAvatarChange(avatarToSave);
      onClose?.();
    } catch (err) {
      console.error('Failed to update avatar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/30 p-0 md:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="w-full rounded-t-3xl md:rounded-3xl p-6 shadow-xl md:max-w-md bg-white" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Changer votre avatar</h2>
          <button onClick={onClose} className="rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-brand-burgundy font-bold text-white flex items-center justify-center text-3xl shadow-md overflow-hidden">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Preview" className="h-full w-full object-cover" />
              ) : selectedAvatarId ? (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: AVATAR_PRESETS.find(a => a.id === selectedAvatarId)?.color.replace('bg-', '') }}>
                  {AVATAR_PRESETS.find(a => a.id === selectedAvatarId)?.char}
                </div>
              ) : (
                (appUser?.display_name || 'U').slice(0, 1).toUpperCase()
              )}
            </div>
          </div>

          {/* Upload Custom Photo */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Importer une photo personnalisée</label>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2.5 bg-brand-burgundy text-white rounded-xl font-semibold text-sm min-h-[44px] hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Importer photo
              </button>
              {uploadedImage && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null);
                    setSelectedAvatarId(null);
                  }}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm min-h-[44px] hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Avatar Presets */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Avatars prédéfinis</label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedAvatarId(preset.id);
                    setUploadedImage(null);
                  }}
                  className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-white text-2xl transition-all ${preset.color} ${
                    selectedAvatarId === preset.id
                      ? 'ring-4 ring-brand-burgundy shadow-lg'
                      : 'hover:scale-110 hover:shadow-md'
                  }`}
                >
                  {selectedAvatarId === preset.id && (
                    <Check className="h-5 w-5 absolute" />
                  )}
                  {selectedAvatarId !== preset.id && preset.char}
                </button>
              ))}
            </div>
          </div>

          {/* Youth vs Senior Note */}
          <div className="bg-stone-50 rounded-2xl p-4">
            <p className="text-xs text-stone-600">
              💡 <strong>Conseil:</strong> Choisissez un avatar qui vous représente bien. Les autres utilisateurs verront votre avatar partout dans la communauté.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold min-h-[48px] hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || (!uploadedImage && !selectedAvatarId)}
              className="flex-1 px-4 py-3 bg-brand-burgundy text-white rounded-xl font-semibold min-h-[48px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mise à jour...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Valider
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
