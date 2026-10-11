import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Smile,
  Paperclip,
  Mic,
  Square,
  X,
  Image as ImageIcon,
  Check
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
    audioDuration?: number;
    attachments?: any[];
    replyToId?: string;
    replyToMessage?: any;
  }) => void;
  onToggleStickerPicker: () => void;
  isStickerPickerOpen: boolean;
  replyToMessage: Message | null;
  onCancelReply: () => void;
  onTyping: () => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onToggleStickerPicker,
  isStickerPickerOpen,
  replyToMessage,
  onCancelReply,
  onTyping
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Common kawaii emojis
  const quickEmojis = ['🐰', '💕', '🍓', '✨', '🌸', '💖', '🥰', '🥺', '🧋', '🍰', '🤍', '🎀', '💌', '🐾', '🧸', '☀️'];

  const handleSend = () => {
    if (!text.trim()) return;

    bunnyAudio.playSendSound();
    onSendMessage({
      type: 'TEXT',
      content: text.trim(),
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          bunnyAudio.playSendSound();
          onSendMessage({
            type: 'AUDIO',
            content: base64Audio,
            audioDuration: recordSeconds || 3
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported:', err);
      // Fallback simulated cute voice note
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const stopRecording = (cancel = false) => {
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
      // Fallback note
      bunnyAudio.playSendSound();
      onSendMessage({
        type: 'AUDIO',
        content: 'data:audio/mp3;base64,mock',
        audioDuration: Math.max(recordSeconds, 2)
      });
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
        <div className="flex items-end gap-2 bg-[#FFF0F6]/60 rounded-3xl p-1.5 md:p-2 border border-[#F7DDE8] focus-within:border-[#FF82AE] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FFD6E5]/80 transition-all shadow-xs">
          {/* Action buttons */}
          <div className="flex items-center gap-0.5 pb-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-2xl text-[#927D8A] hover:text-[#FF4F8B] hover:bg-[#FFE4F0] transition-colors"
              title="Đính kèm tệp / ảnh"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-2xl text-[#927D8A] hover:text-[#FF4F8B] hover:bg-[#FFE4F0] transition-colors"
              title="Emoji dễ thương"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onToggleStickerPicker}
              className={`p-2 rounded-2xl transition-all relative ${
                isStickerPickerOpen
                  ? 'bg-[#FF82AE] text-white shadow-xs'
                  : 'text-[#927D8A] hover:text-[#FF4F8B] hover:bg-[#FFE4F0]'
              }`}
              title="Mở kho Sticker Bunny World"
            >
              <span className="text-lg leading-none">🐰</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF4F8B]" />
            </button>
          </div>

          {/* Text input area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Nhắn điều dễ thương gì đó đi... 💌"
            className="flex-1 max-h-32 bg-transparent text-sm text-[#4C3441] placeholder:text-[#927D8A]/70 focus:outline-none resize-none py-2 px-2"
          />

          {/* Right action button: Voice record OR Send */}
          <div className="flex items-center gap-1 pb-1 pr-1">
            {text.trim().length === 0 ? (
              <button
                type="button"
                onClick={startRecording}
                className="p-2.5 rounded-2xl text-[#927D8A] hover:text-[#FF4F8B] hover:bg-[#FFE4F0] transition-colors"
                title="Ghi âm giọng nói"
              >
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white flex items-center justify-center shadow-md shadow-[#FF82AE]/30 hover:scale-105 active:scale-95 transition-all duration-200"
                title="Gửi tin nhắn (Enter)"
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
