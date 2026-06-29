import React, { useState, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { getComments, addComment } from '../services/apiService';
import Avatar from './Avatar';

export default function CommentsSection({ contentType, contentId, contentAuthor }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [contentType, contentId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getComments(contentType, contentId);
      setComments(res.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('Could not load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setPosting(true);
      setError(null);
      const res = await addComment(contentType, contentId, newComment);
      setComments([res.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="pt-6 md:pt-8 border-t border-gray-200 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
          Reflections & Comments
        </h3>
        <p className="text-sm text-gray-500">
          Share your thoughts and learn from others
        </p>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your reflection..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 resize-none min-h-[100px]"
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={posting || !newComment.trim()}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 md:py-2.5 rounded-xl text-sm md:text-base font-semibold bg-brand-burgundy text-white hover:bg-opacity-90 disabled:opacity-50 transition-all min-h-[48px] md:min-h-auto"
        >
          {posting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post Reflection
            </>
          )}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4 md:space-y-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 text-brand-burgundy animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-sm">No reflections yet. Be the first to share!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 md:gap-4">
              {/* Avatar */}
              <Avatar
                name={comment.author}
                avatar={comment.avatar_url}
                size="w-10 h-10 md:w-11 md:h-11"
              />

              {/* Comment */}
              <div className="flex-1 min-w-0 bg-gray-50 rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {comment.author}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {comment.text}
                </p>
                <button className="text-xs text-gray-400 hover:text-brand-burgundy transition-colors mt-2">
                  ♥ {comment.likes || 0}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
