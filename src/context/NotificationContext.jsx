import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Bell, UserPlus, Check, MessageCircle, Award, X, BookOpen, Sparkles, MessageSquare } from 'lucide-react';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const ICONS = {
  connection_request: UserPlus,
  connection_accepted: Check,
  message: MessageCircle,
  badge: Award,
  story_created: BookOpen,
  article_published: Sparkles,
  new_reflection: MessageSquare,
};

export function iconForType(type) {
  return ICONS[type] || Bell;
}

// Which dashboard tab a notification should open when clicked.
const TAB_FOR_TYPE = {
  connection_request: 'mentorship',
  connection_accepted: 'mentorship',
  message: 'messages',
  badge: 'home',
  story_created: 'wisdom',
  article_published: 'wisdom',
  new_reflection: 'wisdom',
};

export function tabForType(type) {
  return TAB_FOR_TYPE[type] || 'home';
}

// Soft two-tone chime, synthesized so we don't need an audio asset.
// Browsers block audio before the first user gesture — fail silently then.
function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const tone = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };
    tone(880, 0, 0.3); // A5
    tone(1318.5, 0.11, 0.38); // E6 — gentle upward interval
    setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch {
    /* unsupported or blocked — stay silent */
  }
}

const toMillis = (createdAt) => {
  // Firestore serverTimestamp may briefly be null on the local write before the
  // server value lands; treat that as "now" so ordering stays sensible.
  if (!createdAt) return Date.now();
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  return new Date(createdAt).getTime();
};

export function NotificationProvider({ children }) {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      setToasts([]);
      initializedRef.current = false;
      return;
    }

    // Equality-only query (no orderBy) so Firestore doesn't require a composite
    // index; we sort client-side. Notification volume per user is small.
    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setNotifications(rows);

        // Toast only for items that arrive AFTER the initial load, and only the
        // important ones. The first snapshot is existing history → no toasts.
        if (initializedRef.current) {
          let hasNew = false;
          snapshot.docChanges().forEach((change) => {
            if (change.type !== 'added') return;
            hasNew = true;
            const data = change.doc.data();
            if (!data.important) return;
            const id = change.doc.id;
            setToasts((prev) =>
              prev.some((t) => t.id === id) ? prev : [...prev, { id, ...data }]
            );
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 6000);
          });
          if (hasNew) playChime();
        }
        initializedRef.current = true;
      },
      (error) => {
        console.error('Notifications listener error:', error.message);
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      const batch = writeBatch(db);
      unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    }
  }, [notifications]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = { notifications, unreadCount, markRead, markAllRead };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,22rem)]">
      {toasts.map((t) => {
        const Icon = iconForType(t.type);
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 bg-white border border-gray-100 shadow-lg rounded-2xl p-4 animate-fade-in-up"
            role="status"
          >
            <div className="w-9 h-9 rounded-full bg-[#FBF1F0] text-brand-burgundy flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
              <p className="text-sm text-gray-500 line-clamp-2">{t.body}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-gray-300 hover:text-gray-600 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
