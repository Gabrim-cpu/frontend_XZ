import React, { useState, useEffect } from 'react';
import { Check, X, Loader, AlertCircle } from 'lucide-react';
import { getPendingArticles, publishLibraryArticle, rejectArticle } from '../services/apiService';

export default function ModerationDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPendingArticles();
      setArticles(res.articles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId) => {
    try {
      setActioning(articleId);
      await publishLibraryArticle(articleId);
      setArticles(articles.filter(a => a.id !== articleId));
      setSelectedId(null);
    } catch (err) {
      setError('Failed to approve article');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (articleId) => {
    try {
      setActioning(articleId);
      await rejectArticle(articleId);
      setArticles(articles.filter(a => a.id !== articleId));
      setSelectedId(null);
    } catch (err) {
      setError('Failed to reject article');
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="w-8 h-8 text-brand-burgundy animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
          Content Moderation
        </h2>
        <p className="text-gray-500">
          Review and approve articles submitted to the knowledge library
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-brand-burgundy/10 to-brand-burgundy/5 rounded-2xl p-6 border border-brand-burgundy/20">
        <p className="text-sm text-gray-600 mb-1">Pending Articles</p>
        <p className="text-4xl font-bold text-brand-burgundy">{articles.length}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Articles List */}
      {articles.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">No pending articles</p>
          <p className="text-gray-400 text-sm">All articles have been reviewed!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setSelectedId(selectedId === article.id ? null : article.id)}
                className="w-full text-left"
              >
                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-burgundy transition-colors">
                  {article.title}
                </h3>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500 mb-3">
                  <span>By {article.author}</span>
                  <span>•</span>
                  <span>{article.category}</span>
                  <span>•</span>
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
              </button>

              {/* Expand Details */}
              {selectedId === article.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Full Preview</p>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-[300px] overflow-y-auto">
                      {article.excerpt}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleReject(article.id)}
                      disabled={actioning === article.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors min-h-[44px]"
                    >
                      {actioning === article.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApprove(article.id)}
                      disabled={actioning === article.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 disabled:opacity-50 transition-colors min-h-[44px]"
                    >
                      {actioning === article.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Approve & Publish
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
