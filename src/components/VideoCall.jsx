import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const JITSI_DOMAIN = 'meet.jit.si';
const SCRIPT_SRC = `https://${JITSI_DOMAIN}/external_api.js`;

/**
 * Builds a deterministic room name from the two participant ids so that BOTH
 * users land in the same Jitsi room regardless of who starts the call or
 * whether it's launched from My Circle or the chat header. Sorting makes the
 * pair order-independent.
 */
export function makeRoomName(userIdA, userIdB) {
  const pair = [userIdA, userIdB].filter(Boolean).sort();
  return `xz-${pair.join('-')}`;
}

// Load Jitsi's external API script once and reuse it across calls.
function loadJitsiScript() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function VideoCall({ roomName, displayName, audioOnly = false, onClose }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;

    loadJitsiScript()
      .then(() => {
        if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return;
        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: displayName || 'Guest' },
          configOverwrite: {
            prejoinPageEnabled: false,       // join straight in, no lobby page
            startWithVideoMuted: audioOnly,  // "Phone" button → audio-only call
            disableDeepLinking: true,        // stay in-browser, don't push the app
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
          },
        });
        apiRef.current = api;
        // Jitsi fires this when the user hangs up or the room closes.
        api.addEventListener('readyToClose', () => onClose?.());
      })
      .catch(() => setError(true));

    return () => {
      disposed = true;
      apiRef.current?.dispose?.();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full text-sm font-semibold backdrop-blur transition-colors"
      >
        <X className="w-4 h-4" /> Leave
      </button>
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-white text-center px-6">
          <p className="text-lg font-semibold">Couldn't start the call</p>
          <p className="text-sm text-white/60 mt-1">Check your internet connection and try again.</p>
          <button onClick={onClose} className="mt-5 bg-white text-black px-5 py-2.5 rounded-xl font-semibold text-sm">
            Close
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  );
}
