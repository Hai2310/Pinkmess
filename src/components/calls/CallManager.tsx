import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Monitor,
  Phone,
  PhoneOff,
  Radio,
  Video,
  VideoOff,
  Volume2
} from 'lucide-react';
import { User, CallState } from '../../types';
import { bunnyAudio } from '../../lib/sounds';
import { getSocket } from '../../lib/socket';

interface CallManagerProps {
  callState: CallState;
  currentUser: User;
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
}

type SignalKind = 'offer' | 'answer' | 'ice-candidate';

interface WebRTCSignal {
  callId: string;
  fromUserId: string;
  targetUserId: string;
  kind: SignalKind;
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

const getIceServers = (): RTCIceServer[] => {
  const servers: RTCIceServer[] = [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.cloudflare.com:3478'
      ]
    }
  ];

  // Optional TURN support for strict corporate/mobile networks. Direct P2P with
  // STUN remains the lowest-latency path when both browsers can connect directly.
  const turnUrls = String(import.meta.env.VITE_TURN_URLS || import.meta.env.VITE_TURN_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  const turnUsername = import.meta.env.VITE_TURN_USERNAME as string | undefined;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL as string | undefined;
  if (turnUrls.length > 0 && turnUsername && turnCredential) {
    servers.push({ urls: turnUrls, username: turnUsername, credential: turnCredential });
  }

  return servers;
};

