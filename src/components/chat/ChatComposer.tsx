import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plus,
  Smile,
  Mic,
  X,
  Image as ImageIcon,
  Check,
  MapPin,
  Type
} from 'lucide-react';
import { Message, MessageType } from '../../types';
import { bunnyAudio } from '../../lib/sounds';

interface ChatComposerProps {
  onSendMessage: (payload: {
    type: MessageType;
    content: string;
    stickerId?: string;
    stickerPackId?: string;
    stickerName?: string;
    isAnimatedSticker?: boolean;
    fontFamily?: string;
    audioDuration?: number;
    audioMimeType?: string;
    attachments?: any[];
    replyToId?: string;
    replyToMessage?: any;
  }) => void;
  onToggleStickerPicker: () => void;
  isStickerPickerOpen: boolean;
  replyToMessage: Message | null;
  onCancelReply: () => void;
  onTyping: () => void;
  onRequestLocation: () => void;
  isLocationSharing: boolean;
}

const chatFonts = [
  { id: 'bunny', label: 'Bunny tròn', value: "'Fredoka', 'Arial Rounded MT Bold', sans-serif", preview: 'Xin chào 🐰' },
  { id: 'bubble', label: 'Kẹo ngọt', value: "'Baloo 2', 'Comic Sans MS', cursive", preview: 'Dễ thương 💗' },
  { id: 'storybook', label: 'Truyện cổ tích', value: "'Quicksand', 'Trebuchet MS', sans-serif", preview: 'Một câu chuyện ✨' },
  { id: 'typewriter', label: 'Máy chữ', value: "'Courier New', monospace", preview: 'Lời nhắn nhỏ 💌' },
  { id: 'handwritten', label: 'Viết tay', value: "'Patrick Hand', 'Bradley Hand', cursive", preview: 'Thương bạn 🌸' }
];

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onToggleStickerPicker,
  isStickerPickerOpen,
  replyToMessage,
  onCancelReply,
  onTyping,
  onRequestLocation,
  isLocationSharing
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const recordSecondsRef = useRef(0);
  const cancelRecordingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendLongPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const [selectedFontFamily, setSelectedFontFamily] = useState(chatFonts[0].value);
  const [showFontPicker, setShowFontPicker] = useState(false);

  // Common kawaii emojis
  const quickEmojis = ['🐰', '💕', '🍓', '✨', '🌸', '💖', '🥰', '🥺', '🧋', '🍰', '🤍', '🎀', '💌', '🐾', '🧸', '☀️'];

  const handleSend = () => {
    if (!text.trim()) return;

    bunnyAudio.playSendSound();
    onSendMessage({
      type: 'TEXT',
      content: text.trim(),
      fontFamily: selectedFontFamily,
      replyToId: replyToMessage?.id,
      replyToMessage: replyToMessage
        ? {
            id: replyToMessage.id,
            senderName: replyToMessage.senderName,
            content: replyToMessage.content,
            type: replyToMessage.type
          }
        : undefined
    });

    setText('');
    if (replyToMessage) onCancelReply();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const clearSendLongPress = () => {
    if (sendLongPressTimerRef.current !== null) {
      window.clearTimeout(sendLongPressTimerRef.current);
      sendLongPressTimerRef.current = null;
    }
  };

  const handleSendPointerDown = () => {
    if (!text.trim()) return;
    longPressTriggeredRef.current = false;
    clearSendLongPress();
    sendLongPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setShowFontPicker(true);
    }, 480);
  };

  const handleSendPointerUp = () => {
    clearSendLongPress();
    if (!longPressTriggeredRef.current) handleSend();
  };

  useEffect(() => {
    return () => {
      if (sendLongPressTimerRef.current !== null) window.clearTimeout(sendLongPressTimerRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping();

    // Auto grow height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Voice recording handlers using MediaRecorder
  const startRecording = async () => {
    if (isRecording) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      window.alert('Thiết bị hoặc trình duyệt này chưa hỗ trợ ghi âm. Bạn thử mở Pinkmess bằng Safari hoặc Chrome nhé.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/webm'
      ];
      const preferredMimeType = supportedMimeTypes.find((mimeType) =>
        typeof MediaRecorder.isTypeSupported !== 'function' || MediaRecorder.isTypeSupported(mimeType)
      );
      const mediaRecorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      cancelRecordingRef.current = false;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (cancelRecordingRef.current) {
          cancelRecordingRef.current = false;
          audioChunksRef.current = [];
          return;
        }

        // Safari records AAC/MP4 while Chromium usually records Opus/WebM.
        // Preserve the actual container so the receiver can play it too.
        const audioMimeType = mediaRecorder.mimeType || preferredMimeType || audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: audioMimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          bunnyAudio.playSendSound();
          onSendMessage({
            type: 'AUDIO',
            content: base64Audio,
            audioDuration: recordSecondsRef.current || 1,
            audioMimeType
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordSecondsRef.current = 0;
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((seconds) => {
          const nextSeconds = seconds + 1;
          recordSecondsRef.current = nextSeconds;
          return nextSeconds;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported:', err);
      window.alert('Pinkmess chưa được cấp quyền micro. Hãy cho phép Microphone rồi bấm nút 🎙️ lại nhé.');
    }
  };

  const stopRecording = (cancel = false) => {
    cancelRecordingRef.current = cancel;
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (cancel) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      cancelRecordingRef.current = false;
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      window.alert('Ảnh hoặc tệp nên nhỏ hơn 12MB để gửi ổn định nhé.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const isImg = file.type.startsWith('image/');
      bunnyAudio.playSendSound();
      onSendMessage({
        type: isImg ? 'IMAGE' : 'FILE',
        content: reader.result as string,
        attachments: [
          {
            id: `att_${Date.now()}`,
            name: file.name,
            url: reader.result as string,
            type: file.type,
            size: file.size
          }
        ]
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="p-3 md:p-4 bg-[#FFFDFB]/90 backdrop-blur-md border-t border-[#F7DDE8] relative z-10">
      {/* Reply Banner */}
      {replyToMessage && (
        <div className="mb-2 px-3 py-2 bg-[#FFF0F6] rounded-2xl border border-[#FFD6E5] flex items-center justify-between gap-3 text-xs">
          <div className="truncate">
            <span className="font-semibold text-[#FF4F8B]">Đang trả lời {replyToMessage.senderName}: </span>
            <span className="text-[#927D8A] truncate">
              {replyToMessage.type === 'STICKER' ? '🐰 [Sticker]' : replyToMessage.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-[#FFE4F0] rounded-full text-[#927D8A] hover:text-[#4C3441]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 p-2.5 bg-white rounded-2xl shadow-xl border border-[#F7DDE8] flex flex-wrap gap-1.5 w-64 z-30">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="w-8 h-8 rounded-xl hover:bg-[#FFF0F6] flex items-center justify-center text-lg hover:scale-110 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {showFontPicker && (
        <div className="absolute bottom-full right-4 mb-2 w-72 rounded-3xl border border-[#FFD6E5] bg-white p-3 shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4C3441]"><Type className="h-4 w-4 text-[#FF4F8B]" /> Chọn phông chữ</div>
            <button onClick={() => setShowFontPicker(false)} className="rounded-full p-1 text-[#927D8A] hover:bg-[#FFF0F6]" aria-label="Đóng chọn phông chữ"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {chatFonts.map((font) => (
              <button
                key={font.id}
                onClick={() => {
                  setSelectedFontFamily(font.value);
                  setShowFontPicker(false);
                }}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-left transition-all ${
                  selectedFontFamily === font.value
                    ? 'border-[#FF82AE] bg-[#FFF0F6] text-[#FF4F8B]'
                    : 'border-[#F7DDE8] text-[#4C3441] hover:border-[#FFB1CA] hover:bg-[#FFF9FC]'
                }`}
              >
                <span>
                  <span className="block text-xs font-bold">{font.label}</span>
                  <span className="block text-sm" style={{ fontFamily: font.value }}>{font.preview}</span>
                </span>
                {selectedFontFamily === font.value && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))}
          </div>
          <p className="mt-2 px-1 text-[10px] text-[#927D8A]">Giữ nút gửi khoảng nửa giây để mở lại menu này.</p>
        </div>
      )}

      {/* Main Composer Box */}
      {isRecording ? (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FFF0F6] to-[#FFE4F0] rounded-3xl border border-[#FF82AE] animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF4F8B] animate-ping" />
            <span className="text-sm font-semibold text-[#FF4F8B]">Đang ghi âm giọng nói dễ thương...</span>
            <span className="text-xs font-mono text-[#927D8A]">
              00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => stopRecording(true)}
              className="p-2 rounded-full text-[#927D8A] hover:bg-white/50"
              title="Huỷ ghi âm"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => stopRecording(false)}
              className="px-3.5 py-1.5 rounded-2xl bg-[#FF4F8B] text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-[#FF6F9F]"
            >
              <Check className="w-4 h-4" /> Gửi
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-end gap-1.5 rounded-[28px] border border-[#F7DDE8] bg-[#FFF0F6]/70 px-2 py-1.5 shadow-xs transition-all focus-within:border-[#FF82AE] focus-within:bg-white md:gap-2 md:px-3 md:py-2">
          {/* Extra actions stay hidden until the user taps +. */}
          <div className="relative flex shrink-0 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => setShowActionMenu((open) => !open)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 ${
                showActionMenu
                  ? 'bg-[#FF82AE] text-white shadow-sm'
                  : 'text-[#927D8A] hover:bg-[#FFE4F0] hover:text-[#FF4F8B]'
              }`}
              title="Mở thêm tiện ích"
              aria-label="Mở thêm tiện ích"
              aria-expanded={showActionMenu}
            >
              <Plus className="h-5 w-5" />
            </button>

            {showActionMenu && (
              <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1.5 rounded-2xl border border-[#FFD6E5] bg-white p-2 shadow-xl z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#927D8A] hover:bg-[#FFF0F6] hover:text-[#FF4F8B]"
                  title="Thêm ảnh hoặc tệp"
                  aria-label="Thêm ảnh hoặc tệp"
                >
                  <ImageIcon className="h-[18px] w-[18px]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(false);
                    onRequestLocation();
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${isLocationSharing ? 'bg-[#FF82AE] text-white shadow-xs' : 'text-[#927D8A] hover:bg-[#FFF0F6] hover:text-[#FF4F8B]'}`}
                  title={isLocationSharing ? 'Đang chia sẻ vị trí trực tiếp' : 'Xin phép chia sẻ vị trí trực tiếp với người này'}
                  aria-label="Chia sẻ vị trí"
                >
                  <MapPin className="h-[18px] w-[18px]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(false);
                    setShowEmojiPicker((open) => !open);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#927D8A] hover:bg-[#FFF0F6] hover:text-[#FF4F8B]"
                  title="Emoji dễ thương"
                  aria-label="Mở emoji"
                >
                  <Smile className="h-[18px] w-[18px]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(false);
                    onToggleStickerPicker();
                  }}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    isStickerPickerOpen
                      ? 'bg-[#FF82AE] text-white shadow-xs'
                      : 'text-[#927D8A] hover:text-[#FF4F8B] hover:bg-[#FFF0F6]'
                  }`}
                  title="Mở kho Sticker Bunny World"
                  aria-label="Mở kho sticker"
                >
                  <span className="text-base leading-none">🐰</span>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF4F8B]" />
                </button>
              </div>
            )}
          </div>

          {/* Text input area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Nhắn điều dễ thương gì đó đi... 💌"
            style={{ fontFamily: selectedFontFamily }}
            className="pinkmess-composer-input min-w-0 flex-1 max-h-28 min-h-9 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm leading-5 text-[#4C3441] placeholder:text-[#927D8A]/70 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
          />

          {/* Right action button: Voice record OR Send */}
          <div className="flex shrink-0 items-center gap-1 pr-0.5">
            {text.trim().length === 0 ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#927D8A] transition-colors hover:bg-[#FFE4F0] hover:text-[#FF4F8B] active:scale-95"
                title="Bấm để bắt đầu ghi âm"
                aria-label="Bấm để bắt đầu ghi âm"
              >
                <Mic className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onPointerDown={handleSendPointerDown}
                onPointerUp={handleSendPointerUp}
                onPointerCancel={clearSendLongPress}
                onPointerLeave={clearSendLongPress}
                onContextMenu={(event) => event.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white shadow-md shadow-[#FF82AE]/30 transition-all duration-200 hover:scale-105 active:scale-95"
                title="Chạm để gửi · Giữ để chọn phông chữ"
              >
                <Send className="w-4 h-4 translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
