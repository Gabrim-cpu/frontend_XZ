import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA installed');
      setInstallPrompt(null);
      setShowPrompt(false);
    } else {
      console.log('User dismissed install prompt');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't clear installPrompt, user can dismiss and still install later
  };

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl flex items-center gap-2 z-50 shadow-lg">
        <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
        <span className="text-sm font-medium">You're offline — content is cached</span>
      </div>
    );
  }

  if (!showPrompt || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-burgundy to-red-600 text-white p-4 flex items-center gap-3">
        <Download className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Install XZ on your phone</p>
          <p className="text-xs opacity-90">Quick access to your connections and feed</p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 py-3 flex gap-2">
        <button
          onClick={handleDismiss}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 px-3 py-2 text-sm font-bold text-white bg-brand-burgundy hover:bg-red-700 rounded-lg transition"
        >
          Install
        </button>
      </div>
    </div>
  );
}
