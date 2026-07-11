/**
 * WebRTC Client - Handles peer connections and media streams
 */

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export class WebRTCClient {
  constructor(socket, userId) {
    this.socket = socket;
    this.userId = userId;
    this.peerConnections = new Map(); // callId -> RTCPeerConnection
    this.localStream = null;
    this.remoteStreams = new Map(); // callId -> RemoteStream
    this.onRemoteStream = null; // Callback when remote stream is available
    this.onCallEnded = null; // Callback when call ends
    this.pendingCandidates = new Map(); // callId -> candidates queue
  }

  /**
   * Initialize local media stream
   */
  async getLocalStream(audio = true, video = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio,
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      });
      return this.localStream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      throw new Error(`Media access denied: ${err.message}`);
    }
  }

  /**
   * Create or get peer connection for a call
   */
  createPeerConnection(callId) {
    if (this.peerConnections.has(callId)) {
      return this.peerConnections.get(callId);
    }

    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('📹 Received remote stream:', event.streams);
      this.remoteStreams.set(callId, event.streams[0]);
      if (this.onRemoteStream) {
        this.onRemoteStream(callId, event.streams[0]);
      }
    };

    // Send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice:candidate', {
          callId,
          fromUserId: this.userId,
          toUserId: null, // Will be set by the app
          candidate: event.candidate,
        });
      }
    };

    // Log connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection state [${callId}]:`, pc.connectionState);
      if (pc.connectionState === 'failed') {
        this.handleConnectionFailure(callId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`❄️ ICE state [${callId}]:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        this.handleConnectionFailure(callId);
      }
    };

    this.peerConnections.set(callId, pc);
    this.pendingCandidates.set(callId, []);

    return pc;
  }

  /**
   * Create SDP offer
   */
  async createOffer(callId) {
    const pc = this.createPeerConnection(callId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  /**
   * Create SDP answer
   */
  async createAnswer(callId) {
    const pc = this.peerConnections.get(callId);
    if (!pc) {
      throw new Error(`Peer connection ${callId} not found`);
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  /**
   * Handle SDP offer from remote peer
   */
  async handleOffer(callId, offer) {
    const pc = this.createPeerConnection(callId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // Process any pending ICE candidates
    const pending = this.pendingCandidates.get(callId) || [];
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding pending ICE candidate:', err);
      }
    }
    this.pendingCandidates.set(callId, []);
  }

  /**
   * Handle SDP answer from remote peer
   */
  async handleAnswer(callId, answer) {
    const pc = this.peerConnections.get(callId);
    if (!pc) {
      throw new Error(`Peer connection ${callId} not found`);
    }

    if (pc.signalingState === 'stable') {
      console.warn('Received answer but PC is stable');
      return;
    }

    await pc.setRemoteDescription(new RTCSessionDescription(answer));

    // Process any pending ICE candidates
    const pending = this.pendingCandidates.get(callId) || [];
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding pending ICE candidate:', err);
      }
    }
    this.pendingCandidates.set(callId, []);
  }

  /**
   * Handle ICE candidate from remote peer
   */
  async handleIceCandidate(callId, candidate) {
    const pc = this.peerConnections.get(callId);

    if (!pc) {
      // Queue candidate if PC not ready yet
      const pending = this.pendingCandidates.get(callId) || [];
      pending.push(candidate);
      this.pendingCandidates.set(callId, pending);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }

  /**
   * End call and cleanup resources
   */
  endCall(callId) {
    const pc = this.peerConnections.get(callId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(callId);
    }

    this.remoteStreams.delete(callId);
    this.pendingCandidates.delete(callId);

    console.log(`🏁 Call ended and cleaned up: ${callId}`);
  }

  /**
   * Close all connections
   */
  cleanup() {
    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach((pc) => {
      pc.close();
    });
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.pendingCandidates.clear();

    console.log('🧹 WebRTC client cleaned up');
  }

  /**
   * Get local stream
   */
  getStream() {
    return this.localStream;
  }

  /**
   * Get remote stream for a call
   */
  getRemoteStream(callId) {
    return this.remoteStreams.get(callId);
  }

  /**
   * Handle connection failure
   */
  handleConnectionFailure(callId) {
    console.error(`❌ Connection failed for call ${callId}`);
    if (this.onCallEnded) {
      this.onCallEnded(callId, 'connection_failed');
    }
  }

  /**
   * Get connection stats for debugging
   */
  async getStats(callId) {
    const pc = this.peerConnections.get(callId);
    if (!pc) return null;

    const stats = await pc.getStats();
    const report = {
      audio: {},
      video: {},
      connection: {},
    };

    stats.forEach(report => {
      if (report.type === 'inbound-rtp' && report.kind === 'audio') {
        report.audio = {
          bytesReceived: report.bytesReceived,
          packetsReceived: report.packetsReceived,
          packetsLost: report.packetsLost,
        };
      }
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        report.video = {
          bytesReceived: report.bytesReceived,
          framesDecoded: report.framesDecoded,
          frameRate: report.framesPerSecond,
        };
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        report.connection = {
          currentRoundTripTime: report.currentRoundTripTime,
          availableOutgoingBitrate: report.availableOutgoingBitrate,
        };
      }
    });

    return report;
  }
}

export default WebRTCClient;