export const CallManager: React.FC<CallManagerProps> = ({
  callState,
  currentUser,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRequestRef = useRef<Promise<MediaStream> | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const offerSentForCallRef = useRef<string | null>(null);
  const callStateRef = useRef(callState);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [waveBars, setWaveBars] = useState([30, 65, 90, 45, 80, 100, 75, 40, 85, 50, 70, 95, 35, 80, 60]);

  callStateRef.current = callState;

  const stopMedia = () => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    screenStreamRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    peerConnectionRef.current = null;
    mediaRequestRef.current = null;
    pendingIceCandidatesRef.current = [];
    offerSentForCallRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionStatus('idle');
    setNeedsAudioUnlock(false);
  };

  const emitSignal = (kind: SignalKind, signal: RTCSessionDescriptionInit | RTCIceCandidateInit) => {
    const activeCall = callStateRef.current;
    const targetUserId = activeCall.targetUser?.id;
    if (!activeCall.callId || !targetUserId) return;

    getSocket().emit('webrtc:signal', {
      callId: activeCall.callId,
      fromUserId: currentUser.id,
      targetUserId,
      kind,
      signal
    } satisfies WebRTCSignal);
  };

  const attachRemoteStream = (stream: MediaStream) => {
    remoteStreamRef.current = stream;
    // Use a fresh MediaStream object so React re-renders when the second track
    // (normally video after audio) arrives on the same underlying stream.
    setRemoteStream(new MediaStream(stream.getTracks()));
    setConnectionStatus('connected');

    window.setTimeout(() => {
      const mediaElement = callStateRef.current.type === 'video' ? remoteVideoRef.current : remoteAudioRef.current;
      if (!mediaElement) return;
      mediaElement.play().then(() => setNeedsAudioUnlock(false)).catch(() => setNeedsAudioUnlock(true));
    }, 0);
  };

  const createPeerConnection = () => {
    if (peerConnectionRef.current) return peerConnectionRef.current;
    if (typeof RTCPeerConnection === 'undefined') {
      throw new Error('Trình duyệt này không hỗ trợ WebRTC. Hãy mở bằng Safari hoặc Chrome mới nhất.');
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: getIceServers(),
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 4
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) emitSignal('ice-candidate', event.candidate.toJSON());
    };
    peerConnection.ontrack = (event) => {
      const stream = remoteStreamRef.current || event.streams[0] || new MediaStream();
      if (!stream.getTracks().some((track) => track.id === event.track.id)) stream.addTrack(event.track);
      event.track.onunmute = () => attachRemoteStream(stream);
      attachRemoteStream(stream);
    };
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') setConnectionStatus('connected');
      if (peerConnection.connectionState === 'connecting') setConnectionStatus('connecting');
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'closed') {
        setConnectionStatus('failed');
      }
    };
    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection.iceConnectionState === 'failed') {
        setConnectionStatus('failed');
        if (callStateRef.current.isInitiator && peerConnection.signalingState === 'stable') {
          peerConnection.restartIce();
          void startOffer(true);
        }
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const getLocalMedia = async (): Promise<MediaStream> => {
    if (localStreamRef.current) return localStreamRef.current;
    if (mediaRequestRef.current) return mediaRequestRef.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Thiết bị không cho phép truy cập micro/camera.');
    }

    const activeCall = callStateRef.current;
    const audioConstraints: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1
    };
    const videoConstraints: MediaTrackConstraints = {
      facingMode: 'user',
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 }
    };

    const expectedCallId = activeCall.callId;
    const request = (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: activeCall.type === 'video' ? videoConstraints : false
        });
        if (!callStateRef.current.active || callStateRef.current.callId !== expectedCallId) {
          stream.getTracks().forEach((track) => track.stop());
          throw new Error('Cuộc gọi đã kết thúc.');
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      } catch (error) {
        // If only the camera is unavailable, keep the call usable as audio-only.
        if (activeCall.type === 'video') {
          try {
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
            if (!callStateRef.current.active || callStateRef.current.callId !== expectedCallId) {
              audioOnlyStream.getTracks().forEach((track) => track.stop());
              throw new Error('Cuộc gọi đã kết thúc.');
            }
            localStreamRef.current = audioOnlyStream;
            setLocalStream(audioOnlyStream);
            setMediaError('Không mở được camera; cuộc gọi vẫn tiếp tục bằng micro.');
            return audioOnlyStream;
          } catch {
            try {
              const compatibilityStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              localStreamRef.current = compatibilityStream;
              setLocalStream(compatibilityStream);
              setMediaError('Thiết bị không nhận tuỳ chọn âm thanh nâng cao; Pinkmess đã dùng chế độ tương thích.');
              return compatibilityStream;
            } catch {
              // Fall through to the actionable permission message below.
            }
          }
        }
        throw error;
      }
    })();
    mediaRequestRef.current = request;
    try {
      return await request;
    } finally {
      if (mediaRequestRef.current === request) mediaRequestRef.current = null;
    }
  };

  const ensurePeerConnection = async () => {
    const stream = await getLocalMedia();
    const peerConnection = createPeerConnection();
    stream.getTracks().forEach((track) => {
      if (!peerConnection.getSenders().some((sender) => sender.track === track)) {
        peerConnection.addTrack(track, stream);
      }
    });
    return peerConnection;
  };

  const flushPendingIceCandidates = async (peerConnection: RTCPeerConnection) => {
    if (!peerConnection.remoteDescription) return;
    const pending = pendingIceCandidatesRef.current.splice(0);
    await Promise.all(
      pending.map((candidate) => peerConnection.addIceCandidate(candidate).catch(() => undefined))
    );
  };

  const startOffer = async (iceRestart = false) => {
    const activeCall = callStateRef.current;
    if (!activeCall.active || !activeCall.isInitiator || activeCall.direction !== 'connected' || !activeCall.callId) return;
    if (!iceRestart && offerSentForCallRef.current === activeCall.callId) return;

    try {
      setConnectionStatus('connecting');
      const peerConnection = await ensurePeerConnection();
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: activeCall.type === 'video',
        iceRestart
      });
      await peerConnection.setLocalDescription(offer);
      offerSentForCallRef.current = activeCall.callId;
      if (peerConnection.localDescription) emitSignal('offer', peerConnection.localDescription.toJSON());
    } catch (error) {
      console.error('[WebRTC] Unable to create offer:', error);
      setMediaError(error instanceof Error ? error.message : 'Không thể bật micro/camera.');
    }
  };

  const unlockRemoteAudio = () => {
    const mediaElement = callState.type === 'video' ? remoteVideoRef.current : remoteAudioRef.current;
    if (!mediaElement) return;
    mediaElement.play().then(() => setNeedsAudioUnlock(false)).catch(() => setNeedsAudioUnlock(true));
  };

  // Stop all tracks and the peer connection when the call ends or changes.
  useEffect(() => {
    if (!callState.active) {
      stopMedia();
      setMediaError(null);
      return;
    }

    setMediaError(null);
    setCallDuration(0);
    setConnectionStatus(callState.direction === 'incoming' ? 'idle' : 'connecting');
    setRemoteStream(null);
    remoteStreamRef.current = null;
    pendingIceCandidatesRef.current = [];
    offerSentForCallRef.current = null;

    if (callState.direction !== 'incoming') {
      ensurePeerConnection().catch((error) => {
        console.error('[WebRTC] Unable to access local media:', error);
        setMediaError(
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'Hãy cho phép Pinkmess dùng micro/camera trong phần quyền của trình duyệt rồi gọi lại.'
            : error instanceof Error
            ? error.message
            : 'Không thể bật micro/camera trên thiết bị này.'
        );
      });
    }

    return undefined;
    // callId/type are intentionally the lifecycle keys. Direction changes reuse
    // the same local media and peer connection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState.active, callState.callId, callState.type]);

  // The callee starts media after tapping “Nghe máy”; the caller creates the
  // offer only after the server confirms that the call was accepted.
  useEffect(() => {
    if (callState.active && callState.direction === 'connected') {
      ensurePeerConnection().catch((error) => {
        console.error('[WebRTC] Unable to prepare accepted call:', error);
        setMediaError(error instanceof Error ? error.message : 'Không thể chuẩn bị cuộc gọi.');
      });
      void startOffer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState.active, callState.callId, callState.direction]);

  // Route SDP and ICE messages to the current peer connection.
  useEffect(() => {
    const socket = getSocket();
    const handleSignal = async (payload: WebRTCSignal) => {
      const activeCall = callStateRef.current;
      if (!activeCall.active || payload.callId !== activeCall.callId || payload.targetUserId !== currentUser.id) return;

      try {
        const peerConnection = await ensurePeerConnection();
        if (payload.kind === 'offer') {
          await peerConnection.setRemoteDescription(payload.signal as RTCSessionDescriptionInit);
          await flushPendingIceCandidates(peerConnection);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          if (peerConnection.localDescription) emitSignal('answer', peerConnection.localDescription.toJSON());
          return;
        }

        if (payload.kind === 'answer') {
          await peerConnection.setRemoteDescription(payload.signal as RTCSessionDescriptionInit);
          await flushPendingIceCandidates(peerConnection);
          return;
        }

        const candidate = payload.signal as RTCIceCandidateInit;
        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(candidate).catch(() => undefined);
        } else {
          pendingIceCandidatesRef.current.push(candidate);
        }
      } catch (error) {
        console.error('[WebRTC] Signal handling failed:', error);
        setMediaError('Kết nối cuộc gọi bị gián đoạn. Hãy thử kết thúc và gọi lại.');
      }
    };

    socket.on('webrtc:signal', handleSignal);
    return () => {
      socket.off('webrtc:signal', handleSignal);
    };
    // The ref keeps the latest call state while the listener stays stable for this user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  // Attach streams after the React video/audio elements exist.
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => undefined);
    }
  }, [localStream, callState.isVideoOff]);

  useEffect(() => {
    if (!remoteStream) return;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().then(() => setNeedsAudioUnlock(false)).catch(() => setNeedsAudioUnlock(true));
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().then(() => setNeedsAudioUnlock(false)).catch(() => setNeedsAudioUnlock(true));
    }
  }, [remoteStream, callState.type, callState.remoteIsVideoOff]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !callState.isMuted;
    });
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !callState.isVideoOff;
    });
  }, [localStream, callState.isMuted, callState.isVideoOff]);

  useEffect(() => {
    if (!callState.active || callState.direction === 'incoming' || connectionStatus !== 'connected') return;
    const timer = window.setInterval(() => setCallDuration((duration) => duration + 1), 1000);
    return () => window.clearInterval(timer);
  }, [callState.active, callState.direction, connectionStatus]);

  useEffect(() => {
    if (!callState.active || callState.isMuted) return;
    const interval = window.setInterval(() => {
      setWaveBars((bars) => bars.map(() => Math.floor(20 + Math.random() * 80)));
    }, 140);
    return () => window.clearInterval(interval);
  }, [callState.active, callState.isMuted]);

  useEffect(() => {
    if (callState.active && (callState.direction === 'incoming' || callState.direction === 'outgoing')) {
      bunnyAudio.startRingtone();
    } else {
      bunnyAudio.stopRingtone();
    }
    return () => bunnyAudio.stopRingtone();
  }, [callState.active, callState.direction]);

  const stopScreenShare = async () => {
    const screenTrack = screenStreamRef.current?.getVideoTracks()[0];
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = peerConnectionRef.current?.getSenders().find((item) => item.track?.kind === 'video');
    if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
    screenTrack?.stop();
    screenStreamRef.current = null;
    if (localVideoRef.current && localStreamRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    if (callState.isScreenSharing) onToggleScreenShare();
  };

  const handleScreenShareClick = async () => {
    if (screenStreamRef.current) {
      await stopScreenShare();
      return;
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('Thiết bị không hỗ trợ chia sẻ màn hình.');
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find((item) => item.track?.kind === 'video');
      if (sender) await sender.replaceTrack(screenTrack);
      screenStreamRef.current = screenStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      if (!callState.isScreenSharing) onToggleScreenShare();
      screenTrack.onended = () => {
        void stopScreenShare();
      };
    } catch (error) {
      console.warn('[WebRTC] Screen share was cancelled:', error);
    }
  };

  if (!callState.active) return null;

  const isConnected = callState.direction === 'connected';
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainder < 10 ? '0' : ''}${remainder}`;
  };
  const statusText =
    connectionStatus === 'connected'
      ? 'Đã kết nối WebRTC trực tiếp'
      : connectionStatus === 'failed'
      ? 'Kết nối bị gián đoạn'
      : 'Đang thiết lập kết nối an toàn...';

  if (callState.direction === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md select-none">
        <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-3xl border-4 border-[#FFD6E5] bg-gradient-to-b from-[#FFF0F6] to-[#FFE4F0] p-8 text-center shadow-2xl">
          <span className="absolute left-6 top-4 text-2xl animate-bounce">💖</span>
          <span className="absolute right-6 top-6 text-2xl animate-bounce">🐰</span>
          <div className="relative mb-5">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#FF82AE] shadow-lg">
              <img src={callState.targetUser?.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'} alt="Caller" className="h-full w-full object-cover" />
            </div>
            <span className="absolute -bottom-1 -right-1 rounded-full bg-[#FF4F8B] p-2 text-xs text-white shadow-md">{callState.type === 'video' ? '📹' : '📞'}</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#4C3441]">{callState.targetUser?.name || 'Khách dễ thương'}</h3>
          <p className="mt-0.5 font-mono text-xs text-[#927D8A]">@{callState.targetUser?.bunnyId || 'bunny'}</p>
          <p className="mt-2 text-sm font-semibold text-[#FF4F8B]">Đang gọi {callState.type === 'video' ? 'video' : 'thoại'} cho bạn... 🐰💕</p>
          <div className="mt-8 flex items-center gap-6">
            <button onClick={onRejectCall} className="flex flex-col items-center gap-1.5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition hover:bg-rose-600 active:scale-95"><PhoneOff className="h-6 w-6" /></span>
              <span className="text-xs font-semibold text-[#4C3441]">Từ chối</span>
            </button>
            <button onClick={onAcceptCall} className="flex flex-col items-center gap-1.5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 active:scale-95"><Phone className="h-6 w-6" /></span>
              <span className="text-xs font-semibold text-[#4C3441]">Nghe máy</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#2D1B28]/95 text-white backdrop-blur-lg select-none">
      <div className="z-20 flex items-center justify-between gap-3 p-4 md:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-[#FF82AE] bg-[#FFE4F0]"><img src="/src/assets/images/bunny_mascot_hero_1791670247958.jpg" alt="Pinkmess" className="h-full w-full object-cover" /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-bold tracking-wide">{callState.type === 'video' ? 'Cuộc gọi video Pinkmess' : 'Cuộc gọi thoại Pinkmess'}</h4>
              <span className={`h-2 w-2 shrink-0 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-300'} animate-pulse`} />
            </div>
            <span className="text-xs text-[#FFD6E5]">{!isConnected ? `Đang đổ chuông tới @${callState.targetUser?.bunnyId || 'user'}...` : `Thời lượng: ${formatDuration(callDuration)}`}</span>
          </div>
        </div>
        <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#FFD6E5] sm:inline-flex">🔒 WebRTC P2P</span>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-3 md:p-5">
        {callState.type === 'video' ? (
          <div className="relative flex h-full w-full max-w-6xl items-center justify-center overflow-hidden rounded-3xl border-2 border-[#FF82AE]/40 bg-black/60">
            {!callState.remoteIsVideoOff && remoteStream?.getVideoTracks().length ? (
              <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" onClick={unlockRemoteAudio} />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-4"><img src={callState.targetUser?.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'} alt="Remote peer" className="h-40 w-40 rounded-full border-4 border-[#FF82AE] object-cover shadow-2xl" /><span className="absolute bottom-1 right-1 rounded-full bg-[#FF4F8B] p-2 text-xs">{callState.remoteIsVideoOff ? <VideoOff className="h-4 w-4" /> : '🌸'}</span></div>
                <h3 className="text-xl font-bold">{callState.targetUser?.name}</h3>
                <p className="mt-0.5 font-mono text-xs text-[#FF82AE]">@{callState.targetUser?.bunnyId || 'bunny'}</p>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-[#FFD6E5]">{callState.remoteIsVideoOff ? <><VideoOff className="h-4 w-4 text-[#FF82AE]" />Đối phương đang tắt camera</> : <><Radio className="h-4 w-4 animate-spin text-[#FF82AE]" />{isConnected ? 'Đang chờ luồng hình ảnh từ đối phương...' : 'Đang chờ đối phương nhấc máy...'}</>}</p>
              </div>
            )}

            {callState.remoteIsMuted && (
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white">
                <MicOff className="h-3.5 w-3.5 text-[#FF82AE]" /> Đối phương đã tắt mic
              </div>
            )}

            <div className="absolute right-3 top-3 h-28 w-40 overflow-hidden rounded-2xl border-2 border-[#FF82AE] bg-[#4C3441] shadow-2xl sm:h-36 sm:w-52 md:right-5 md:top-5 md:h-40 md:w-60">
              {callState.isVideoOff || !localStream?.getVideoTracks().length ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#4C3441] p-2 text-center text-xs text-[#FFD6E5]"><VideoOff className="mb-1 h-6 w-6 opacity-70" /><span>{localStream ? 'Camera của bạn đang tắt' : 'Đang mở camera...'}</span></div>
              ) : <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />}
              <div className="absolute bottom-1.5 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">Bạn ({currentUser.name}) {callState.isMuted && '🔇'}</div>
            </div>

            {remoteStream && needsAudioUnlock && <button onClick={unlockRemoteAudio} className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF4F8B] px-4 py-2 text-xs font-bold shadow-lg">🔊 Bật âm thanh</button>}
            <div className="pointer-events-none absolute bottom-4 left-5 flex items-center gap-1.5 text-xs font-semibold text-[#FF82AE]"><span>🐰 Pinkmess realtime</span></div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6"><div className="h-36 w-36 overflow-hidden rounded-full border-4 border-[#FF82AE] shadow-2xl"><img src={callState.targetUser?.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'} alt="Contact" className="h-full w-full object-cover" /></div><div className="absolute -bottom-2 right-2 rounded-full bg-[#FF4F8B] p-2 text-white shadow-md">{callState.remoteIsMuted ? <MicOff className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</div></div>
            <h2 className="mb-0.5 text-2xl font-bold">{callState.targetUser?.name}</h2>
            <p className="mb-2 font-mono text-xs text-[#FF82AE]">@{callState.targetUser?.bunnyId || 'user'}</p>
            <p className="mb-6 text-sm text-[#FFD6E5]">{!isConnected ? 'Đang đổ chuông...' : callState.remoteIsMuted ? 'Đối phương đang tắt mic 🔇' : statusText}</p>
            <div className="flex h-12 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-6 py-2">{waveBars.map((height, index) => <span key={index} style={{ height: `${isConnected ? height : 20}%` }} className={`w-1.5 rounded-full transition-all duration-100 ${isConnected ? 'bg-[#FF82AE]' : 'bg-white/40'}`} />)}</div>
          </div>
        )}
      </div>

      {mediaError && <div className="mx-auto mb-2 max-w-2xl rounded-xl border border-amber-300/40 bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-100">{mediaError}</div>}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <div className="z-20 flex items-center justify-center gap-3 p-5 md:gap-4 md:p-6">
        <button onClick={onToggleMute} className={`flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-md transition hover:scale-105 active:scale-95 ${callState.isMuted ? 'bg-rose-500' : 'bg-white/20 hover:bg-white/30'}`} title={callState.isMuted ? 'Bật micro' : 'Tắt micro'}>{callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}</button>
        {callState.type === 'video' && <button onClick={onToggleVideo} className={`flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-md transition hover:scale-105 active:scale-95 ${callState.isVideoOff ? 'bg-rose-500' : 'bg-white/20 hover:bg-white/30'}`} title={callState.isVideoOff ? 'Bật camera' : 'Tắt camera'}>{callState.isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}</button>}
        {callState.type === 'video' && <button onClick={handleScreenShareClick} className={`flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-md transition hover:scale-105 active:scale-95 ${callState.isScreenSharing ? 'bg-[#FF82AE]' : 'bg-white/20 hover:bg-white/30'}`} title="Chia sẻ màn hình"><Monitor className="h-6 w-6" /></button>}
        <button onClick={() => { bunnyAudio.stopRingtone(); onEndCall(); }} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500 text-white shadow-xl shadow-rose-500/30 transition hover:scale-110 hover:bg-rose-600 active:scale-95" title="Kết thúc cuộc gọi"><PhoneOff className="h-7 w-7" /></button>
      </div>
    </div>
  );
};
