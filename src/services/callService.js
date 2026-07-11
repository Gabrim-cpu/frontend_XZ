/**
 * Call Service - API interactions for WebRTC calls
 */

import { getAuth } from 'firebase/auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const getHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Initiate a new call
 */
export async function initiateCall(receiverId, callType = 'video') {
  const response = await fetch(`${API_URL}/calls/initiate`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ receiverId, callType }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to initiate call');
  }

  return response.json();
}

/**
 * Answer a pending call
 */
export async function answerCall(callId) {
  const response = await fetch(`${API_URL}/calls/${callId}/answer`, {
    method: 'POST',
    headers: await getHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to answer call');
  }

  return response.json();
}

/**
 * Reject a pending call
 */
export async function rejectCall(callId, reason = 'declined') {
  const response = await fetch(`${API_URL}/calls/${callId}/reject`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to reject call');
  }

  return response.json();
}

/**
 * End an active call
 */
export async function endCall(callId) {
  const response = await fetch(`${API_URL}/calls/${callId}/end`, {
    method: 'POST',
    headers: await getHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to end call');
  }

  return response.json();
}

/**
 * Get call status
 */
export async function getCallStatus(callId) {
  const response = await fetch(`${API_URL}/calls/${callId}`, {
    headers: await getHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to get call status');
  }

  return response.json();
}

/**
 * Send SDP offer
 */
export async function sendSdpOffer(callId, offer) {
  const response = await fetch(`${API_URL}/calls/${callId}/sdp`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      type: 'offer',
      sdp: offer.sdp || offer,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to send SDP offer');
  }

  return response.json();
}

/**
 * Send SDP answer
 */
export async function sendSdpAnswer(callId, answer) {
  const response = await fetch(`${API_URL}/calls/${callId}/sdp`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      type: 'answer',
      sdp: answer.sdp || answer,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to send SDP answer');
  }

  return response.json();
}

/**
 * Send ICE candidate
 */
export async function sendIceCandidate(callId, candidate) {
  const response = await fetch(`${API_URL}/calls/${callId}/ice-candidate`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ candidate }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to send ICE candidate');
  }

  return response.json();
}
