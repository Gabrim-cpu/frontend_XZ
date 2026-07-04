import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatMessaging from './components/ChatMessaging';
import RecordingSession from './components/RecordingSession';
import Register from './pages/Register';
import Landing from './pages/Landing';
import BrandLoader from './components/BrandLoader';
import { PrivacyPolicy, TermsOfUse, CommunityGuidelines } from './pages/Legal';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import WisdomHub from './pages/WisdomHub';

// Shown when the user is signed in to Firebase but the backend could not be
// reached to load their profile (offline, DNS failure, server down). Without
// this, they land on an empty dashboard with no explanation.
function BackendUnreachable() {
  const { refreshUser, signOut } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await refreshUser(); // on success appUser is set and the guard re-renders
    setRetrying(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Can't reach the server</h1>
        <p className="text-sm text-gray-500">
          You're signed in, but we couldn't load your profile. Check your internet
          connection and try again.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full bg-brand-burgundy text-white py-3 rounded-xl font-semibold min-h-[48px] disabled:opacity-50"
          >
            {retrying ? 'Retrying...' : 'Try again'}
          </button>
          <button
            onClick={() => signOut()}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, skipOnboardingCheck = false }) {
  const { isAuthenticated, loading, appUser } = useAuth();

  if (loading) {
    return <BrandLoader fullScreen size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!appUser) {
    return <BackendUnreachable />;
  }

  if (!skipOnboardingCheck && !appUser.is_onboarded) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, appUser } = useAuth();

  if (loading) {
    return <BrandLoader fullScreen size="lg" />;
  }

  // Only leave the public page when the backend profile actually loaded —
  // redirecting on Firebase auth alone sends users to a broken dashboard
  // whenever the API is unreachable.
  if (isAuthenticated && appUser) {
    if (!appUser.is_onboarded) {
      return <Navigate to="/profile" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function MessagesPage() {
  const { appUser } = useAuth();
  return <ChatMessaging currentUser={appUser} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/guidelines" element={<CommunityGuidelines />} />

        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/profile" element={<ProtectedRoute skipOnboardingCheck><Profile /></ProtectedRoute>} />

        <Route path="/onboarding" element={<ProtectedRoute skipOnboardingCheck><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><WisdomHub /></ProtectedRoute>} />
        <Route path="/wisdom-hub" element={<ProtectedRoute><WisdomHub /></ProtectedRoute>} />
        <Route path="/dashboard-legacy" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/recording" element={<ProtectedRoute><RecordingSession /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
