import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  ArrowLeft,
  Info,
  Pin,
  PinOff,
  MoreVertical,
  CornerUpLeft,
  Smile,
  Trash2,
  Edit2,
  Check,
  Play,
  Pause,
  Download,
  Palette,
  Sparkles,
  Heart
} from 'lucide-react';
import { Conversation, Message, User } from '../../types';
import { ChatComposer } from './ChatComposer';
import { StickerPicker } from '../stickers/StickerPicker';
import { bunnyAudio } from '../../lib/sounds';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUser: User;
  allUsers: User[];
  onBackToList: () => void;
  onSendMessage: (payload: any) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onPinMessage: (messageId: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onStartCall: (type: 'audio' | 'video', targetUser?: User) => void;
  typingUser: string | null;
  onTyping: () => void;
  stickerPacks: any[];
  favoriteStickers: string[];
  recentStickers: string[];
  onToggleFavoriteSticker: (id: string) => void;
  onChangeWallpaper: (wallpaper: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUser,
  allUsers,
  onBackToList,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onPinMessage,
  onReactMessage,
  onStartCall,
  typingUser,
  onTyping,
  stickerPacks,
  favoriteStickers,
  recentStickers,
  onToggleFavoriteSticker,
  onChangeWallpaper
}) => {
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FFFDFB] select-none">
        <div className="relative mb-6">
          <div className="w-40 h-40 rounded-full bg-[#FFF0F6] border-4 border-[#FFD6E5] flex items-center justify-center shadow-lg overflow-hidden animate-bunny-hop">
            <img
              src="/src/assets/images/bunny_mascot_hero_1791670247958.jpg"
              alt="Bunny Sleeping"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -top-2 -right-2 text-3xl">💤</span>
        </div>
        <h3 className="text-2xl font-bold text-[#4C3441] mb-2">Chào mừng bạn đến Pinkmess! 🐰💕</h3>
        <p className="text-sm text-[#927D8A] max-w-md mb-6">
          Chọn một cuộc trò chuyện ở bên trái hoặc bắt đầu cuộc trò chuyện mới để gửi những sticker và thông điệp ngọt ngào nhất.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFE4F0] text-[#FF4F8B] text-xs font-semibold border border-[#FFD6E5]">
          <span>🌸</span>
          <span>"Pinkmess — nhắn một chút, thương một chút!"</span>
        </div>
      </div>
    );
  }

  // Get other user in direct conversation
  const otherUserId = conversation.participants.find((p) => p !== currentUser.id);
  const otherUser = allUsers.find((u) => u.id === otherUserId);
  const targetCallUser = otherUser;
  const isOnline = otherUser?.status === 'online';

  const pinnedMessages = messages.filter((m) => m.isPinned);

  // Available wallpapers
  const wallpapers = [
    { id: 'pattern-bunny', label: 'Bunny Hồng', className: 'wallpaper-pattern-bunny' },
    { id: 'strawberry-milk', label: 'Sữa Dâu', className: 'wallpaper-strawberry-milk' },
    { id: 'pastel-clouds', label: 'Mây Pastel', className: 'wallpaper-pastel-clouds' },
    { id: 'pink-hearts', label: 'Trái Tim Hồng', className: 'wallpaper-pink-hearts' },
    { id: 'sakura-garden', label: 'Vườn Sakura', className: 'wallpaper-sakura-garden' },
    { id: 'lavender-dreams', label: 'Lavender Mộng Mơ', className: 'wallpaper-lavender-dreams' },
    { id: 'bunny-moonlight', label: 'Trăng Đêm Bunny', className: 'wallpaper-bunny-moonlight' },
    { id: 'minimal-white', label: 'Trắng Tinh Khôi', className: 'wallpaper-minimal-white' }
  ];

  const currentWallpaperClass =
    wallpapers.find((w) => w.id === conversation.wallpaper)?.className || 'wallpaper-pattern-bunny';

  const reactionEmojis = ['💖', '🐰', '🥰', '🤣', '😭', '👏', '🌸'];

  const handleAudioToggle = (msgId: string, audioData: string) => {
    if (playingAudioId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(audioData.startsWith('data:') ? audioData : undefined);
      audioPlayerRef.current = audio;
      audio.onended = () => setPlayingAudioId(null);
      audio.play().catch(() => {});
      setPlayingAudioId(msgId);
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-[#FFFDFB] relative overflow-hidden select-none">
      {/* Top Bar Header */}
      <div className="px-3 sm:px-5 py-3 bg-white/95 backdrop-blur-md border-b border-[#F7DDE8] flex items-center justify-between shadow-xs z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBackToList}
            className="md:hidden w-9 h-9 rounded-2xl bg-[#FFF0F6] text-[#FF4F8B] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            aria-label="Quay lại danh sách trò chuyện"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-[#FFD6E5] shadow-xs"
            />
            {conversation.type === 'direct' && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-400' : 'bg-slate-300'
                }`}
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[#4C3441] leading-tight truncate">{conversation.name}</h3>
              {conversation.type === 'group' && (
                <span className="text-[10px] font-semibold text-[#FF4F8B] bg-[#FFE4F0] px-2 py-0.5 rounded-full border border-[#FFD6E5]">
                  {conversation.participants.length} thành viên
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[#927D8A] truncate">
              {conversation.type === 'direct'
                ? isOnline
                  ? otherUser?.statusMessage || 'Đang trực tuyến 🌸'
                  : 'Ngoại tuyến'
                : 'Nhóm chat vui vẻ cùng Bunny'}
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">
          <button
            onClick={() => onStartCall('audio', targetCallUser)}
            className="p-2.5 rounded-2xl text-[#FF82AE] hover:text-[#FF4F8B] hover:bg-[#FFF0F6] active:scale-95 transition-all cursor-pointer"
            title="Gọi thoại giọng nói HD"
          >
            <Phone className="w-5 h-5" />
          </button>

          <button
            onClick={() => onStartCall('video', targetCallUser)}
            className="p-2.5 rounded-2xl text-[#FF82AE] hover:text-[#FF4F8B] hover:bg-[#FFF0F6] active:scale-95 transition-all cursor-pointer"
            title="Gọi video WebRTC HD"
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Wallpaper picker trigger */}
          <div className="relative">
            <button
              onClick={() => setShowWallpaperMenu(!showWallpaperMenu)}
              className="p-2.5 rounded-2xl text-[#927D8A] hover:text-[#FF4F8B] hover:bg-[#FFF0F6] transition-colors"
              title="Đổi hình nền cuộc trò chuyện"
            >
              <Palette className="w-5 h-5" />
            </button>

            {showWallpaperMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#F7DDE8] p-2 z-50 animate-in fade-in duration-150">
                <div className="text-[11px] font-bold text-[#927D8A] px-2 py-1 uppercase tracking-wider">
                  Hình nền trò chuyện:
                </div>
                <div className="space-y-1 mt-1">
                  {wallpapers.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => {
                        onChangeWallpaper(wp.id);
                        setShowWallpaperMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        conversation.wallpaper === wp.id
                          ? 'bg-[#FFE4F0] text-[#FF4F8B] font-semibold'
                          : 'hover:bg-[#FFF0F6] text-[#4C3441]'
                      }`}
                    >
                      <span>{wp.label}</span>
                      {conversation.wallpaper === wp.id && <Check className="w-3.5 h-3.5 text-[#FF4F8B]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="bg-[#FFF0F6]/90 backdrop-blur-xs px-4 py-2 border-b border-[#FFD6E5] flex items-center justify-between text-xs text-[#4C3441] z-10">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-[#FF4F8B] shrink-0 fill-[#FF4F8B]" />
            <span className="font-semibold text-[#FF4F8B]">Tin nhắn đã ghim:</span>
            <span className="truncate text-[#927D8A]">
              {pinnedMessages[0].type === 'STICKER' ? '🐰 [Sticker]' : pinnedMessages[0].content}
            </span>
          </div>
          <button
            onClick={() => onPinMessage(pinnedMessages[0].id)}
            className="text-[11px] font-medium text-[#FF4F8B] hover:underline shrink-0 ml-2"
          >
            Bỏ ghim
          </button>
        </div>
      )}

      {/* Main Message Stream */}
      <div className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 ${currentWallpaperClass}`}>
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/80 backdrop-blur-xs border-2 border-[#FFD6E5] flex items-center justify-center text-3xl shadow-sm mb-3">
              🐰💌
            </div>
            <p className="text-sm font-semibold text-[#4C3441]">Chưa có tin nhắn nào ở đây cả</p>
            <p className="text-xs text-[#927D8A] mt-1">Hãy là người gửi lời nhắn hoặc sticker đầu tiên nhé!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isEditing = editingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 group relative ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Sender Avatar */}
                {!isMe && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover border border-[#FFD6E5] shrink-0 self-end mb-1 shadow-2xs"
                  />
                )}

                {/* Message Bubble Column */}
                <div className={`max-w-[75%] md:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name in group */}
                  {!isMe && conversation.type === 'group' && (
                    <span className="text-[11px] font-medium text-[#927D8A] mb-1 px-1">{msg.senderName}</span>
                  )}

                  {/* Reply Quote preview */}
                  {msg.replyToMessage && (
                    <div
                      className={`text-xs p-2 rounded-2xl mb-1 border truncate max-w-full ${
                        isMe
                          ? 'bg-[#FFE4F0] border-[#FFD6E5] text-[#4C3441]'
                          : 'bg-white border-[#F7DDE8] text-[#927D8A]'
                      }`}
                    >
                      <span className="font-semibold text-[#FF4F8B]">Trả lời {msg.replyToMessage.senderName}: </span>
                      <span>{msg.replyToMessage.type === 'STICKER' ? '🐰 [Sticker]' : msg.replyToMessage.content}</span>
                    </div>
                  )}

                  {/* Content Bubble based on Type */}
                  <div className="relative group/bubble">
                    {/* 1. STICKER TYPE */}
                    {msg.type === 'STICKER' ? (
                      <div className="p-2 transition-transform hover:scale-105 duration-200 cursor-pointer">
                        {/* Find SVG from packs or render directly */}
                        {(() => {
                          const pack = stickerPacks.find((p) => p.id === msg.stickerPackId);
                          const sticker = pack?.stickers?.find((s: any) => s.id === msg.stickerId);
                          const stickerImage = sticker?.imageUrl || msg.stickerUrl;
                          const svgHtml = sticker?.svgContent || (!stickerImage ? msg.content : '');
                          return (
                            <div
                              className="w-36 h-36 md:w-44 md:h-44 drop-shadow-md"
                            >
                              {stickerImage ? (
                                <img src={stickerImage} alt={msg.stickerName || 'Sticker'} className="w-full h-full object-contain" />
                              ) : (
                                <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : /* 2. AUDIO TYPE */
                    msg.type === 'AUDIO' ? (
                      <div
                        className={`p-3 rounded-3xl flex items-center gap-3 border shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white border-transparent'
                            : 'bg-white text-[#4C3441] border-[#F7DDE8]'
                        }`}
                      >
                        <button
                          onClick={() => handleAudioToggle(msg.id, msg.content)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                            isMe ? 'bg-white text-[#FF4F8B]' : 'bg-[#FFF0F6] text-[#FF82AE]'
                          }`}
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current translate-x-0.5" />
                          )}
                        </button>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 h-4">
                            {[40, 70, 30, 90, 60, 80, 45, 100, 50, 75].map((h, idx) => (
                              <span
                                key={idx}
                                style={{ height: `${h}%` }}
                                className={`w-1 rounded-full ${
                                  playingAudioId === msg.id
                                    ? 'bg-[#FF4F8B] animate-pulse'
                                    : isMe
                                    ? 'bg-white/80'
                                    : 'bg-[#FF82AE]'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-[10px] opacity-80">
                            Tin nhắn thoại · {msg.audioDuration || 3}s
                          </div>
                        </div>
                      </div>
                    ) : /* 3. IMAGE TYPE */
                    msg.type === 'IMAGE' ? (
                      <div className="rounded-3xl overflow-hidden border border-[#F7DDE8] shadow-sm max-w-xs">
                        <img src={msg.content} alt="Attachment" className="w-full h-auto object-cover max-h-72" />
                      </div>
                    ) : /* 4. FILE TYPE */
                    msg.type === 'FILE' ? (
                      <div
                        className={`p-3 rounded-3xl flex items-center gap-3 border ${
                          isMe
                            ? 'bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white'
                            : 'bg-white text-[#4C3441] border-[#F7DDE8]'
                        }`}
                      >
                        <div className="p-2 rounded-2xl bg-white/20">
                          <Download className="w-5 h-5" />
                        </div>
                        <div className="text-xs truncate">
                          <div className="font-semibold truncate">{msg.attachments?.[0]?.name || 'Tập tin'}</div>
                          <div className="opacity-75">Tải xuống tệp tin</div>
                        </div>
                      </div>
                    ) : (
                      /* 5. TEXT TYPE */
                      <div
                        className={`px-4 py-2.5 rounded-3xl text-sm leading-relaxed border break-words shadow-2xs ${
                          isMe
                            ? 'bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white border-transparent rounded-br-sm'
                            : 'bg-white text-[#4C3441] border-[#F7DDE8] rounded-bl-sm'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="px-2 py-1 text-xs text-[#4C3441] bg-white rounded-lg border border-[#FFD6E5] focus:outline-none"
                            />
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700"
                              >
                                Huỷ
                              </button>
                              <button
                                onClick={() => {
                                  onEditMessage(msg.id, editingContent);
                                  setEditingMessageId(null);
                                }}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#FF4F8B] text-white font-semibold"
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.content}
                            {msg.isEdited && (
                              <span className="text-[10px] ml-1.5 opacity-70 italic">(đã sửa)</span>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Quick Reaction trigger button on hover */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 ${
                        isMe ? 'right-full mr-1.5' : 'left-full ml-1.5'
                      }`}
                    >
                      <button
                        onClick={() =>
                          setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)
                        }
                        className="p-1 rounded-full bg-white shadow-md text-[#927D8A] hover:text-[#FF4F8B] border border-[#F7DDE8]"
                        title="Thả cảm xúc"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setReplyToMessage(msg)}
                        className="p-1 rounded-full bg-white shadow-md text-[#927D8A] hover:text-[#FF4F8B] border border-[#F7DDE8]"
                        title="Trả lời"
                      >
                        <CornerUpLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onPinMessage(msg.id)}
                        className={`p-1 rounded-full bg-white shadow-md border border-[#F7DDE8] ${
                          msg.isPinned ? 'text-[#FF4F8B]' : 'text-[#927D8A] hover:text-[#FF4F8B]'
                        }`}
                        title={msg.isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${msg.isPinned ? 'fill-current' : ''}`} />
                      </button>

                      {isMe && msg.type === 'TEXT' && (
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditingContent(msg.content);
                          }}
                          className="p-1 rounded-full bg-white shadow-md text-[#927D8A] hover:text-[#FF4F8B] border border-[#F7DDE8]"
                          title="Sửa tin nhắn"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isMe && (
                        <button
                          onClick={() => onDeleteMessage(msg.id)}
                          className="p-1 rounded-full bg-white shadow-md text-[#927D8A] hover:text-rose-500 border border-[#F7DDE8]"
                          title="Xoá tin nhắn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Reactions Popover Menu */}
                    {activeReactionMsgId === msg.id && (
                      <div className="absolute bottom-full left-0 mb-1 bg-white rounded-full p-1 shadow-lg border border-[#FFD6E5] flex items-center gap-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                        {reactionEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              bunnyAudio.playReactionSound();
                              onReactMessage(msg.id, emoji);
                              setActiveReactionMsgId(null);
                            }}
                            className="w-7 h-7 rounded-full hover:bg-[#FFF0F6] flex items-center justify-center text-sm hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Displayed Reactions Badges */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 px-1">
                      {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                        if (!userIds || userIds.length === 0) return null;
                        const hasReacted = userIds.includes(currentUser.id);
                        return (
                          <button
                            key={emoji}
                            onClick={() => {
                              bunnyAudio.playReactionSound();
                              onReactMessage(msg.id, emoji);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border shadow-2xs transition-transform active:scale-95 ${
                              hasReacted
                                ? 'bg-[#FFE4F0] border-[#FF82AE] text-[#FF4F8B] font-semibold'
                                : 'bg-white border-[#F7DDE8] text-[#4C3441] hover:bg-[#FFF0F6]'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-mono text-[10px]">{userIds.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Timestamp & read status */}
                  <div className="flex items-center gap-1 text-[10px] text-[#927D8A] mt-0.5 px-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <span>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Live Typing indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 text-xs text-[#927D8A] bg-white/70 backdrop-blur-xs py-1.5 px-3 rounded-full w-fit border border-[#F7DDE8] shadow-2xs animate-pulse">
            <span>🐰</span>
            <span className="font-medium text-[#FF4F8B]">{typingUser}</span>
            <span>đang gõ gì đó ngọt ngào...</span>
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-[#FF82AE] animate-bounce" />
              <span className="w-1 h-1 rounded-full bg-[#FF82AE] animate-bounce delay-100" />
              <span className="w-1 h-1 rounded-full bg-[#FF82AE] animate-bounce delay-200" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticker Picker Popup */}
      {isStickerPickerOpen && (
        <StickerPicker
          packs={stickerPacks}
          favoriteStickerIds={favoriteStickers}
          recentStickerIds={recentStickers}
          onSelectSticker={(stk) => {
            bunnyAudio.playSendSound();
            onSendMessage({
              type: 'STICKER',
              content: stk.imageUrl || stk.svgContent,
              stickerId: stk.id,
              stickerPackId: stk.packId,
              stickerName: stk.name,
              stickerUrl: stk.imageUrl,
              isAnimatedSticker: stk.isAnimated
            });
            setIsStickerPickerOpen(false);
          }}
          onToggleFavorite={onToggleFavoriteSticker}
          onClose={() => setIsStickerPickerOpen(false)}
        />
      )}

      {/* Floating Chat Composer */}
      <ChatComposer
        onSendMessage={onSendMessage}
        onToggleStickerPicker={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
        isStickerPickerOpen={isStickerPickerOpen}
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        onTyping={onTyping}
      />
    </div>
  );
};
