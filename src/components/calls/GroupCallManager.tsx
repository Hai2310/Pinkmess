import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Radio,
  UserRound,
  Video,
  VideoOff,
  Volume2
} from 'lucide-react';
import { GroupCallParticipant, GroupCallState, User } from '../../types';
import { bunnyAudio } from '../../lib/sounds';
import { getSocket } from '../../lib/socket';

export interface GroupWebRTCSignal {
  callId: string;
  fromUserId: string;
  targetUserId: string;
  kind: 'offer' | 'answer' | 'ice-candidate';
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

interface GroupCallManagerProps {
  callState: GroupCallState;
  currentUser: User;
  signal: GroupWebRTCSignal | null;
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

const fallbackIceServers: RTCIceServer[] = [
  {
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun.cloudflare.com:3478'
    ]
  }
];

const GroupRemoteMedia: React.FC<{
  participant: GroupCallParticipant;
  stream: MediaStream | undefined;
  type: 'audio' | 'video';
  onUnlockAudio: () => void;
}> = ({ participant, stream, type, onUnlockAudio }) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!mediaRef.current || !stream) return;
    mediaRef.current.srcObject = stream;
    mediaRef.current.play().catch(onUnlockAudio);
  }, [stream, onUnlockAudio]);

  if (type === 'audio') {
    return <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} autoPlay playsInline className="hidden" />;
  }

  if (!stream || participant.isVideoOff || stream.getVideoTracks().length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#4C3441] p-4 text-center">
        <div className="relative mb-2">
          <img
            src={participant.user.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'}
            alt={participant.user.name}
            className="h-20 w-20 rounded-full border-2 border-[#FF82AE] object-cover"
          />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-[#FF4F8B] p-1.5 text-white">
            {participant.isVideoOff ? <VideoOff className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" />}
          </span>
        </div>
        <span className="max-w-full truncate text-sm font-bold text-white">{participant.user.name}</span>
        <span className="mt-1 text-[11px] text-[#FFD6E5]">
          {participant.isVideoOff ? 'Đã tắt camera' : 'Đang chờ luồng hình ảnh...'}
        </span>
      </div>
    );
  }

  return (
    <video
      ref={mediaRef as React.RefObject<HTMLVideoElement>}
      autoPlay
      playsInline
      onClick={onUnlockAudio}
      className="h-full w-full object-cover"
    />
  );
};

export const GroupCallManager: React.FC<GroupCallManagerProps> = ({
  callState,
  currentUser,
  signal,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  onToggleMute,
  onToggleVideo
}) => {
  const callStateRef = useRef(callState);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localMediaRequestRef = useRef<Promise<MediaStream | null> | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const peerCreationRef = useRef<Map<string, Promise<RTCPeerConnection | null>>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const offersSentRef = useRef<Set<string>>(new Set());
  const iceServersRef = useRef<RTCIceServer[] | null>(null);
  const iceServersRequestRef = useRef<Promise<RTCIceServer[]> | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [connectionStates, setConnectionStates] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [waveBars, setWaveBars] = useState([35, 70, 45, 90, 55, 80, 40, 75, 50, 95, 60, 85]);

  callStateRef.current = callState;

  const joinedParticipants = callState.participants.filter(
    (participant) => participant.joined && participant.user.id !== currentUser.id
  );

  const getIceServers = async (): Promise<RTCIceServer[]> => {
    if (iceServersRef.current) return iceServersRef.current;
    if (iceServersRequestRef.current) return iceServersRequestRef.current;

    const request = (async () => {
      try {
        const response = await fetch(`/api/turn/ice-servers?userId=${encodeURIComponent(currentUser.id)}`, {
          credentials: 'same-origin'
        });
        if (!response.ok) throw new Error(`Cloudflare TURN HTTP ${response.status}`);
        const payload = (await response.json()) as { iceServers?: RTCIceServer[] };
        if (!Array.isArray(payload.iceServers) || payload.iceServers.length === 0) throw new Error('ICE rỗng');
        iceServersRef.current = [...fallbackIceServers, ...payload.iceServers];
        return iceServersRef.current;
      } catch (error) {
        console.warn('[Group WebRTC] TURN unavailable, using STUN fallback:', error);
        iceServersRef.current = fallbackIceServers;
        return fallbackIceServers;
      }
    })();

    iceServersRequestRef.current = request;
    try {
      return await request;
    } finally {
      if (iceServersRequestRef.current === request) iceServersRequestRef.current = null;
    }
  };

  const emitSignal = (targetUserId: string, kind: GroupWebRTCSignal['kind'], signalData: RTCSessionDescriptionInit | RTCIceCandidateInit) => {
    const activeCall = callStateRef.current;
    if (!activeCall.active || !activeCall.callId) return;
    getSocket().emit('group-webrtc:signal', {
      callId: activeCall.callId,
      fromUserId: currentUser.id,
      targetUserId,
      kind,
      signal: signalData
    } satisfies GroupWebRTCSignal);
  };

  const getLocalMedia = async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) return localStreamRef.current;
    if (localMediaRequestRef.current) return localMediaRequestRef.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError('Thiết bị chưa hỗ trợ micro/camera. Cuộc gọi vẫn có thể nghe luồng từ người khác.');
      return null;
    }

    const activeCall = callStateRef.current;
    const audio: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1
    };
    const video: MediaTrackConstraints = {
      facingMode: 'user',
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 }
    };
    const expectedCallId = activeCall.callId;
    const requests: MediaStreamConstraints[] = activeCall.type === 'video'
      ? [
          { audio, video },
          { audio: true, video: { facingMode: 'user' } },
          { audio, video: false },
          { audio: true, video: false },
          { audio: false, video: true }
        ]
      : [{ audio, video: false }, { audio: true, video: false }];

    const request = (async () => {
      let lastError: unknown = null;
      for (const constraints of requests) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (!callStateRef.current.active || callStateRef.current.callId !== expectedCallId) {
            stream.getTracks().forEach((track) => track.stop());
            return null;
          }
          localStreamRef.current = stream;
          setLocalStream(stream);
          if (activeCall.type === 'video' && stream.getVideoTracks().length === 0) {
            setMediaError('Không mở được camera; cuộc gọi nhóm vẫn tiếp tục bằng micro.');
          } else if (stream.getAudioTracks().length === 0) {
            setMediaError('Không tìm thấy micro; bạn vẫn có thể nghe mọi người trong phòng.');
          }
          return stream;
        } catch (error) {
          lastError = error;
        }
      }

      const errorName = lastError instanceof DOMException ? lastError.name : '';
      if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
        setMediaError('Hãy cho phép Pinkmess dùng micro/camera trong quyền trình duyệt rồi thử lại thiết bị.');
      } else if (errorName === 'NotFoundError' || errorName === 'OverconstrainedError') {
        setMediaError('Không tìm thấy mic/camera; phòng vẫn tiếp tục ở chế độ chỉ nghe.');
      } else {
        setMediaError('Thiết bị chưa sẵn sàng; phòng vẫn tiếp tục kết nối luồng từ người khác.');
      }
      return null;
    })();

    localMediaRequestRef.current = request;
    try {
      return await request;
    } finally {
      if (localMediaRequestRef.current === request) localMediaRequestRef.current = null;
    }
  };

  const attachRemoteStream = (userId: string, stream: MediaStream) => {
    remoteStreamsRef.current.set(userId, stream);
    setRemoteStreams((previous) => ({ ...previous, [userId]: new MediaStream(stream.getTracks()) }));
    setConnectionStatus('connected');
  };

  const flushPendingIce = async (userId: string, peerConnection: RTCPeerConnection) => {
    if (!peerConnection.remoteDescription) return;
    const pending = pendingIceRef.current.get(userId) || [];
    pendingIceRef.current.delete(userId);
    await Promise.all(pending.map((candidate) => peerConnection.addIceCandidate(candidate).catch(() => undefined)));
  };

  const createPeerConnection = async (participant: GroupCallParticipant, shouldOffer: boolean) => {
    const peerUserId = participant.user.id;
    const existing = peerConnectionsRef.current.get(peerUserId);
    if (existing && existing.connectionState !== 'closed') return existing;
    const pendingCreation = peerCreationRef.current.get(peerUserId);
    if (pendingCreation) return pendingCreation;

    const creation = (async () => {
      if (typeof RTCPeerConnection === 'undefined') throw new Error('Trình duyệt chưa hỗ trợ WebRTC.');
      const peerConnection = new RTCPeerConnection({
        iceServers: await getIceServers(),
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceCandidatePoolSize: 4
      });

      peerConnectionsRef.current.set(peerUserId, peerConnection);
      setConnectionStates((previous) => ({ ...previous, [peerUserId]: 'connecting' }));
      const stream = await getLocalMedia();
      stream?.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      const localKinds = new Set(stream?.getTracks().map((track) => track.kind) || []);
      const transceiverKinds = new Set(peerConnection.getTransceivers().map((transceiver) => transceiver.receiver.track.kind));
      if (!localKinds.has('audio') && !transceiverKinds.has('audio')) {
        peerConnection.addTransceiver('audio', { direction: 'recvonly' });
      }
      if (callStateRef.current.type === 'video' && !localKinds.has('video') && !transceiverKinds.has('video')) {
        peerConnection.addTransceiver('video', { direction: 'recvonly' });
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) emitSignal(peerUserId, 'ice-candidate', event.candidate.toJSON());
      };
      peerConnection.ontrack = (event) => {
        const remoteStream = remoteStreamsRef.current.get(peerUserId) || event.streams[0] || new MediaStream();
        if (!remoteStream.getTracks().some((track) => track.id === event.track.id)) remoteStream.addTrack(event.track);
        event.track.onunmute = () => attachRemoteStream(peerUserId, remoteStream);
        attachRemoteStream(peerUserId, remoteStream);
      };
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        setConnectionStates((previous) => ({ ...previous, [peerUserId]: state }));
        if (state === 'connected') setConnectionStatus('connected');
        if (state === 'connecting' || state === 'new') setConnectionStatus((previous) => previous === 'connected' ? previous : 'connecting');
        if (state === 'failed') setConnectionStatus('failed');
      };
      peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'failed') {
          peerConnection.restartIce();
          if (shouldOffer && peerConnection.signalingState === 'stable') {
            void sendOffer(peerUserId, peerConnection, true);
          }
        }
      };

      if (shouldOffer && !offersSentRef.current.has(peerUserId)) {
        await sendOffer(peerUserId, peerConnection, false);
      }
      return peerConnection;
    })();

    peerCreationRef.current.set(peerUserId, creation);
    try {
      return await creation;
    } finally {
      peerCreationRef.current.delete(peerUserId);
    }
  };

  const sendOffer = async (peerUserId: string, peerConnection: RTCPeerConnection, iceRestart: boolean) => {
    if (peerConnection.signalingState !== 'stable' && !iceRestart) return;
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callStateRef.current.type === 'video',
      iceRestart
    });
    await peerConnection.setLocalDescription(offer);
    offersSentRef.current.add(peerUserId);
    if (peerConnection.localDescription) emitSignal(peerUserId, 'offer', peerConnection.localDescription.toJSON());
  };

  const ensureJoinedPeers = async () => {
    if (!callStateRef.current.active || callStateRef.current.direction !== 'connected') return;
    setConnectionStatus((previous) => previous === 'connected' ? previous : 'connecting');
    await Promise.all(
      joinedParticipants.map((participant) => {
        // A deterministic initiator prevents two offers for the same pair.
        const shouldOffer = currentUser.id < participant.user.id;
        return createPeerConnection(participant, shouldOffer).catch((error) => {
          console.error('[Group WebRTC] Peer setup failed:', error);
          setMediaError(error instanceof Error ? error.message : 'Không thể kết nối một thành viên trong nhóm.');
          return null;
        });
      })
    );
  };

  const handleSignal = async (incoming: GroupWebRTCSignal) => {
    const activeCall = callStateRef.current;
    if (!activeCall.active || incoming.callId !== activeCall.callId || incoming.targetUserId !== currentUser.id) return;
    const participant = activeCall.participants.find((item) => item.user.id === incoming.fromUserId);
    if (!participant) return;

    try {
      const peerConnection = await createPeerConnection(participant, false);
      if (!peerConnection) return;
      if (incoming.kind === 'offer') {
        await peerConnection.setRemoteDescription(incoming.signal as RTCSessionDescriptionInit);
        await flushPendingIce(incoming.fromUserId, peerConnection);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        if (peerConnection.localDescription) emitSignal(incoming.fromUserId, 'answer', peerConnection.localDescription.toJSON());
        return;
      }
      if (incoming.kind === 'answer') {
        await peerConnection.setRemoteDescription(incoming.signal as RTCSessionDescriptionInit);
        await flushPendingIce(incoming.fromUserId, peerConnection);
        return;
      }
      if (peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(incoming.signal as RTCIceCandidateInit).catch(() => undefined);
      } else {
        const pending = pendingIceRef.current.get(incoming.fromUserId) || [];
        pending.push(incoming.signal as RTCIceCandidateInit);
        pendingIceRef.current.set(incoming.fromUserId, pending);
      }
    } catch (error) {
      console.error('[Group WebRTC] Signal handling failed:', error);
      setConnectionStatus('failed');
      setMediaError('Kết nối nhóm bị gián đoạn. Hãy thử rời phòng và tham gia lại nhé.');
    }
  };

  useEffect(() => {
    if (signal) void handleSignal(signal);
    // The signal object is an event snapshot; it is intentionally handled once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  useEffect(() => {
    if (!callState.active || callState.direction !== 'connected') return;
    setMediaError(null);
    void getLocalMedia().then(() => ensureJoinedPeers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState.active, callState.callId, callState.direction]);

  useEffect(() => {
    if (!callState.active || callState.direction !== 'connected') return;
    void ensureJoinedPeers();
    // New participants are the only dependency needed here; their stream refs
    // stay stable while the call is active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState.participants.map((participant) => `${participant.user.id}:${participant.joined}`).join('|')]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => { track.enabled = !callState.isMuted; });
    localStream.getVideoTracks().forEach((track) => { track.enabled = !callState.isVideoOff; });
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
    if (callState.active && callState.direction === 'incoming') bunnyAudio.startRingtone();
    else bunnyAudio.stopRingtone();
    return () => bunnyAudio.stopRingtone();
  }, [callState.active, callState.direction]);

  useEffect(() => {
    if (callState.active) return;
    peerConnectionsRef.current.forEach((peerConnection) => peerConnection.close());
    peerConnectionsRef.current.clear();
    peerCreationRef.current.clear();
    remoteStreamsRef.current.clear();
    pendingIceRef.current.clear();
    offersSentRef.current.clear();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStreams({});
    setConnectionStates({});
    setConnectionStatus('idle');
    setCallDuration(0);
    setNeedsAudioUnlock(false);
    setMediaError(null);
  }, [callState.active]);

  useEffect(() => {
    return () => {
      peerConnectionsRef.current.forEach((peerConnection) => peerConnection.close());
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (!callState.active) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainder < 10 ? '0' : ''}${remainder}`;
  };
  const unlockAudio = () => {
    const mediaElements = Array.from(document.querySelectorAll('audio, video')) as HTMLMediaElement[];
    void Promise.all(mediaElements.map((element) => element.play().catch(() => undefined))).then(() => {
      setNeedsAudioUnlock(false);
    });
  };
  const isIncoming = callState.direction === 'incoming';
  const connectedCount = callState.participants.filter((participant) => participant.joined).length;

  if (isIncoming) {
    const caller = callState.participants.find((participant) => participant.user.id === callState.hostUserId)?.user;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md select-none">
        <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-3xl border-4 border-[#FFD6E5] bg-gradient-to-b from-[#FFF0F6] to-[#FFE4F0] p-8 text-center shadow-2xl">
          <span className="absolute left-6 top-4 text-2xl animate-bounce">💖</span>
          <span className="absolute right-6 top-6 text-2xl animate-bounce">🐰</span>
          <div className="relative mb-5">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#FF82AE] shadow-lg">
              <img src={caller?.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'} alt="Caller" className="h-full w-full object-cover" />
            </div>
            <span className="absolute -bottom-1 -right-1 rounded-full bg-[#FF4F8B] p-2 text-xs text-white shadow-md">{callState.type === 'video' ? '📹' : '📞'}</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#4C3441]">{caller?.name || 'Bạn bè Pinkmess'}</h3>
          <p className="mt-2 text-sm font-semibold text-[#FF4F8B]">Mời bạn tham gia cuộc gọi nhóm {callState.type === 'video' ? 'video' : 'thoại'} 🐰💕</p>
          <p className="mt-1 text-xs text-[#927D8A]">{callState.participants.length} người được mời · tối đa 6 người để gọi mượt</p>
          <div className="mt-8 flex items-center gap-6">
            <button onClick={onRejectCall} className="flex flex-col items-center gap-1.5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition hover:bg-rose-600 active:scale-95"><PhoneOff className="h-6 w-6" /></span>
              <span className="text-xs font-semibold text-[#4C3441]">Từ chối</span>
            </button>
            <button onClick={onAcceptCall} className="flex flex-col items-center gap-1.5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 active:scale-95"><Phone className="h-6 w-6" /></span>
              <span className="text-xs font-semibold text-[#4C3441]">Tham gia</span>
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#FF82AE] bg-[#FFE4F0] text-[#FF4F8B]"><UsersIcon /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-bold tracking-wide">Cuộc gọi nhóm Pinkmess</h4>
              <span className={`h-2 w-2 shrink-0 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-300'} animate-pulse`} />
            </div>
            <span className="text-xs text-[#FFD6E5]">
              {connectionStatus === 'connected' ? `${connectedCount} người đang trong phòng · ${formatDuration(callDuration)}` : 'Đang thiết lập kết nối an toàn...'}
            </span>
          </div>
        </div>
        <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#FFD6E5] sm:inline-flex">🔒 WebRTC mesh · TURN</span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto p-3 md:p-5">
        <div className={`mx-auto grid h-full w-full max-w-6xl content-center gap-3 ${joinedParticipants.length + 1 <= 2 ? 'grid-cols-1 sm:grid-cols-2' : joinedParticipants.length + 1 <= 4 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
          <div className="relative min-h-[190px] overflow-hidden rounded-3xl border-2 border-[#FF82AE] bg-[#4C3441] shadow-2xl">
            {callState.type === 'video' && localStream?.getVideoTracks().length && !callState.isVideoOff ? (
              <video ref={(element) => { if (element && localStream) { element.srcObject = localStream; element.play().catch(() => undefined); } }} autoPlay playsInline muted className="h-full min-h-[190px] w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[190px] flex-col items-center justify-center p-4 text-center">
                <div className="relative mb-2"><img src={currentUser.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'} alt={currentUser.name} className="h-20 w-20 rounded-full border-2 border-[#FF82AE] object-cover" /><span className="absolute -bottom-1 -right-1 rounded-full bg-[#FF4F8B] p-1.5 text-xs text-white">{callState.isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}</span></div>
                <span className="text-sm font-bold">Bạn</span>
                <span className="mt-1 text-[11px] text-[#FFD6E5]">{callState.isVideoOff ? 'Camera đang tắt' : 'Camera chưa sẵn sàng'}</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold">Bạn {callState.isMuted && '🔇'}</div>
          </div>

          {joinedParticipants.map((participant) => (
            <div key={participant.user.id} className="relative min-h-[190px] overflow-hidden rounded-3xl border border-[#FF82AE]/70 bg-[#4C3441] shadow-xl">
              <GroupRemoteMedia participant={participant} stream={remoteStreams[participant.user.id]} type={callState.type} onUnlockAudio={unlockAudio} />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                <span className="max-w-[75%] truncate rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold">{participant.user.name}</span>
                <span className="rounded-full bg-black/65 p-1.5">{participant.isMuted ? <MicOff className="h-3.5 w-3.5 text-[#FF82AE]" /> : <Mic className="h-3.5 w-3.5" />}</span>
              </div>
              {connectionStates[participant.user.id] === 'failed' && <span className="absolute left-2 top-2 rounded-full bg-amber-500/80 px-2 py-1 text-[10px] font-bold">Đang thử kết nối lại…</span>}
            </div>
          ))}
        </div>

        {joinedParticipants.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4"><div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-center text-xs text-[#FFD6E5]">Đang chờ các bạn tham gia phòng… 🐰</div></div>
        )}
        {needsAudioUnlock && <button onClick={unlockAudio} className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF4F8B] px-4 py-2 text-xs font-bold shadow-lg">🔊 Bật âm thanh</button>}
        <div className="pointer-events-none absolute bottom-3 left-5 flex items-center gap-1.5 text-xs font-semibold text-[#FF82AE]"><span>🐰 Pinkmess realtime</span></div>
      </div>

      {mediaError && <div className="mx-auto mb-2 max-w-2xl rounded-xl border border-amber-300/40 bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-100">{mediaError}</div>}

      <div className="z-20 flex items-center justify-center gap-3 p-5 md:gap-4 md:p-6">
        <button onClick={onToggleMute} className={`flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-md transition hover:scale-105 active:scale-95 ${callState.isMuted ? 'bg-rose-500' : 'bg-white/20 hover:bg-white/30'}`} title={callState.isMuted ? 'Bật micro' : 'Tắt micro'}>{callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}</button>
        {callState.type === 'video' && <button onClick={onToggleVideo} className={`flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-md transition hover:scale-105 active:scale-95 ${callState.isVideoOff ? 'bg-rose-500' : 'bg-white/20 hover:bg-white/30'}`} title={callState.isVideoOff ? 'Bật camera' : 'Tắt camera'}>{callState.isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}</button>}
        <button onClick={() => { bunnyAudio.stopRingtone(); onEndCall(); }} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500 text-white shadow-xl shadow-rose-500/30 transition hover:scale-110 hover:bg-rose-600 active:scale-95" title="Rời cuộc gọi nhóm"><PhoneOff className="h-7 w-7" /></button>
      </div>
    </div>
  );
};

const UsersIcon = () => (
  <span className="flex items-center -space-x-1"><UserRound className="h-4 w-4" /><UserRound className="h-4 w-4" /></span>
);
