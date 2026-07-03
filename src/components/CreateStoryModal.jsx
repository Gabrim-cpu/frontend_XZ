import React, { useState, useRef } from 'react';
import { X, AlertCircle, Lightbulb, Image as ImageIcon, Mic, Music } from 'lucide-react';
import { createStory, uploadChatMedia } from '../services/apiService';
import { compressImage, fileToDataUrl } from '../utils/imageUtils';

const STORY_CATEGORIES = [
  'Life Lesson', 'Memoir & History', 'Proverb & Advice', 'Tale',
  'Cooking & Recipe', 'Music & Song', 'Customs & Ritual',
];

export default function CreateStoryModal({ isOpen, onClose, onSuccess }) {
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(STORY_CATEGORIES[0]);
  const [media, setMedia] = useState(null); // { dataUrl, kind: 'image' | 'audio', name }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      if (file.type.startsWith('audio/')) {
        if (file.size > 15 * 1024 * 1024) {
          setError('Audio file is too large (max 15MB).');
          return;
        }
        setMedia({ dataUrl: await fileToDataUrl(file), kind: 'audio', name: file.name });
      } else {
        setMedia({ dataUrl: await compressImage(file), kind: 'image', name: file.name });
      }
      setError(null);
    } catch {
      setError('Could not read that file. Try a different one.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Story cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let mediaUrl = null;
      if (media) {
        // Cloudinary stores audio under the 'video' resource type.
        const uploadResult = await uploadChatMedia(media.dataUrl, media.kind === 'audio' ? 'video' : 'image');
        if (!uploadResult.success) throw new Error('Media upload failed');
        mediaUrl = uploadResult.url;
      }
      await createStory(body, mediaUrl, category);
      setBody('');
      setMedia(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl md:rounded-3xl w-full md:max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-2xl md:rounded-t-3xl">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900">Share Your Story</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
              Your Story
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Share your wisdom, experience, or life lesson. This helps bridge generations and inspire others.
            </p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your story here... (minimum 10 characters)"
              className="w-full px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 resize-none min-h-[160px] md:min-h-[200px]"
            />
            <p className="text-xs text-gray-400 mt-2">
              {body.length} characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {STORY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                    category === cat
                      ? 'bg-brand-burgundy text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Media attach — photo or an audio recording of the story */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Photo or audio (optional)</label>
            {media ? (
              <div className="relative inline-block">
                {media.kind === 'image' ? (
                  <img src={media.dataUrl} alt="Attached" className="max-h-40 rounded-xl border border-gray-100" />
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Music className="w-5 h-5 text-brand-burgundy" />
                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{media.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setMedia(null)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-900/80 text-white flex items-center justify-center hover:bg-gray-900"
                  aria-label="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-brand-burgundy/50 hover:text-brand-burgundy transition min-h-[48px]"
              >
                <ImageIcon className="w-4 h-4" /> / <Mic className="w-4 h-4" /> Add photo or audio
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,audio/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* Note */}
          <div className="bg-[#FBF1F0] rounded-lg p-4 flex gap-3">
            <Lightbulb className="w-5 h-5 text-brand-burgundy flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Stories with an audio recording also appear in the Oral Archive.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 md:py-2.5 rounded-xl text-sm md:text-base font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors min-h-[48px] md:min-h-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-5 py-3 md:py-2.5 rounded-xl text-sm md:text-base font-semibold bg-brand-burgundy text-white hover:bg-opacity-90 disabled:opacity-50 transition-all min-h-[48px] md:min-h-auto"
            >
              {loading ? 'Publishing...' : 'Publish Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
