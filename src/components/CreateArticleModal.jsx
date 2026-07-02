import React, { useState } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { createLibraryArticle } from '../services/apiService';

const CATEGORIES = ['General', 'Philosophy', 'Career', 'Relationships', 'Health', 'Resilience'];

export default function CreateArticleModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'General',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      await createLibraryArticle(
        formData.title,
        formData.content,
        formData.excerpt || formData.content.substring(0, 150),
        formData.category,
        tags
      );

      setFormData({ title: '', excerpt: '', content: '', category: 'General', tags: '' });
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
      <div className="bg-white rounded-2xl md:rounded-3xl w-full md:max-w-3xl max-h-[90vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900">Contribute Knowledge</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., How to Navigate Career Transitions in Your 50s"
              className="w-full px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 min-h-[48px] md:min-h-auto"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your article here..."
              className="w-full px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 resize-none min-h-[250px] md:min-h-[300px]"
            />
          </div>

          {/* Two Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Category */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 min-h-[48px] md:min-h-auto"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., career, mentorship, wisdom"
                className="w-full px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 min-h-[48px] md:min-h-auto"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#FBF1F0] rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-brand-burgundy flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Articles are reviewed by moderators before publishing to ensure quality and relevance to our community.
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
              {loading ? 'Submitting...' : 'Submit Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
