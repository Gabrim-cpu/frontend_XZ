import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createStory } from '../services/apiService';

export default function CreateStoryModal({ isOpen, onClose, onSuccess }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Story cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createStory(body);
      setBody('');
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
              className="w-full px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 resize-none min-h-[200px] md:min-h-[250px]"
            />
            <p className="text-xs text-gray-400 mt-2">
              {body.length} characters
            </p>
          </div>

          {/* Note */}
          <div className="bg-[#FBF1F0] rounded-lg p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> Stories are moderated before publishing to maintain community quality.
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
              {loading ? 'Publishing...' : '✨ Publish Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
