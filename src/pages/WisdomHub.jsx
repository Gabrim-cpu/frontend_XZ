import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, MessageCircle, BookOpen, Users, Settings as SettingsIcon, LogOut, Search, Bell, HelpCircle, Plus, Diamond, Send, Mic, Paperclip, Smile, Phone, Video, MoreVertical, Square, Play, Check, UserPlus, Clock, Sparkles, Library, User, Shield, Star, Award, Image as ImageIcon, ArrowRight, Moon, Sun, Heart, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BackgroundPattern from '../components/BackgroundPattern';
import { getThreads, getMessages, sendMessage, uploadChatMedia, getRecommendations, getAllUsers, requestConnection, getPendingRequests, acceptConnection, rejectConnection, getAcceptedConnections, getFeed, createPost, getStories, getLibrary, getPointsSummary, togglePostLike, getPublicProfile } from '../services/apiService';
import BadgeDisplay from '../components/BadgeDisplay';
import { compressImage, fileToDataUrl, blobToDataUrl } from '../utils/imageUtils';
import BrandLoader from '../components/BrandLoader';
import { updateProfile } from '../services/authService';
import NotificationBell from '../components/NotificationBell';
import VideoCall, { makeRoomName } from '../components/VideoCall';
import HintTooltip from '../components/HintTooltip';
import { useHint } from '../hooks/useHint';
import CreateStoryModal from '../components/CreateStoryModal';
import CreateArticleModal from '../components/CreateArticleModal';
import CommentsSection from '../components/CommentsSection';
import ModerationDashboard from '../components/ModerationDashboard';
import Avatar from '../components/Avatar';
import { io } from 'socket.io-client';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';
import logoWhite from '../Assets/logo_blanc-removebg-preview (1).png';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WisdomHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('xz-theme') === 'dark');
  const [onlineUsers, setOnlineUsers] = useState([]);
  // When set, the Messages tab opens this specific connection's conversation.
  const [chatTarget, setChatTarget] = useState(null);
  // Modals for content creation
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreateArticle, setShowCreateArticle] = useState(false);

  const openChatWith = (user) => {
    setChatTarget(user);
    setActiveTab('messages');
  };

  // Active video/voice call overlay (Jitsi). `null` when no call is in progress.
  const [call, setCall] = useState(null);

  // "View profile" popup: the user id being viewed, or null.
  const [profileUserId, setProfileUserId] = useState(null);

  // Start a call with another user. The room name is derived from both ids so
  // each side independently computes the SAME room and meets there.
  const startCall = (otherUserId, { audioOnly = false } = {}) => {
    if (!appUser?.id || !otherUserId) return;
    setCall({ roomName: makeRoomName(appUser.id, otherUserId), audioOnly });
    // The call room is only half the story — the other person must be TOLD.
    // A chat message rings their notification bell and tells them which
    // button to press; both sides derive the same room name independently.
    const invite = audioOnly
      ? (language === 'fr'
          ? "📞 Je vous appelle — ouvrez notre discussion et appuyez sur l'icône téléphone pour me rejoindre."
          : '📞 I am calling you — open our chat and press the phone icon to join me.')
      : (language === 'fr'
          ? '🎥 Je démarre un appel vidéo — ouvrez notre discussion et appuyez sur la caméra pour me rejoindre.'
          : '🎥 I started a video call — open our chat and press the camera icon to join me.');
    sendMessage(otherUserId, invite, 'text').catch(() => {});
  };

  const appUser = auth?.appUser || {};
  const isNewUser = auth?.isNewUser || false;
  const userName = appUser?.displayName || appUser?.display_name || 'User';
  const userEmail = appUser?.email || '';
  const userPoints = appUser?.root_points ?? 0;
  const userAvatar = appUser?.avatar_url || appUser?.photoURL || null;

  // Re-sync the profile from the backend on mount so name/avatar/points are current
  useEffect(() => {
    auth?.refreshUser?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dark theme: toggled on <html> so the CSS overrides in index.css apply app-wide.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('xz-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Open the tab a notification click asked for (NotificationBell navigates
  // here with { state: { tab } }).
  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  // Presence: announce ourselves and track which users are online.
  useEffect(() => {
    if (!appUser?.id) return;
    const socket = io(SOCKET_URL);
    socket.emit('join', appUser.id);
    socket.on('presence', (ids) => setOnlineUsers(Array.isArray(ids) ? ids : []));
    return () => socket.disconnect();
  }, [appUser?.id]);

  // Collapse the sidebar to an icon rail while the user scrolls the content,
  // giving the feed the full width; expand again near the top. The two
  // thresholds add hysteresis so it doesn't flicker at the boundary.
  const handleContentScroll = (e) => {
    const y = e.currentTarget.scrollTop;
    setSidebarOpen((open) => (open ? y < 80 : y < 20));
  };

  const handleLogout = async () => {
    if (auth?.logout) {
      await auth.logout();
      navigate('/login');
    }
  };

  const navItems = [
    { id: 'home', label: t('feed'), icon: Home },
    { id: 'messages', label: t('messages'), icon: MessageCircle },
    { id: 'wisdom', label: t('wisdomArchive'), icon: BookOpen },
    { id: 'mentorship', label: t('mentorshipTab'), icon: Users },
    { id: 'settings', label: t('settingsTab'), icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#FBF9F8]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <BackgroundPattern />
      {/* Sidebar — Desktop only. Collapses to an icon rail while scrolling. */}
      <div className={`hidden md:flex bg-white border-r border-gray-100 flex-col flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'md:w-56' : 'md:w-[4.5rem]'}`}>
        <div className={`py-5 flex items-center gap-2 ${sidebarOpen ? 'px-5' : 'px-0 justify-center'}`}>
          <img src={logoXZ} alt="XZ" className="w-10 h-10 flex-shrink-0" />
          {sidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-lg font-serif font-bold text-brand-burgundy leading-none">Digital Roots</h1>
              <p className="text-[10px] text-gray-400 mt-0.5">Bridging Generations</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-2 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm min-h-[48px] ${sidebarOpen ? '' : 'justify-center'} ${
                  active
                    ? 'bg-[#FBF1F0] text-brand-burgundy font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
              </button>
            );
          })}

          {/* Dark theme toggle */}
          <button
            onClick={() => setDarkMode((v) => !v)}
            title={darkMode ? t('lightTheme') : t('darkTheme')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm min-h-[48px] text-gray-500 hover:bg-gray-50 hover:text-gray-800 ${sidebarOpen ? '' : 'justify-center'}`}
          >
            {darkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {sidebarOpen && <span className="whitespace-nowrap overflow-hidden">{darkMode ? t('lightTheme') : t('darkTheme')}</span>}
          </button>
        </nav>

        <div className="p-3">
          <button
            onClick={() => setActiveTab('mentorship')}
            title={t('newConnection')}
            className="w-full flex items-center justify-center gap-2 bg-brand-burgundy text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all min-h-[48px]"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">{t('newConnection')}</span>}
          </button>
        </div>

        {/* Current user — with online presence dot */}
        <div className={`p-3 pt-0 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          <div className={`flex items-center gap-2.5 rounded-xl bg-gray-50 ${sidebarOpen ? 'px-3 py-2.5' : 'p-2'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-brand-burgundy flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {userAvatar ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" /> : userName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
            </div>
            {sidebarOpen && <span className="text-sm font-semibold text-gray-800 truncate">{userName}</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 md:pb-0 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-burgundy to-[#4A0602] md:bg-none md:bg-[#FBF9F8] px-4 py-3 flex items-center justify-between gap-3 border-b border-black/10 md:border-gray-100/50 shadow-sm md:shadow-none">
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <img src={logoXZ} alt="XZ" className="w-9 h-9 md:hidden flex-shrink-0" />
            <span className="md:hidden font-serif font-bold text-white text-lg tracking-tight truncate">Digital Roots</span>
            <h1 className="hidden md:block text-lg font-serif font-bold text-brand-burgundy">{navItems.find((n) => n.id === activeTab)?.label || 'Digital Roots'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={() => setActiveTab('settings')} className="w-10 h-10 bg-white md:bg-brand-burgundy rounded-full flex items-center justify-center text-brand-burgundy md:text-white font-bold text-sm overflow-hidden min-h-[44px] ring-2 ring-white/25 md:ring-0">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName?.[0]?.toUpperCase() || 'U'
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && <div className="overflow-auto h-full" onScroll={handleContentScroll}><HomeContent userName={userName} userAvatar={userAvatar} currentUser={appUser} isNewUser={isNewUser} onStartRecording={() => navigate('/recording')} onBrowseArchive={() => setActiveTab('wisdom')} onOpenProfile={setProfileUserId} /></div>}
          {activeTab === 'wisdom' && <div className="overflow-auto h-full" onScroll={handleContentScroll}><ArchiveContent onCreateStory={() => setShowCreateStory(true)} onCreateArticle={() => setShowCreateArticle(true)} onRecord={() => navigate('/recording')} /></div>}
          {activeTab === 'messages' && <MessagesContent currentUser={appUser} chatTarget={chatTarget} onConsumeTarget={() => setChatTarget(null)} onStartCall={startCall} onlineUsers={onlineUsers} onOpenProfile={setProfileUserId} />}
          {activeTab === 'settings' && <div className="overflow-auto h-full"><SettingsContent userName={userName} userEmail={userEmail} appUser={appUser} onLogout={handleLogout} language={language} changeLanguage={changeLanguage} auth={auth} darkMode={darkMode} onToggleDark={() => setDarkMode((v) => !v)} /></div>}
          {activeTab === 'mentorship' && <div className="overflow-auto h-full" onScroll={handleContentScroll}><MentorshipContent currentUser={appUser} onOpenChat={openChatWith} onStartCall={startCall} onlineUsers={onlineUsers} onOpenProfile={setProfileUserId} /></div>}
        </div>
      </div>

      {/* Bottom Navigation — Mobile only, frosted glass with active pill */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center pt-2 pb-1.5 min-h-[60px]"
            >
              <span
                className={`flex items-center justify-center h-8 px-4 rounded-full transition-all duration-200 ${
                  active ? 'bg-[#FBF1F0] text-brand-burgundy' : 'text-gray-400'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.25 : 1.75} />
              </span>
              <span className={`text-[10px] mt-0.5 leading-tight text-center transition-colors ${active ? 'text-brand-burgundy font-semibold' : 'text-gray-400 font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Video / voice call overlay */}
      {call && (
        <VideoCall
          roomName={call.roomName}
          displayName={userName}
          audioOnly={call.audioOnly}
          onClose={() => setCall(null)}
        />
      )}

      {/* Modals */}
      <CreateStoryModal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onSuccess={() => {
          setShowCreateStory(false);
          setActiveTab('wisdom');
        }}
      />
      <CreateArticleModal
        isOpen={showCreateArticle}
        onClose={() => setShowCreateArticle(false)}
        onSuccess={() => {
          setShowCreateArticle(false);
          setActiveTab('wisdom');
        }}
      />
      {profileUserId && (
        <UserProfileModal
          userId={profileUserId}
          isSelf={profileUserId === appUser?.id}
          onClose={() => setProfileUserId(null)}
          onMessage={(user) => {
            setProfileUserId(null);
            openChatWith({ id: user.id, participantName: user.display_name, participantAvatar: user.avatar_url, participantIdentity: user.identity });
          }}
        />
      )}
    </div>
  );
}

/* ============ USER PROFILE POPUP ============ */
const LANGUAGE_LABELS = { en: 'English', fr: 'Français' };

function UserProfileModal({ userId, isSelf, onClose, onMessage }) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [failed, setFailed] = useState(false);
  const [connectState, setConnectState] = useState('idle'); // idle | sending | sent | error

  useEffect(() => {
    setProfile(null);
    setFailed(false);
    setConnectState('idle');
    getPublicProfile(userId)
      .then((data) => setProfile(data.user))
      .catch(() => setFailed(true));
  }, [userId]);

  const handleConnect = async () => {
    if (connectState === 'sending' || connectState === 'sent') return;
    setConnectState('sending');
    try {
      await requestConnection(userId);
      setConnectState('sent');
    } catch (err) {
      // "Already connected / already pending" also means there's nothing to do.
      if (/already/i.test(err.message)) setConnectState('sent');
      else setConnectState('error');
    }
  };

  const interests = [
    ...new Set([...(profile?.share_interests || []), ...(profile?.learn_interests || [])]),
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>

        {failed ? (
          <p className="text-sm text-gray-500 text-center py-10">{t('profileLoadFailed')}</p>
        ) : !profile ? (
          <div className="flex justify-center py-14">
            <BrandLoader size="sm" />
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gray-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-500">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                profile.display_name?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <h2 className="mt-4 text-xl font-serif font-bold text-gray-900">{profile.display_name}</h2>
            {profile.identity && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full border border-brand-burgundy/30 text-brand-burgundy text-xs font-bold uppercase tracking-wide">
                {profile.identity}
              </span>
            )}

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 divide-x divide-gray-100 border-y border-gray-100 py-4">
              <div>
                <p className="text-xl font-bold text-gray-900">{profile.post_count ?? 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('postsLabel')}</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{profile.root_points ?? 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('rootPoints')}</p>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-4 bg-gray-50 rounded-2xl p-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{t('aboutLabel')}</p>
                <p className="text-sm text-gray-600 italic leading-relaxed">"{profile.bio}"</p>
              </div>
            )}

            {profile.language && (
              <div className="mt-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{t('spokenLanguages')}</p>
                <span className="inline-flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <Globe className="w-3.5 h-3.5" /> {LANGUAGE_LABELS[profile.language] || profile.language}
                </span>
              </div>
            )}

            {interests.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{t('interestsTopics')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((tag, i) => (
                    <span key={i} className="border border-brand-burgundy/25 text-brand-burgundy rounded-lg px-2.5 py-1 text-xs font-semibold capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!isSelf && (
              <div className="mt-6 space-y-2">
                <button
                  onClick={handleConnect}
                  disabled={connectState === 'sending' || connectState === 'sent'}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all min-h-[52px] ${
                    connectState === 'sent'
                      ? 'bg-emerald-50 text-emerald-700 cursor-default'
                      : 'bg-brand-burgundy text-white hover:bg-opacity-90 disabled:opacity-60'
                  }`}
                >
                  {connectState === 'sent' ? (
                    <><Check className="w-4 h-4" /> {t('requestSent')}</>
                  ) : connectState === 'sending' ? (
                    t('sending')
                  ) : (
                    <><UserPlus className="w-4 h-4" /> {t('connect')}</>
                  )}
                </button>
                {connectState === 'error' && (
                  <p className="text-xs text-red-500">{t('connectFailed')}</p>
                )}
                <button
                  onClick={() => onMessage(profile)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-all min-h-[52px]"
                >
                  <MessageCircle className="w-4 h-4" /> {t('sendPrivateMessage')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ MESSAGES TAB ============ */
function MessagesContent({ currentUser, chatTarget, onConsumeTarget, onStartCall, onlineUsers = [], onOpenProfile }) {
  const { t, language } = useLanguage();
  const videoCallHint = useHint('chat_video_call');
  const voiceCallHint = useHint('chat_voice_call');
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [threadSearch, setThreadSearch] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  // Holds the participant info for a conversation opened from outside (a
  // connection card / the new-chat picker) so the thread renders immediately
  // even before getThreads has it in the list.
  const [targetInfo, setTargetInfo] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const listEndRef = useRef(null);
  // Kept in sync each render so the single long-lived socket listener can read
  // the currently-open thread without re-subscribing on every thread switch.
  const activeThreadIdRef = useRef(null);

  const activeThread =
    threads.find((th) => th.id === activeThreadId) ||
    (targetInfo && targetInfo.id === activeThreadId ? targetInfo : null);

  activeThreadIdRef.current = activeThreadId;

  // Open a specific conversation when asked from outside (connection card / picker).
  useEffect(() => {
    if (chatTarget?.id) {
      setActiveThreadId(chatTarget.id);
      setTargetInfo(chatTarget);
      onConsumeTarget?.();
    }
  }, [chatTarget, onConsumeTarget]);

  // Connect the socket once per user (not per thread switch). The listener reads
  // the open thread via a ref and dedupes by message id so live delivery is safe.
  useEffect(() => {
    if (!currentUser?.id) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join', currentUser.id);
    });
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('message', (msg) => {
      const otherId = activeThreadIdRef.current;
      if (msg.senderId === otherId || msg.receiverId === otherId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      fetchThreads();
    });
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const fetchThreads = useCallback(async () => {
    try {
      const data = await getThreads();
      if (data.success) setThreads(data.threads || []);
    } catch (err) { console.error('Error fetching threads:', err); }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  useEffect(() => {
    if (!activeThreadId) { setMessages([]); return; }
    (async () => {
      try {
        const data = await getMessages(activeThreadId);
        if (data.success) setMessages(data.messages || []);
      } catch (err) { console.error('Error fetching messages:', err); }
    })();
  }, [activeThreadId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content || !activeThreadId) return;
    setInputText('');
    try {
      const data = await sendMessage(activeThreadId, content, 'text');
      if (data.success) { setMessages((prev) => [...prev, data.message]); fetchThreads(); }
    } catch (err) { console.error('Send error:', err); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeThreadId) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const uploadResult = await uploadChatMedia(reader.result, 'image');
        if (uploadResult.success) {
          const data = await sendMessage(activeThreadId, 'Image', 'image', uploadResult.url);
          if (data.success) { setMessages((prev) => [...prev, data.message]); fetchThreads(); }
        }
      } catch (err) { console.error('Upload error:', err); }
      finally { setIsUploading(false); }
    };
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !activeThreadId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            setIsUploading(true);
            setSendError(null);
            const uploadResult = await uploadChatMedia(reader.result, 'video');
            if (uploadResult.success) {
              const transcript = liveTranscript.trim() || 'Voice note';
              const data = await sendMessage(activeThreadId, transcript, 'voice', uploadResult.url, transcript);
              if (data.success) { setMessages((prev) => [...prev, data.message]); fetchThreads(); }
            }
          } catch (err) {
            console.error('Voice error:', err);
            setSendError('The voice note could not be sent. Please try again.');
          }
          finally { setIsUploading(false); setLiveTranscript(''); }
        };
      };
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; recognition.interimResults = true;
        recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
        recognition.onresult = (event) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) text += event.results[i][0].transcript;
          }
          if (text) setLiveTranscript((prev) => prev + ' ' + text);
        };
        recognitionRef.current = recognition;
        recognition.start();
      }
      recorder.start();
      setIsRecording(true);
    } catch (err) { console.error('Mic error:', err); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return formatTime(dateStr);
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Live search across everything in the list: names and last messages.
  const threadQuery = threadSearch.trim().toLowerCase();
  const visibleThreads = threadQuery
    ? threads.filter(
        (th) =>
          (th.participantName || '').toLowerCase().includes(threadQuery) ||
          (th.lastMessage || '').toLowerCase().includes(threadQuery)
      )
    : threads;

  return (
    <div className="flex h-full bg-white">
      {/* Conversation List */}
      <div className={`${activeThreadId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100 flex-shrink-0`}>
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-2xl font-serif font-bold text-gray-900">{t('conversations')}</h2>
        </div>
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              placeholder={t('searchConversations')}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 min-h-[42px]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {visibleThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 opacity-30 mb-3" />
              <p className="text-sm font-medium">{threadSearch ? t('noSearchResults') : t('noConvYet')}</p>
              <p className="text-xs mt-1">{threadSearch ? t('noSearchResultsSub') : t('noConvYetSub')}</p>
            </div>
          ) : (
            visibleThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors border-l-4 ${
                  activeThreadId === thread.id
                    ? 'bg-[#FBF1F0] border-brand-burgundy'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm overflow-hidden">
                    {thread.participantAvatar ? (
                      <img src={thread.participantAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      thread.participantName?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                  {onlineUsers.includes(thread.id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900 truncate">{thread.participantName}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(thread.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{thread.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Thread */}
      {activeThreadId && activeThread ? (
        <>
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveThreadId(null)} className="md:hidden p-1"><X className="w-5 h-5" /></button>
                <button onClick={() => onOpenProfile?.(activeThread.id)} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm overflow-hidden hover:opacity-80 transition">
                  {activeThread.participantAvatar ? (
                    <img src={activeThread.participantAvatar} alt="" className="w-full h-full object-cover" />
                  ) : activeThread.participantName?.[0]?.toUpperCase()}
                </button>
                <div>
                  <h3 className="font-bold text-gray-900">{activeThread.participantName}</h3>
                  {onlineUsers.includes(activeThread.id) ? (
                    <p className="text-[10px] text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {t('online')}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" /> {t('offline')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => {
                      voiceCallHint.recordUse();
                      onStartCall?.(activeThreadId, { audioOnly: true });
                    }}
                    title="Voice call"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <HintTooltip show={voiceCallHint.showHint} text="Voice call" position="below" />
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      videoCallHint.recordUse();
                      onStartCall?.(activeThreadId);
                    }}
                    title="Video call"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <HintTooltip show={videoCallHint.showHint} text="Video call" position="below" />
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-5 space-y-4 bg-[#FEFCFB]">
              {messages.map((msg, i) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isMine
                        ? 'bg-brand-burgundy text-white rounded-br-sm'
                        : 'bg-[#F4F2F1] text-gray-900 rounded-bl-sm'
                    }`}>
                      {msg.type === 'image' && msg.mediaUrl && (
                        <img src={msg.mediaUrl} alt="Shared" className="rounded-lg mb-2 max-w-full" />
                      )}
                      {msg.type === 'voice' && msg.mediaUrl && (
                        <audio src={msg.mediaUrl} controls preload="none" className="mb-1 w-56 max-w-full" />
                      )}
                      {(msg.type !== 'voice' || !msg.mediaUrl) && (
                        <p className="text-sm font-serif leading-relaxed">{msg.content}</p>
                      )}
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                        {/* One tick = sent. Two ticks only while the other person is actually online. */}
                        {isMine && <span className="text-[10px]">{onlineUsers.includes(activeThread.id) ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={listEndRef} />
            </div>

            {/* Input Bar */}
            <div className="relative border-t border-gray-100 bg-white">
              {sendError && (
                <p className="px-4 pt-2 text-sm font-semibold text-red-500">{sendError}</p>
              )}
              {showEmoji && (
                <div className="absolute bottom-full left-2 z-20 mb-2 grid w-72 max-w-[calc(100vw-2rem)] grid-cols-8 gap-0.5 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-xl">
                  {CHAT_EMOJIS.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setInputText((t) => t + emo)}
                      className="rounded-lg p-1 text-xl hover:bg-gray-100"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600"><Paperclip className="w-5 h-5" /></button>
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                aria-label="Add emoji"
                className={`p-2 transition-colors ${showEmoji ? 'text-brand-burgundy' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Smile className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 min-h-[44px]"
                disabled={isUploading}
              />
              {isRecording ? (
                <button type="button" onClick={stopRecording} className="p-2.5 bg-red-500 text-white rounded-full"><Square className="w-4 h-4" /></button>
              ) : (
                <button type="button" onClick={startRecording} className="p-2 text-gray-400 hover:text-gray-600"><Mic className="w-5 h-5" /></button>
              )}
              <button type="submit" disabled={!inputText.trim() || isUploading} className="p-2.5 bg-brand-burgundy text-white rounded-full disabled:opacity-40 hover:bg-opacity-90 transition-all"><Send className="w-4 h-4" /></button>
            </form>
            </div>
          </div>

          {/* User Profile Panel (desktop) */}
          <div className="hidden xl:flex flex-col w-64 border-l border-gray-100 p-5 items-center flex-shrink-0 bg-[#FEFCFB]">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 overflow-hidden mb-4">
              {activeThread.participantAvatar ? (
                <img src={activeThread.participantAvatar} alt="" className="w-full h-full object-cover" />
              ) : activeThread.participantName?.[0]?.toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">{activeThread.participantName}</h3>
            <p className="text-xs text-brand-burgundy font-semibold uppercase tracking-wide mt-1">Archive Member</p>

            <div className="w-full mt-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {['Gardening', 'Philosophy', 'Classic Literature'].map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{tag}</span>
                ))}
              </div>
            </div>

            <div className="w-full mt-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shared Media</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
                ))}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 font-bold">+12</div>
              </div>
            </div>

            <button className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
              Report Connection
            </button>
          </div>
        </>
      ) : (
        !activeThreadId && threads.length > 0 && (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 opacity-20 mx-auto mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your connections to start chatting</p>
            </div>
          </div>
        )
      )}

      {/* Floating "new conversation" button + connection picker.
          Hidden while a conversation is open so it never overlaps the composer. */}
      {!activeThreadId && (
        <>
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand-burgundy text-white shadow-lg flex items-center justify-center hover:bg-opacity-90 active:scale-95 transition-all"
            aria-label="New conversation"
          >
            <Plus className="w-6 h-6" />
          </button>

          {showPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              <div className="fixed bottom-24 right-6 z-50 w-72 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-900">
                  Start a conversation
                </div>
                <div className="max-h-80 overflow-auto">
                  {threads.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                      No connections yet. Add some from Mentorship → Discover.
                    </div>
                  ) : (
                    threads.map((conn) => (
                      <button
                        key={conn.id}
                        onClick={() => {
                          setActiveThreadId(conn.id);
                          setTargetInfo(conn);
                          setShowPicker(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs overflow-hidden flex-shrink-0">
                          {conn.participantAvatar ? (
                            <img src={conn.participantAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            conn.participantName?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{conn.participantName}</p>
                          {conn.participantIdentity && (
                            <p className="text-[11px] text-brand-burgundy font-semibold uppercase tracking-wide">
                              {conn.participantIdentity}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ============ HOME TAB ============ */
// Categories a post can belong to; also drive the feed filter chips.
const POST_CATEGORIES = [
  'Culture & Heritage', 'Traditions', 'History', 'Education', 'Technology',
  'Career', 'Business', 'Finance', 'Health & Wellness', 'Sports', 'Travel',
  'Music', 'Arts & Crafts', 'Community', 'Environment & Nature',
];

// Statuses live in the posts table with type='status' and disappear after 24h.
const STATUS_TTL_MS = 24 * 60 * 60 * 1000;

// Quick-pick emojis for the chat composer.
const CHAT_EMOJIS = [
  '😀', '😂', '🥰', '😍', '😊', '😅', '🤗', '😮',
  '👍', '👏', '🙏', '🤝', '💪', '🙌', '✨', '💯',
  '❤️', '🎉', '🔥', '🌱', '☀️', '🎂', '🍲', '😢',
];

function HomeContent({ userName, userAvatar, currentUser, isNewUser = false, onStartRecording, onBrowseArchive, onOpenProfile }) {
  const { t } = useLanguage();
  const firstName = userName?.split(' ')[0] || 'Friend';
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [composer, setComposer] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [category, setCategory] = useState(POST_CATEGORIES[0]);
  const [photo, setPhoto] = useState(null); // data URL preview until published
  const [feedFilter, setFeedFilter] = useState('All');
  const [summary, setSummary] = useState(null); // { totalPoints, badges }
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [postingStatus, setPostingStatus] = useState(false);
  const [statusViewer, setStatusViewer] = useState(null); // { group, index }
  // Status composer: null | 'menu' | 'text' | 'voice'
  const [statusComposer, setStatusComposer] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [recordingStatus, setRecordingStatus] = useState(false);
  const photoInputRef = useRef(null);
  const statusInputRef = useRef(null);
  const statusRecRef = useRef(null);

  const loadFeed = useCallback(async () => {
    setError(null);
    try {
      const data = await getFeed();
      setFeed(data.feed || []);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  // Root Points + badges for the welcome card.
  useEffect(() => {
    if (!currentUser?.id) return;
    getPointsSummary(currentUser.id).then(setSummary).catch(() => {});
  }, [currentUser?.id]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      // Compress before upload — full-size photos exceed server body limits (413).
      setPhoto(await compressImage(file));
    } catch (err) {
      console.error('Could not process image:', err);
      setError('Could not read that image. Try a different one.');
    }
  };

  const handlePublish = async () => {
    const body = composer.trim();
    if ((!body && !photo) || publishing) return;
    setPublishing(true);
    try {
      let mediaUrl = null;
      if (photo) {
        const uploadResult = await uploadChatMedia(photo, 'image');
        if (!uploadResult.success) throw new Error('Photo upload failed');
        mediaUrl = uploadResult.url;
      }
      const data = await createPost(body || category, mediaUrl ? 'photo' : 'post', mediaUrl, category);
      if (data.post) setFeed((prev) => [data.post, ...prev]);
      setComposer('');
      setPhoto(null);
    } catch (err) {
      console.error('Error publishing post:', err);
      setError('Could not publish your post. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  // Split the raw feed: statuses (last 24h, WhatsApp-style ring row) vs posts.
  const now = Date.now();
  const activeStatuses = feed.filter(
    (p) => p.type === 'status' && now - new Date(p.created_at).getTime() < STATUS_TTL_MS
  );
  // Group statuses by author: [{ authorId, authorName, avatar, items[] }]
  const statusGroups = Object.values(
    activeStatuses.reduce((acc, s) => {
      (acc[s.author_id] ||= {
        authorId: s.author_id,
        authorName: s.author_name,
        avatar: s.avatar_url,
        items: [],
      }).items.push(s);
      return acc;
    }, {})
  ).map((g) => ({ ...g, items: g.items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) }));
  const myStatusGroup = statusGroups.find((g) => g.authorId === currentUser?.id);
  const otherStatusGroups = statusGroups.filter((g) => g.authorId !== currentUser?.id);

  const posts = feed.filter((p) => p.type !== 'status');
  const visibleFeed = feedFilter === 'All' ? posts : posts.filter((p) => p.category === feedFilter);

  // Optimistic like toggle: flip locally, reconcile with the server count.
  const handleLike = async (post) => {
    setFeed((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, liked_by_me: !p.liked_by_me, like_count: (p.like_count || 0) + (p.liked_by_me ? -1 : 1) }
          : p
      )
    );
    try {
      const data = await togglePostLike(post.id);
      setFeed((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, liked_by_me: data.liked, like_count: data.like_count } : p))
      );
    } catch {
      // Revert on failure
      setFeed((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, liked_by_me: post.liked_by_me, like_count: post.like_count }
            : p
        )
      );
    }
  };

  // ---- 24h statuses. The post's `category` column carries the media kind
  // ('image' | 'video' | 'audio' | 'text') so the viewer knows how to render.
  const publishStatus = async (body, mediaUrl, kind) => {
    setPostingStatus(true);
    try {
      const data = await createPost(body || 'Status', 'status', mediaUrl, kind);
      if (data.post) setFeed((prev) => [data.post, ...prev]);
    } catch (err) {
      console.error('Error posting status:', err);
      setError(t('statusFailed'));
    } finally {
      setPostingStatus(false);
    }
  };

  // Photo or video status from a file.
  const handleStatusFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || postingStatus) return;
    setStatusComposer(null);
    setPostingStatus(true);
    try {
      let dataUrl;
      let kind;
      if (file.type.startsWith('video/')) {
        if (file.size > 15 * 1024 * 1024) {
          setError(t('statusVideoTooBig'));
          setPostingStatus(false);
          return;
        }
        dataUrl = await fileToDataUrl(file);
        kind = 'video';
      } else {
        dataUrl = await compressImage(file);
        kind = 'image';
      }
      const uploadResult = await uploadChatMedia(dataUrl, kind);
      if (!uploadResult.success) throw new Error('Upload failed');
      await publishStatus('Status', uploadResult.url, kind);
    } catch (err) {
      console.error('Error posting status:', err);
      setError(t('statusFailed'));
      setPostingStatus(false);
    }
  };

  const publishTextStatus = async () => {
    const text = statusText.trim();
    if (!text) return;
    setStatusComposer(null);
    setStatusText('');
    await publishStatus(text, null, 'text');
  };

  const startVoiceStatus = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        try {
          const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
          const dataUrl = await blobToDataUrl(blob);
          // Cloudinary stores audio under the 'video' resource type.
          const uploadResult = await uploadChatMedia(dataUrl, 'video');
          if (!uploadResult.success) throw new Error('Upload failed');
          await publishStatus('Voice status', uploadResult.url, 'audio');
        } catch (err) {
          console.error('Error posting voice status:', err);
          setError(t('statusFailed'));
        }
      };
      rec.start();
      statusRecRef.current = rec;
      setRecordingStatus(true);
      setStatusComposer('voice');
    } catch {
      setError(t('micDenied'));
      setStatusComposer(null);
    }
  };

  const stopVoiceStatus = () => {
    statusRecRef.current?.stop();
    statusRecRef.current = null;
    setRecordingStatus(false);
    setStatusComposer(null);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:p-6 sm:pt-4">
      {/* Status row — 24h statuses (photo, video, voice, text), WhatsApp style */}
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
        {/* My status: opens viewer if one exists; the + badge always composes */}
        <div className="relative flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
          <button
            onClick={() =>
              myStatusGroup
                ? setStatusViewer({ group: myStatusGroup, index: 0 })
                : setStatusComposer('menu')
            }
            className="block"
          >
            <div className={`rounded-full p-[3px] ${myStatusGroup ? 'bg-gradient-to-tr from-brand-burgundy to-amber-500' : 'bg-gray-200'}`}>
              <div className="w-14 h-14 rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full bg-brand-burgundy/10 overflow-hidden flex items-center justify-center text-brand-burgundy font-bold">
                  {postingStatus ? (
                    <div className="w-5 h-5 border-2 border-brand-burgundy/30 border-t-brand-burgundy rounded-full animate-spin" />
                  ) : userAvatar ? (
                    <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    firstName[0]?.toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </button>
          <button
            onClick={() => setStatusComposer('menu')}
            aria-label={t('addStatus')}
            className="absolute top-9 right-0 w-5 h-5 rounded-full bg-brand-burgundy text-white flex items-center justify-center border-2 border-white"
          >
            <Plus className="w-3 h-3" />
          </button>
          <span className="text-[11px] font-semibold text-gray-600 truncate w-full text-center">{t('myStatus')}</span>
        </div>
        <input ref={statusInputRef} type="file" accept="image/*,video/*" onChange={handleStatusFile} className="hidden" />

        {otherStatusGroups.map((group) => (
          <button
            key={group.authorId}
            onClick={() => setStatusViewer({ group, index: 0 })}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16"
          >
            <div className="rounded-full p-[3px] bg-gradient-to-tr from-brand-burgundy to-amber-500">
              <div className="w-14 h-14 rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600 font-bold">
                  {group.avatar ? (
                    <img src={group.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    group.authorName?.[0]?.toUpperCase() || '?'
                  )}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-gray-600 truncate w-full text-center">
              {group.authorName?.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Status composer — choose what kind of status to share */}
      {statusComposer && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => { if (!recordingStatus) { setStatusComposer(null); setStatusText(''); } }}>
          <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            {statusComposer === 'menu' && (
              <>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">{t('addStatus')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => statusInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 transition min-h-[52px]"
                  >
                    <span className="w-9 h-9 rounded-full bg-brand-burgundy/10 text-brand-burgundy flex items-center justify-center"><ImageIcon className="w-4 h-4" /></span>
                    {t('statusPhotoVideo')}
                  </button>
                  <button
                    onClick={startVoiceStatus}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 transition min-h-[52px]"
                  >
                    <span className="w-9 h-9 rounded-full bg-brand-burgundy/10 text-brand-burgundy flex items-center justify-center"><Mic className="w-4 h-4" /></span>
                    {t('statusVoice')}
                  </button>
                  <button
                    onClick={() => setStatusComposer('text')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 transition min-h-[52px]"
                  >
                    <span className="w-9 h-9 rounded-full bg-brand-burgundy/10 text-brand-burgundy flex items-center justify-center font-serif font-bold">T</span>
                    {t('statusText')}
                  </button>
                </div>
              </>
            )}

            {statusComposer === 'text' && (
              <>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">{t('statusText')}</h3>
                <textarea
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder={t('statusTextPlaceholder')}
                  rows={4}
                  maxLength={280}
                  autoFocus
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-[#FBF9F8] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20"
                />
                <button
                  onClick={publishTextStatus}
                  disabled={!statusText.trim()}
                  className="mt-3 w-full bg-brand-burgundy text-white py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 min-h-[48px]"
                >
                  {t('sharePost')}
                </button>
              </>
            )}

            {statusComposer === 'voice' && (
              <div className="text-center py-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                  <Mic className="w-7 h-7 text-red-500" />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-700">{t('recordingEllipsis')}</p>
                <button
                  onClick={stopVoiceStatus}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-burgundy text-white py-3 rounded-2xl font-semibold text-sm min-h-[48px]"
                >
                  <Square className="w-4 h-4" /> {t('stopAndShare')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Welcome card */}
      <div className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-burgundy/[0.05]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-amber-400/[0.06]" />
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-burgundy">
          {isNewUser ? t('welcomeNew') : t('welcomeBack')}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif font-bold text-gray-900">{userName}</h1>
        <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl">
          {t('homeBlurb')}
        </p>
        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            {summary?.totalPoints ?? currentUser?.root_points ?? 0} Root Points
          </span>
          {summary?.badges?.length ? (
            <BadgeDisplay badges={summary.badges} />
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-500">
              <Award className="w-4 h-4" />
              {t('noBadgesYet')}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={onStartRecording}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-burgundy px-6 py-3 text-sm font-bold text-white hover:bg-opacity-90 transition-all min-h-[48px]"
          >
            {t('startRecording')} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onBrowseArchive}
            className="inline-flex items-center rounded-xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-all min-h-[48px]"
          >
            {t('browseArchive')}
          </button>
        </div>
      </div>

      {/* Status viewer */}
      {statusViewer && (
        <div className="fixed inset-0 z-[95] bg-black/95 flex flex-col" onClick={() => setStatusViewer(null)}>
          <div className="flex items-center gap-3 p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                const authorId = statusViewer.group.authorId;
                setStatusViewer(null);
                onOpenProfile?.(authorId);
              }}
              className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition"
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center font-bold">
                {statusViewer.group.avatar ? (
                  <img src={statusViewer.group.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  statusViewer.group.authorName?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{statusViewer.group.authorName}</p>
                <p className="text-xs text-white/50">{timeAgo(statusViewer.group.items[statusViewer.index]?.created_at)}</p>
              </div>
            </button>
            {/* Progress segments */}
            <div className="absolute top-1.5 left-4 right-4 flex gap-1">
              {statusViewer.group.items.map((_, i) => (
                <div key={i} className={`h-0.5 flex-1 rounded-full ${i <= statusViewer.index ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
            <button onClick={() => setStatusViewer(null)} aria-label="Close" className="p-2 text-white/70 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-2 pb-6" onClick={(e) => e.stopPropagation()}>
            {statusViewer.index > 0 && (
              <button
                onClick={() => setStatusViewer((v) => ({ ...v, index: v.index - 1 }))}
                className="absolute left-2 z-10 p-2 text-white/60 hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {(() => {
              const item = statusViewer.group.items[statusViewer.index];
              if (!item) return null;
              if (item.category === 'text' || !item.media_url) {
                return (
                  <div className="max-w-md w-full rounded-3xl bg-gradient-to-br from-brand-burgundy to-[#3D0501] p-10 text-center">
                    <p className="text-white text-xl font-serif leading-relaxed whitespace-pre-wrap">{item.body}</p>
                  </div>
                );
              }
              if (item.category === 'video') {
                return <video key={item.id} src={item.media_url} controls autoPlay playsInline className="max-h-full max-w-full rounded-2xl" />;
              }
              if (item.category === 'audio') {
                return (
                  <div className="max-w-md w-full rounded-3xl bg-gradient-to-br from-brand-burgundy to-[#3D0501] p-10 text-center space-y-5">
                    <Mic className="w-10 h-10 text-white/80 mx-auto" />
                    <audio key={item.id} src={item.media_url} controls autoPlay className="w-full" />
                  </div>
                );
              }
              return <img src={item.media_url} alt="" className="max-h-full max-w-full rounded-2xl object-contain" />;
            })()}
            {statusViewer.index < statusViewer.group.items.length - 1 && (
              <button
                onClick={() => setStatusViewer((v) => ({ ...v, index: v.index + 1 }))}
                className="absolute right-2 z-10 p-2 text-white/60 hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-burgundy flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
            {userAvatar ? <img src={userAvatar} alt="" className="w-full h-full object-cover" /> : firstName[0]?.toUpperCase()}
          </div>
          <textarea
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder={t('composerPlaceholder')}
            rows={3}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-[#FBF9F8] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20"
          />
        </div>

        {/* Category picker */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">{t('selectCategory')}</p>
          <div className="flex flex-wrap gap-2">
            {POST_CATEGORIES.map((cat) => (
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

        {/* Photo preview */}
        {photo && (
          <div className="mt-4 relative inline-block">
            <img src={photo} alt="Attached" className="max-h-48 rounded-xl border border-gray-100" />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-900/80 text-white flex items-center justify-center hover:bg-gray-900"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-burgundy transition-colors min-h-[44px]"
          >
            <ImageIcon className="w-5 h-5" /> {t('photoVideo')}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
          <button
            onClick={handlePublish}
            disabled={(!composer.trim() && !photo) || publishing}
            className="bg-brand-burgundy text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all min-h-[44px] disabled:opacity-40"
          >
            {publishing ? t('publishing') : t('sharePost')}
          </button>
        </div>
      </div>

      {/* Feed filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {['All', ...POST_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFeedFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
              feedFilter === cat
                ? 'bg-brand-burgundy text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-burgundy/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-16">
          <BrandLoader size="sm" />
        </div>
      ) : error ? (
        <EmptyState icon={X} title="Couldn't load the feed" subtitle={error} action={{ label: 'Try again', onClick: loadFeed }} />
      ) : visibleFeed.length === 0 ? (
        <EmptyState icon={BookOpen} title={feedFilter === 'All' ? 'No stories yet' : `Nothing in ${feedFilter} yet`} subtitle="Be the first to share a story or lesson with the community using the box above." />
      ) : (
        <div className="space-y-4">
          {visibleFeed.map((post) => {
            const isMine = post.author_id === currentUser?.id;
            return (
              <article key={post.id} className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <button onClick={() => onOpenProfile?.(post.author_id)} className="flex items-center gap-3 min-w-0 flex-1 text-left active:opacity-70 hover:opacity-80 transition">
                    <span className="rounded-full ring-2 ring-brand-burgundy/10 ring-offset-2 flex-shrink-0">
                      <Avatar name={post.author_name} avatar={post.avatar_url} size="w-10 h-10" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {post.author_name || 'Community member'}{isMine && <span className="text-gray-400 font-normal"> · You</span>}
                      </p>
                      <p className="text-[11px] text-gray-400 tracking-wide">
                        {post.identity || 'Member'} · {timeAgo(post.created_at)}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {post.media_url && post.type !== 'audio_archive' && post.type !== 'voice' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                        <ImageIcon className="w-3 h-3" /> Photo
                      </span>
                    )}
                    {post.category && (
                      <span className="rounded-full bg-brand-burgundy/5 px-2.5 py-1 text-[10px] font-bold text-brand-burgundy">
                        {post.category}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[15px] text-gray-700 font-serif leading-relaxed whitespace-pre-wrap mt-3">{post.body || post.title}</p>
                {post.media_url && (
                  <div className="mt-3 -mx-4 sm:mx-0">
                    {post.type === 'audio_archive' || post.type === 'voice' ? (
                      <div className="mx-4 sm:mx-0"><audio src={post.media_url} controls className="w-full" /></div>
                    ) : (
                      <img src={post.media_url} alt="" loading="lazy" className="sm:rounded-2xl max-h-[480px] w-full object-cover sm:border sm:border-gray-100" />
                    )}
                  </div>
                )}

                {/* Post actions */}
                <div className="mt-3 pt-2 border-t border-gray-50 flex items-center gap-2">
                  <button
                    onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 text-sm font-semibold rounded-full px-3.5 py-2 transition-all min-h-[40px] ${
                      post.liked_by_me ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400 hover:bg-red-50/60'
                    }`}
                  >
                    <Heart className={`w-[18px] h-[18px] transition-transform ${post.liked_by_me ? 'fill-red-500 scale-110' : ''}`} />
                    {post.like_count || 0}
                  </button>
                  <button
                    onClick={() => setOpenCommentsId((id) => (id === post.id ? null : post.id))}
                    className={`flex items-center gap-1.5 text-sm font-semibold rounded-full px-3.5 py-2 transition-all min-h-[40px] ${
                      openCommentsId === post.id ? 'text-brand-burgundy bg-brand-burgundy/5' : 'text-gray-400 hover:text-brand-burgundy hover:bg-brand-burgundy/5'
                    }`}
                  >
                    <MessageCircle className="w-[18px] h-[18px]" />
                    {t('comment')}
                  </button>
                </div>

                {openCommentsId === post.id && (
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <CommentsSection contentType="post" contentId={post.id} contentAuthor={post.author_name} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ THE ARCHIVE TAB (Wisdom Hub) ============ */
function ArchiveContent({ onCreateStory, onCreateArticle, onRecord }) {
  const [activeTab, setActiveTab] = useState('stories'); // stories | oral | library
  const [stories, setStories] = useState([]);
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  const handleSuccess = () => {
    loadContent();
  };

  // Fetch stories and library on mount
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const [storiesRes, libraryRes] = await Promise.all([
        getStories(),
        getLibrary()
      ]);
      setStories(storiesRes.stories || []);
      setLibrary(libraryRes.articles || []);
    } catch (err) {
      console.error('Failed to load content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter content based on search
  const filteredStories = stories.filter(s =>
    (s.body?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.display_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredLibrary = library.filter(a =>
    (a.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.excerpt?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Oral archive: stories that carry an audio recording (voice memoirs).
  const filteredOral = filteredStories.filter(
    (s) => s.media_url && (s.type === 'audio_archive' || /\.(webm|ogg|mp3|wav|m4a|aac)(\?|#|$)/i.test(s.media_url))
  );

  const content =
    activeTab === 'stories' ? filteredStories : activeTab === 'oral' ? filteredOral : filteredLibrary;

  if (selectedPost) {
    const contentType = selectedPost.type === 'audio_archive' || selectedPost.type === 'story' ? 'story' : 'article';
    return <PostDetail post={selectedPost} contentType={contentType} onBack={() => setSelectedPost(null)} />;
  }

  return (
    <div className="flex flex-col h-full md:p-6 pt-4 space-y-4 md:space-y-6 max-w-6xl mx-auto">
      {/* Header + Tabs + Search */}
      <div className="md:p-6 p-4 pt-3 md:pt-4 space-y-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Wisdom Hub</h2>
          <button
            onClick={activeTab === 'stories' ? onCreateStory : activeTab === 'oral' ? onRecord : onCreateArticle}
            className="px-4 md:px-5 py-2.5 md:py-2 rounded-xl text-sm md:text-base font-semibold bg-brand-burgundy text-white hover:bg-opacity-90 transition-all min-h-[44px] md:min-h-auto whitespace-nowrap"
          >
            + {activeTab === 'stories' ? 'Story' : activeTab === 'oral' ? t('record') : 'Article'}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => {setActiveTab('stories'); setSearchTerm('');}}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm md:text-base font-semibold transition-all min-h-[44px] whitespace-nowrap flex-shrink-0 ${
              activeTab === 'stories'
                ? 'bg-brand-burgundy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" strokeWidth={1.75} /> {t('storiesTab')}
          </button>
          <button
            onClick={() => {setActiveTab('oral'); setSearchTerm('');}}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm md:text-base font-semibold transition-all min-h-[44px] whitespace-nowrap flex-shrink-0 ${
              activeTab === 'oral'
                ? 'bg-brand-burgundy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Mic className="w-4 h-4" strokeWidth={1.75} /> {t('oralArchive')}
          </button>
          <button
            onClick={() => {setActiveTab('oral'); setSearchTerm('');}}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm md:text-base font-semibold transition-all min-h-[44px] ${
              activeTab === 'oral'
                ? 'bg-brand-burgundy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Mic className="w-4 h-4" strokeWidth={1.75} /> {t('oralArchive')}
          </button>
          <button
            onClick={() => {setActiveTab('library'); setSearchTerm('');}}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm md:text-base font-semibold transition-all min-h-[44px] whitespace-nowrap flex-shrink-0 ${
              activeTab === 'library'
                ? 'bg-brand-burgundy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Library className="w-4 h-4" strokeWidth={1.75} /> {t('libraryTab')}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchArchive')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-2.5 bg-white border border-gray-200 rounded-full text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 min-h-[48px] md:min-h-auto"
          />
        </div>
      </div>

      {/* Content Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20 md:py-16">
          <div className="text-center">
            <div className="mb-4 flex justify-center"><BrandLoader /></div>
            <p className="text-gray-500 text-lg">Loading {activeTab}...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 md:py-16 px-4">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={loadContent}
              className="px-6 py-3 bg-brand-burgundy text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all min-h-[48px]"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : content.length === 0 ? (
        <div className="flex items-center justify-center py-20 md:py-16 px-4">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No {activeTab} found</p>
            <p className="text-gray-400 text-sm mt-2">Start by creating your first {activeTab === 'stories' ? 'story' : 'article'}</p>
          </div>
        </div>
      ) : (
        <div className="md:p-6 p-4 pt-2 md:pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {activeTab === 'oral'
            ? content.map((item) => (
                <div
                  key={item.id || item._id}
                  className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#FBF1F0] flex items-center justify-center text-brand-burgundy flex-shrink-0">
                      <Mic className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.display_name}</p>
                      {item.category && <p className="text-xs text-gray-500">{item.category}</p>}
                    </div>
                  </div>
                  {item.body && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed font-serif italic">
                      "{item.body.substring(0, 140)}"
                    </p>
                  )}
                  <audio src={item.media_url} controls preload="none" className="w-full mt-auto" />
                </div>
              ))
            : content.map((item) => (
            <button
              key={item.id || item._id}
              onClick={() => setSelectedPost(item)}
              className="text-left group bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all min-h-[280px] md:min-h-[320px] flex flex-col"
            >
              {/* Icon/Avatar */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#FBF1F0] flex items-center justify-center text-brand-burgundy mb-4 flex-shrink-0">
                {activeTab === 'stories'
                  ? <BookOpen className="w-6 h-6" strokeWidth={1.75} />
                  : <Library className="w-6 h-6" strokeWidth={1.75} />}
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-burgundy transition-colors">
                {activeTab === 'stories' ? (item.body || '').substring(0, 100) : item.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm md:text-base text-gray-600 mb-4 flex-1 line-clamp-3 leading-relaxed">
                {activeTab === 'stories' ? (item.body || '').substring(100, 200) : item.excerpt}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                <div className="w-8 h-8 rounded-full bg-brand-burgundy/10 flex items-center justify-center text-xs font-bold text-brand-burgundy flex-shrink-0">
                  {(activeTab === 'stories' ? item.display_name : item.author)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {activeTab === 'stories' ? item.display_name : item.author}
                  </p>
                  {activeTab === 'library' && (
                    <p className="text-xs text-gray-500">{item.category}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ POST DETAIL VIEW ============ */
function PostDetail({ post, contentType = 'story', onBack }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 md:p-6 p-4 pt-3 md:pt-4 border-b border-gray-100 flex-shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:min-h-[44px] min-h-[48px] flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg md:text-xl font-serif font-bold text-gray-900 truncate">{post.title || post.body?.substring(0, 50)}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto md:p-6 p-4 pt-4 md:pt-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight mb-4">
            {post.title || post.body?.substring(0, 100)}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-10 h-10 rounded-full bg-brand-burgundy/10 flex items-center justify-center font-bold text-brand-burgundy">
              {(post.display_name || post.author)?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{post.display_name || post.author}</p>
              <p className="text-xs text-gray-400">
                {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Body/Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-lg md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content || post.body}
          </p>
        </div>

        {/* Meta Info */}
        <div className="bg-[#FBF1F0] rounded-2xl p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Category</p>
              <p className="font-semibold text-gray-900">{post.category || 'General'}</p>
            </div>
            {post.tags?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-white text-gray-700 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-5 py-3 md:py-2.5 rounded-full text-sm md:text-base font-semibold border border-brand-burgundy text-brand-burgundy hover:bg-brand-burgundy hover:text-white transition-all min-h-[48px] md:min-h-auto"
          >
            ← Back
          </button>
        </div>

        {/* Comments Section */}
        <CommentsSection
          contentType={contentType}
          contentId={post.id || post._id}
          contentAuthor={post.display_name || post.author}
        />
      </div>
    </div>
  );
}

/* ============ SETTINGS TAB ============ */
function SettingsContent({ userName, userEmail, appUser, onLogout, language, changeLanguage, auth, darkMode = false, onToggleDark }) {
  const { t } = useLanguage();
  const [settingsTab, setSettingsTab] = useState('profile'); // profile | moderation
  const [profile, setProfile] = useState({
    displayName: userName || '',
    email: userEmail || '',
    bio: appUser?.bio || '',
    location: appUser?.location || '',
    identity: appUser?.identity || 'Senior',
    age: appUser?.age || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        display_name: profile.displayName,
        bio: profile.bio,
        identity: profile.identity,
        age: profile.age ? parseInt(profile.age, 10) : null,
        language,
      });
      setSaved(true);
      if (auth?.refreshUser) auth.refreshUser();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-4">
      <div className="flex items-center justify-between gap-6 mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Settings & Profile</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSettingsTab('profile')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
              settingsTab === 'profile'
                ? 'bg-brand-burgundy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <User className="w-4 h-4" strokeWidth={1.75} /> Profile
          </button>
          <button
            onClick={() => setSettingsTab('moderation')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
              settingsTab === 'moderation'
                ? 'bg-brand-burgundy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Shield className="w-4 h-4" strokeWidth={1.75} /> Moderation
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {settingsTab === 'profile' && (
      <div>
      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-burgundy flex items-center justify-center text-white font-bold text-2xl overflow-hidden flex-shrink-0">
            {appUser?.avatar_url ? (
              <img src={appUser.avatar_url} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              profile.displayName?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{profile.displayName || 'Your name'}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wide text-brand-burgundy">{profile.identity}</span>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name</label>
            <input type="text" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" value={profile.email} disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
            <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell others about yourself..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
              <input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} placeholder="e.g. 65" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 min-h-[44px]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Identity</label>
              <div className="flex gap-3 mt-1">
                {['Senior', 'Youth'].map((id) => (
                  <button key={id} onClick={() => setProfile({ ...profile, identity: id })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${profile.identity === id ? 'bg-brand-burgundy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{id}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full bg-brand-burgundy text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all min-h-[48px] disabled:opacity-50">
            {saving ? t('saving') : saved ? '✓' : t('saveChanges')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('preferences')}</h2>
        <div className="space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">{t('languageLabel')}</p>
              <p className="text-sm text-gray-500">{t('languageDesc')}</p>
            </div>
            <select
              value={language}
              onChange={async (e) => {
                await changeLanguage(e.target.value);
                // Refresh user profile to sync language across app
                auth?.refreshUser?.();
              }}
              className="bg-gray-100 text-gray-700 text-sm rounded-xl px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 min-h-[40px]"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          {/* Dark theme — reachable on mobile where the sidebar toggle isn't */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">{t('darkTheme')}</p>
              <p className="text-sm text-gray-500">{t('darkThemeDesc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={darkMode} onChange={onToggleDark} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-burgundy"></div>
            </label>
          </div>
          {[
            { label: 'Email notifications', desc: 'Get updates on new matches and messages' },
            { label: 'Public profile', desc: 'Let others see your profile' },
            { label: 'Allow mentorship requests', desc: 'Accept requests from potential mentees' },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
              <div><p className="font-medium text-gray-900">{pref.label}</p><p className="text-sm text-gray-500">{pref.desc}</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-burgundy"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]">
        <LogOut className="w-5 h-5" />
        {t('signOut')}
      </button>
      </div>
      )}

      {/* Moderation Tab */}
      {settingsTab === 'moderation' && (
        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
          <ModerationDashboard />
        </div>
      )}
    </div>
  );
}

/* ============ MENTORSHIP TAB ============ */
function MentorshipContent({ currentUser, onOpenChat, onStartCall, onlineUsers = [], onOpenProfile }) {
  const connectHint = useHint('mentorship_request_session');
  const myCircleVideoHint = useHint('mycircle_video_call');
  const myCircleMessageHint = useHint('mycircle_message');
  const [view, setView] = useState('discover'); // discover | requests | circle
  const [filter, setFilter] = useState('recommended'); // recommended | Senior | Youth | All
  const [recommendations, setRecommendations] = useState([]);
  const [people, setPeople] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requestedIds, setRequestedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const data = await getPendingRequests();
      setPendingRequests(data.requests || []);
    } catch (err) { console.error('Error fetching requests:', err); }
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      const data = await getAcceptedConnections();
      setConnections(data.connections || []);
    } catch (err) { console.error('Error fetching connections:', err); }
  }, []);

  // Initial load: requests + connections + recommendations
  useEffect(() => {
    fetchRequests();
    fetchConnections();
  }, [fetchRequests, fetchConnections]);

  // Load the discover list whenever the filter changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (filter === 'recommended') {
          const data = await getRecommendations();
          if (!cancelled) setRecommendations(data.recommendations || data.matches || []);
        } else {
          const identity = filter === 'All' ? null : filter;
          const data = await getAllUsers(identity);
          if (!cancelled) setPeople(data.users || []);
        }
      } catch (err) {
        console.error('Error loading people:', err);
        if (!cancelled) setError("We couldn't reach the server. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filter, reloadKey]);

  const handleRequest = async (userId, message = null) => {
    setRequestedIds((prev) => new Set(prev).add(userId));
    try {
      await requestConnection(userId, message);
    } catch (err) {
      console.error('Error requesting connection:', err);
      // Roll back the optimistic update on failure
      setRequestedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleAccept = async (connectionId) => {
    setPendingRequests((prev) => prev.filter((r) => r.connection_id !== connectionId));
    try {
      await acceptConnection(connectionId);
      fetchConnections();
    } catch (err) {
      console.error('Error accepting connection:', err);
      fetchRequests();
    }
  };

  const handleReject = async (connectionId) => {
    setPendingRequests((prev) => prev.filter((r) => r.connection_id !== connectionId));
    try {
      await rejectConnection(connectionId);
    } catch (err) {
      console.error('Error rejecting connection:', err);
      fetchRequests();
    }
  };

  const sourceList = filter === 'recommended' ? recommendations : people;
  const query = search.trim().toLowerCase();
  const discoverList = !query
    ? sourceList
    : sourceList.filter((p) => (p.display_name || '').toLowerCase().includes(query));

  const filters = [
    { id: 'recommended', label: 'Recommended', icon: Sparkles },
    { id: 'Senior', label: 'Seniors', icon: Users },
    { id: 'Youth', label: 'Youth', icon: Users },
    { id: 'All', label: 'Everyone', icon: Users },
  ];

  const tabs = [
    { id: 'discover', label: 'Discover Mentors and Mentees' },
    { id: 'requests', label: 'Requests', count: pendingRequests.length },
    { id: 'circle', label: 'My Connections', count: connections.length },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 pt-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">Mentorship</h1>
        <p className="text-gray-400 italic font-serif mt-1">Find a mentor, share your wisdom, build connections across generations.</p>
      </div>

      {/* View tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              view === tab.id ? 'text-brand-burgundy' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-brand-burgundy text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {tab.count}
                </span>
              )}
            </span>
            {view === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-burgundy rounded-full" />}
          </button>
        ))}
      </div>

      {/* ===== DISCOVER ===== */}
      {view === 'discover' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    filter === f.id ? 'bg-brand-burgundy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <BrandLoader size="sm" />
            </div>
          ) : error ? (
            <EmptyState
              icon={X}
              title="Couldn't load people"
              subtitle={error}
              action={{ label: 'Try again', onClick: () => setReloadKey((k) => k + 1) }}
            />
          ) : discoverList.length === 0 ? (
            <EmptyState icon={Users} title="No one to show here yet" subtitle="Check back soon as more members join the Archive." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {discoverList.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  requested={requestedIds.has(person.id)}
                  onRequest={(message) => handleRequest(person.id, message)}
                  onOpenProfile={onOpenProfile}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== REQUESTS ===== */}
      {view === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <EmptyState icon={Clock} title="No pending requests" subtitle="When someone asks to connect, you'll see it here." />
          ) : (
            pendingRequests.map((req) => (
              <div key={req.connection_id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <Avatar name={req.display_name} avatar={req.avatar_url} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{req.display_name}</p>
                  <p className="text-xs text-brand-burgundy font-semibold uppercase tracking-wide">{req.identity}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(req.connection_id)}
                    className="flex items-center gap-1.5 bg-brand-burgundy text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all min-h-[44px]"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.connection_id)}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== MY CIRCLE ===== */}
      {view === 'circle' && (
        <div className="space-y-4">
          {connections.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Your circle is empty"
              subtitle="Connect with mentors and mentees in the Discover tab to grow your circle."
              action={{ label: 'Discover people', onClick: () => setView('discover') }}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {connections.map((conn) => (
                <div key={conn.connection_id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                  <button onClick={() => onOpenProfile?.(conn.connected_user_id)} className="relative flex-shrink-0 hover:opacity-80 transition">
                    <Avatar name={conn.display_name} avatar={conn.avatar_url} />
                    {onlineUsers.includes(conn.connected_user_id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{conn.display_name}</p>
                    <p className="text-xs text-brand-burgundy font-semibold uppercase tracking-wide">{conn.identity}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative">
                      <button
                        onClick={() => {
                          myCircleVideoHint.recordUse();
                          onStartCall?.(conn.connected_user_id);
                        }}
                        title="Start video session"
                        className="flex items-center justify-center w-11 h-11 bg-[#FBF1F0] text-brand-burgundy rounded-xl hover:bg-brand-burgundy hover:text-white transition-all"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <HintTooltip show={myCircleVideoHint.showHint} text="Start video" position="below" />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => {
                          myCircleMessageHint.recordUse();
                          onOpenChat({
                            id: conn.connected_user_id,
                            participantName: conn.display_name,
                            participantAvatar: conn.avatar_url,
                            participantIdentity: conn.identity,
                          });
                        }}
                        title="Message"
                        className="flex items-center justify-center w-11 h-11 bg-[#FBF1F0] text-brand-burgundy rounded-xl hover:bg-brand-burgundy hover:text-white transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <HintTooltip show={myCircleMessageHint.showHint} text="Send message" position="below" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PersonCard({ person, requested, onRequest, onOpenProfile }) {
  const { t } = useLanguage();
  const requestHint = useHint('mentorship_request_session');
  // Two-step request: first click reveals the "why do you want to connect"
  // note, second click sends it along with the request.
  const [composing, setComposing] = useState(false);
  const [note, setNote] = useState('');
  const interests = [
    ...(person.share_interests || []),
    ...(person.learn_interests || []),
    ...(person.you_can_learn || []),
    ...(person.they_can_learn || []),
  ].filter(Boolean).slice(0, 3);

  const sendRequest = () => {
    requestHint.recordUse();
    onRequest(note.trim() || null);
    setComposing(false);
    setNote('');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col">
      <div className="flex items-start gap-3">
        <button onClick={() => onOpenProfile?.(person.id)} className="hover:opacity-80 transition flex-shrink-0">
          <Avatar name={person.display_name} avatar={person.avatar_url} size="w-14 h-14" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{person.display_name}</p>
          <p className="text-xs text-brand-burgundy font-semibold uppercase tracking-wide">
            {person.identity}{person.age ? ` · ${person.age}` : ''}
          </p>
          {typeof person.compatibility_score === 'number' && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> {person.compatibility_score}% match
            </span>
          )}
        </div>
      </div>

      {person.bio && <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-2 italic">"{person.bio}"</p>}

      {person.language && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="inline-flex items-center gap-1 text-xs border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
            <Globe className="w-3 h-3" /> {LANGUAGE_LABELS[person.language] || person.language}
          </span>
        </div>
      )}

      {interests.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{t('interestsTopics')}</p>
          <div className="flex flex-wrap gap-1.5">
            {interests.map((tag, i) => (
              <span key={i} className="text-xs border border-brand-burgundy/25 text-brand-burgundy px-2.5 py-1 rounded-lg font-semibold capitalize">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {composing && !requested && (
        <div className="mt-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('whyConnectPlaceholder')}
            rows={2}
            maxLength={200}
            autoFocus
            className="w-full resize-none rounded-xl border border-gray-200 bg-[#FBF9F8] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20"
          />
        </div>
      )}

      <div className="relative mt-4 flex gap-2">
        {composing && !requested && (
          <button
            onClick={() => { setComposing(false); setNote(''); }}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all min-h-[44px]"
          >
            {t('cancel')}
          </button>
        )}
        <button
          onClick={() => (composing ? sendRequest() : setComposing(true))}
          disabled={requested}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${
            requested
              ? 'bg-gray-100 text-gray-400 cursor-default'
              : 'bg-brand-burgundy text-white hover:bg-opacity-90'
          }`}
        >
          {requested
            ? <><Check className="w-4 h-4" /> {t('requestSent')}</>
            : composing
              ? <><Send className="w-4 h-4" /> {t('sendRequest')}</>
              : <><UserPlus className="w-4 h-4" /> {t('requestSession')}</>}
        </button>
        {!requested && !composing && <HintTooltip show={requestHint.showHint} text="Send a mentorship request" position="above" />}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <Icon className="w-12 h-12 text-gray-300 mb-3" />
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1 max-w-sm">{subtitle}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 bg-brand-burgundy text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-20">
      <BookOpen className="w-12 h-12 opacity-30" />
      <p className="text-lg font-medium">{label} — coming soon</p>
    </div>
  );
}
