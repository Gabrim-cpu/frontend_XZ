import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VideoCallModal({ contactName, onClose, onStartCall }) {
  const { t } = useLanguage();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callStatus, setCallStatus] = useState('ready');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Request camera and microphone access
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setCallStatus('error');
      }
    };

    initializeMedia();

    return () => {
      // Stop all tracks
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartCall = async () => {
    setIsConnecting(true);
    setCallStatus('connecting');
    try {
      if (onStartCall) {
        await onStartCall();
      }
      setCallStatus('connected');
    } catch (err) {
      console.error('Error starting call:', err);
      setCallStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndCall = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    onClose?.();
  };

  const toggleMic = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">{contactName}</h2>
        <button
          onClick={handleEndCall}
          className="rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/20"
          aria-label="Close call"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Video Container */}
      <div className="flex-1 w-full max-w-4xl flex gap-4 mb-8 mt-20">
        {/* Remote Video */}
        <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden">
          {callStatus === 'connected' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-brand-burgundy/20 flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-burgundy animate-pulse" />
                </div>
                <p className="text-white text-sm">
                  {callStatus === 'connecting' ? 'Connexion...' : 'En attente de réponse...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video - Picture in Picture */}
        <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Status */}
      {callStatus && (
        <div className="text-center mb-6">
          <p className="text-gray-300 text-sm">
            {callStatus === 'ready' && 'Prêt à appeler'}
            {callStatus === 'connecting' && 'En cours de connexion...'}
            {callStatus === 'connected' && 'Appel en cours'}
            {callStatus === 'error' && 'Erreur lors de la connexion'}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6 mb-8">
        <button
          onClick={toggleMic}
          className={`rounded-full p-4 min-h-[56px] min-w-[56px] flex items-center justify-center transition ${
            isMicOn
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? (
            <Mic className="h-6 w-6 text-white" />
          ) : (
            <MicOff className="h-6 w-6 text-white" />
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`rounded-full p-4 min-h-[56px] min-w-[56px] flex items-center justify-center transition ${
            isVideoOn
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? (
            <Video className="h-6 w-6 text-white" />
          ) : (
            <VideoOff className="h-6 w-6 text-white" />
          )}
        </button>

        {callStatus === 'ready' ? (
          <button
            onClick={handleStartCall}
            disabled={isConnecting}
            className="rounded-full p-4 min-h-[56px] min-w-[56px] flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
            aria-label="Start call"
          >
            <Phone className="h-6 w-6 text-white" />
          </button>
        ) : (
          <button
            onClick={handleEndCall}
            className="rounded-full p-4 min-h-[56px] min-w-[56px] flex items-center justify-center bg-red-600 hover:bg-red-700 transition"
            aria-label="End call"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </button>
        )}
      </div>

      {/* Hint */}
      <p className="text-gray-400 text-xs text-center max-w-sm">
        💡 WebRTC est en cours de mise en place. Actuellement: démonstration UI
      </p>
    </div>
  );
}
