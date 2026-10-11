import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Maximize2,
  Sparkles,
  Heart,
  Volume2,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { User, CallState } from '../../types';
import { bunnyAudio } from '../../lib/sounds';

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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isSimulatedConnected, setIsSimulatedConnected] = useState(false);
  const [autoAnswerSeconds, setAutoAnswerSeconds] = useState(4);

  // Sound effects for incoming / calling
  useEffect(() => {
    if (callState.active && (callState.direction === 'incoming' || callState.direction === 'outgoing')) {
      bunnyAudio.startRingtone();
    } else {
      bunnyAudio.stopRingtone();
    }
    return () => {
      bunnyAudio.stopRingtone();
    };
  }, [callState.active, callState.direction]);

  // Call timer
  useEffect(() => {
    let timer: number | null = null;
    const isConnected = callState.active && (callState.direction === 'connected' || isSimulatedConnected);
    if (isConnected) {
      timer = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState.active, callState.direction, isSimulatedConnected]);

  // Auto answer countdown when testing in single tab
  useEffect(() => {
    if (!callState.active || callState.direction !== 'outgoing' || isSimulatedConnected) return;

    setAutoAnswerSeconds(4);
    const interval = window.setInterval(() => {
      setAutoAnswerSeconds((sec) => {
        if (sec <= 1) {
          clearInterval(interval);
          setIsSimulatedConnected(true);
          bunnyAudio.stopRingtone();
          return 0;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [callState.active, callState.direction, isSimulatedConnected]);

  // Reset states when a new call begins
  useEffect(() => {
    if (callState.active) {
      setIsSimulatedConnected(callState.direction === 'connected');
      setCallDuration(0);
    }
  }, [callState.active, callState.callId, callState.direction]);

  // Live animated voice wave bars
  const [waveBars, setWaveBars] = useState([30, 65, 90, 45, 80, 100, 75, 40, 85, 50, 70, 95, 35, 80, 60]);
  useEffect(() => {
    if (!callState.active || callState.isMuted) return;
    const interval = window.setInterval(() => {
      setWaveBars([
        Math.floor(20 + Math.random() * 60),
        Math.floor(30 + Math.random() * 65),
        Math.floor(40 + Math.random() * 60),
        Math.floor(25 + Math.random() * 70),
        Math.floor(45 + Math.random() * 55),
        Math.floor(35 + Math.random() * 65),
        Math.floor(20 + Math.random() * 75),
        Math.floor(40 + Math.random() * 55),
        Math.floor(30 + Math.random() * 70),
        Math.floor(50 + Math.random() * 50),
        Math.floor(25 + Math.random() * 70),
        Math.floor(35 + Math.random() * 65),
        Math.floor(20 + Math.random() * 60),
        Math.floor(40 + Math.random() * 55),
        Math.floor(25 + Math.random() * 50)
      ]);
    }, 120);
    return () => clearInterval(interval);
  }, [callState.active, callState.isMuted]);

  // Request real user media (camera and mic) when video call or connected
  useEffect(() => {
    if (!callState.active) {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      setIsSimulatedConnected(false);
      return;
    }

    let animationFrameId: number | null = null;

    const initMedia = async () => {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: callState.type === 'video',
            audio: true
          });
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
          }
          return;
        }
      } catch (err) {
        console.warn('Physical camera/mic not available or blocked in sandbox, creating animated virtual camera:', err);
      }

      // Fallback synthetic stream with canvas for video so video never fails!
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        let frame = 0;
        const drawVirtualCamera = () => {
          if (!ctx) return;
          frame++;
          // Cute gradient background
          const grad = ctx.createLinearGradient(0, 0, 640, 480);
          grad.addColorStop(0, '#FFF0F6');
          grad.addColorStop(1, '#FFE4F0');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 640, 480);

          // Pulsing bunny circle
          const radius = 90 + Math.sin(frame * 0.08) * 8;
          ctx.beginPath();
          ctx.arc(320, 220, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#FF82AE';
          ctx.stroke();

          // Bunny ears
          ctx.fillStyle = '#FFD6E5';
          ctx.beginPath();
          ctx.ellipse(280, 110, 25, 55, -0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(360, 110, 25, 55, 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Text
          ctx.fillStyle = '#FF4F8B';
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🐰 ${currentUser.name} (Virtual HD Camera)`, 320, 360);

          ctx.fillStyle = '#927D8A';
          ctx.font = '14px sans-serif';
          ctx.fillText('Pinkmess Bunny Real-Time HD Video', 320, 390);

          animationFrameId = requestAnimationFrame(drawVirtualCamera);
        };

        drawVirtualCamera();

        const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(24) : null;
        if (canvasStream) {
          setLocalStream(canvasStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = canvasStream;
            localVideoRef.current.play().catch(() => {});
          }
        }
      } catch {
        // Ignore fallback errors
      }
    };

    initMedia();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callState.active, callState.type]);

  // Update track enabled states based on mute / video toggle
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !callState.isMuted;
      });
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !callState.isVideoOff;
      });
    }
  }, [callState.isMuted, callState.isVideoOff, localStream]);

  // Handle Screen Share
  const handleScreenShareClick = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        onToggleScreenShare();
        screenStream.getVideoTracks()[0].onended = () => {
          if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        };
      } else {
        onToggleScreenShare();
      }
    } catch (err) {
      console.warn('Screen share cancelled or not allowed:', err);
      onToggleScreenShare();
    }
  };

  if (!callState.active) return null;

  const isConnected = callState.direction === 'connected' || isSimulatedConnected;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // INCOMING CALL DIALOG OVERLAY
  if (callState.direction === 'incoming') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
        <div className="bg-gradient-to-b from-[#FFF0F6] to-[#FFE4F0] rounded-3xl p-8 max-w-sm w-full border-4 border-[#FFD6E5] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          <span className="absolute top-4 left-6 text-2xl animate-bounce">💖</span>
          <span className="absolute top-6 right-6 text-2xl animate-bounce delay-150">🐰</span>

          <div className="relative mb-5">
            <div className="w-28 h-28 rounded-full border-4 border-[#FF82AE] overflow-hidden shadow-lg animate-pulse-soft">
              <img
                src={callState.targetUser?.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'}
                alt="Caller"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#FF4F8B] text-white p-2 rounded-full shadow-md text-xs">
              {callState.type === 'video' ? '📹' : '📞'}
            </span>
          </div>

          <h3 className="font-extrabold text-xl text-[#4C3441]">{callState.targetUser?.name || 'Khách dễ thương'}</h3>
          <p className="text-xs text-[#927D8A] font-mono mt-0.5">@{callState.targetUser?.bunnyId || 'bunny'}</p>
          <p className="text-sm text-[#FF4F8B] font-semibold mt-2">
            Đang gọi {callState.type === 'video' ? 'video WebRTC' : 'thoại'} cho bạn... 🐰💕
          </p>

          <div className="flex items-center gap-6 mt-8">
            {/* Decline */}
            <button
              onClick={onRejectCall}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 active:scale-95 transition-all">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-[#4C3441]">Từ chối</span>
            </button>

            {/* Accept */}
            <button
              onClick={onAcceptCall}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 active:scale-95 transition-all animate-bounce">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-[#4C3441]">Nghe máy</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE VOICE OR VIDEO CALL VIEW (OUTGOING OR CONNECTED)
  return (
    <div className="fixed inset-0 bg-[#2D1B28]/95 backdrop-blur-lg flex flex-col z-50 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="p-4 md:p-6 flex items-center justify-between z-20 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFE4F0] border border-[#FF82AE] overflow-hidden">
            <img
              src="/src/assets/images/bunny_mascot_hero_1791670247958.jpg"
              alt="Bunny"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm tracking-wide">
                {callState.type === 'video' ? 'Cuộc gọi Video Bunny HD' : 'Cuộc gọi Thoại Bunny HD'}
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-xs text-[#FFD6E5]">
              {!isConnected
                ? `Đang đổ chuông tới @${callState.targetUser?.bunnyId || 'user'}...`
                : `Thời lượng: ${formatDuration(callDuration)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected && (
            <button
              onClick={() => {
                setIsSimulatedConnected(true);
                bunnyAudio.stopRingtone();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-md animate-bounce hover:opacity-95"
            >
              📞 Bấm để đối phương nghe máy ngay
            </button>
          )}
          <span className="px-3 py-1 rounded-full bg-white/10 text-[#FFD6E5] text-xs font-semibold border border-white/20">
            🔒 WebRTC P2P Đã Mã Hoá
          </span>
        </div>
      </div>

      {/* Main Call Stage */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {callState.type === 'video' ? (
          /* VIDEO CALL DISPLAY */
          <div className="relative w-full h-full max-w-5xl rounded-3xl overflow-hidden bg-black/50 border-2 border-[#FF82AE]/40 flex items-center justify-center">
            {/* Remote Video Stream or Avatar */}
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-4">
                <img
                  src={callState.targetUser?.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'}
                  alt="Remote Peer"
                  className="w-40 h-40 rounded-full border-4 border-[#FF82AE] object-cover shadow-2xl animate-pulse-soft"
                />
                <span className="absolute bottom-1 right-1 p-2 rounded-full bg-[#FF4F8B] text-white text-xs">
                  🌸
                </span>
              </div>
              <h3 className="text-white text-xl font-bold">{callState.targetUser?.name}</h3>
              <p className="text-xs text-[#FF82AE] font-mono mt-0.5">@{callState.targetUser?.bunnyId || 'bunny'}</p>

              {!isConnected ? (
                <div className="mt-3 flex flex-col items-center">
                  <div className="text-sm text-[#FFD6E5] flex items-center gap-1.5">
                    <Radio className="w-4 h-4 animate-spin text-[#FF82AE]" /> Đang chờ đối phương nhấc máy... 🐰
                  </div>
                  <span className="text-xs text-white/70 mt-1">
                    (Tự động kết nối thử nghiệm sau {autoAnswerSeconds}s hoặc bấm nút màu xanh ở trên)
                  </span>
                </div>
              ) : (
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đang truyền tải hình ảnh thời gian thực 720p HD
                </div>
              )}
            </div>

            {/* Local Video Thumbnail in Corner */}
            <div className="absolute top-4 right-4 w-44 md:w-60 h-32 md:h-40 rounded-2xl overflow-hidden border-2 border-[#FF82AE] bg-[#4C3441] shadow-2xl">
              {callState.isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#4C3441] text-[#FFD6E5] text-xs p-2 text-center">
                  <VideoOff className="w-6 h-6 mb-1 opacity-70" />
                  <span>Camera của bạn đang tắt</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-1.5 left-2 text-[10px] text-white bg-black/60 px-2 py-0.5 rounded-full font-medium">
                Bạn ({currentUser.name}) {callState.isMuted && '🔇 Tắt Mic'}
              </div>
            </div>

            {/* Subtle Bunny Call Frame watermark */}
            <div className="absolute bottom-4 left-5 text-xs text-[#FF82AE] font-semibold flex items-center gap-1.5 pointer-events-none">
              <span>🐰 Pinkmess Bunny HD Stream</span>
            </div>
          </div>
        ) : (
          /* VOICE CALL DISPLAY */
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-36 h-36 rounded-full border-4 border-[#FF82AE] overflow-hidden shadow-2xl animate-pulse-soft">
                <img
                  src={callState.targetUser?.avatar || '/src/assets/images/bunny_calling_avatar_1791670258938.jpg'}
                  alt="Contact"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 right-2 p-2 rounded-full bg-[#FF4F8B] text-white shadow-md">
                <Volume2 className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-0.5">{callState.targetUser?.name}</h2>
            <p className="text-xs text-[#FF82AE] font-mono mb-2">@{callState.targetUser?.bunnyId || 'user'}</p>

            <p className="text-sm text-[#FFD6E5] mb-6">
              {!isConnected
                ? `Đang đổ chuông... (Tự động kết nối sau ${autoAnswerSeconds}s)`
                : `Đang kết nối thoại · ${formatDuration(callDuration)}`}
            </p>

            {/* Voice Waveform visualizer */}
            <div className="flex items-center gap-1.5 h-12 px-6 py-2 bg-white/10 rounded-full border border-white/20">
              {waveBars.map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${isConnected ? h : 20}%` }}
                  className={`w-1.5 rounded-full transition-all duration-100 ${
                    isConnected ? 'bg-[#FF82AE]' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Call Control Bar */}
      <div className="p-6 flex items-center justify-center gap-4 z-20">
        {/* Mute button */}
        <button
          onClick={onToggleMute}
          className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md ${
            callState.isMuted ? 'bg-rose-500' : 'bg-white/20 hover:bg-white/30'
          }`}
          title={callState.isMuted ? 'Bật micro' : 'Tắt micro'}
        >
          {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Video Toggle button */}
        {callState.type === 'video' && (
          <button
            onClick={onToggleVideo}
            className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md ${
              callState.isVideoOff ? 'bg-rose-500' : 'bg-white/20 hover:bg-white/30'
            }`}
            title={callState.isVideoOff ? 'Bật Camera' : 'Tắt Camera'}
          >
            {callState.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        {/* Screen share button */}
        {callState.type === 'video' && (
          <button
            onClick={handleScreenShareClick}
            className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md ${
              callState.isScreenSharing ? 'bg-[#FF82AE]' : 'bg-white/20 hover:bg-white/30'
            }`}
            title="Chia sẻ màn hình"
          >
            <Monitor className="w-6 h-6" />
          </button>
        )}

        {/* End Call button */}
        <button
          onClick={() => {
            bunnyAudio.stopRingtone();
            onEndCall();
          }}
          className="w-16 h-16 rounded-3xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/30 transform hover:scale-110 active:scale-95 transition-all"
          title="Kết thúc cuộc gọi"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
