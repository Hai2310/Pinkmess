import React, { useState } from 'react';
import { Search, Plus, Pin, BellOff, MessageCircleHeart, SlidersHorizontal } from 'lucide-react';
import { Conversation, User } from '../../types';

interface ChatListPanelProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  users: User[];
  currentUserId: string;
}

export const ChatListPanel: React.FC<ChatListPanelProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  users,
  currentUserId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'group' | 'favorite'>('all');

  const filtered = conversations.filter((c) => {
    const q = searchTerm.toLowerCase().trim().replace(/^@/, '');
    if (q) {
      const otherParticipant = users.find((u) => c.participants.includes(u.id) && u.id !== currentUserId);
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        (otherParticipant && (
          otherParticipant.name.toLowerCase().includes(q) ||
          (otherParticipant.bunnyId && otherParticipant.bunnyId.toLowerCase().includes(q))
        ));
      if (!matchesSearch) return false;
    }

    if (filter === 'unread') return (c.unreadCount || 0) > 0;
    if (filter === 'group') return c.type === 'group';
    if (filter === 'favorite') return c.isPinned;
    return true;
  });

  return (
    <div className="w-full md:w-[360px] lg:w-[390px] bg-[#FFFDFB] md:border-r border-[#F7DDE8] flex flex-col h-full min-h-0 shrink-0 relative select-none">
      {/* Header & Search */}
      <div className="px-4 pt-4 pb-3 border-b border-[#F7DDE8]/80 bg-gradient-to-b from-[#FFF0F6]/70 via-[#FFFDFB] to-transparent">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF82AE] to-[#FF4F8B] text-white flex items-center justify-center shadow-sm shadow-[#FF82AE]/30">
                <MessageCircleHeart className="w-4 h-4" />
              </div>
              <span className="md:hidden text-xs font-bold uppercase tracking-[0.18em] text-[#FF4F8B]">Pinkmess</span>
            </div>
            <h2 className="text-[23px] font-black text-[#4C3441] tracking-tight">Tin nhắn</h2>
            <p className="text-xs text-[#927D8A] mt-0.5">Những cuộc trò chuyện ngọt ngào của bạn</p>
          </div>
          <button
            onClick={onNewChat}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF82AE] to-[#FF4F8B] text-white flex items-center justify-center shadow-lg shadow-[#FF82AE]/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            title="Tạo cuộc trò chuyện mới"
            aria-label="Tạo cuộc trò chuyện mới"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#927D8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm người, nhóm hoặc @bunny_id..."
            className="w-full bg-white/80 hover:bg-white focus:bg-white text-sm text-[#4C3441] placeholder:text-[#927D8A]/70 pl-10 pr-10 py-3 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none focus:ring-4 focus:ring-[#FFD6E5]/60 transition-all shadow-[0_6px_18px_rgba(255,130,174,0.06)]"
          />
          <SlidersHorizontal className="w-4 h-4 text-[#FF82AE] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'unread', label: 'Chưa đọc' },
            { id: 'group', label: 'Nhóm' },
            { id: 'favorite', label: 'Yêu thích' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-[#FF4F8B] text-white font-semibold shadow-sm shadow-[#FF82AE]/20'
                  : 'bg-white text-[#927D8A] border border-[#F7DDE8] hover:text-[#4C3441] hover:bg-[#FFF0F6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#FFF0F6] flex items-center justify-center text-2xl">
              🐰
            </div>
            <p className="text-sm font-semibold text-[#4C3441]">Chưa có cuộc trò chuyện nào</p>
            <p className="text-xs text-[#927D8A] mt-1">Bấm nút (+) ở trên để bắt đầu nhắn điều dễ thương nhé!</p>
          </div>
        ) : (
          filtered.map((c) => {
            const isActive = c.id === activeConversationId;
            // Check if direct conversation participant is online
            const otherUserId = c.participants.find((p) => p !== currentUserId);
            const otherUser = users.find((u) => u.id === otherUserId);
            const isOnline = otherUser?.status === 'online';

            return (
              <button
                type="button"
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                aria-label={`Mở cuộc trò chuyện ${c.name}`}
                className={`w-full text-left flex items-center gap-3 p-3.5 rounded-[22px] cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFF0F6] to-[#FFE4F0]/70 border-[#FF82AE] shadow-[0_8px_22px_rgba(255,130,174,0.14)]'
                    : 'bg-white/70 hover:bg-[#FFF0F6]/70 border-transparent hover:border-[#F7DDE8] shadow-[0_4px_16px_rgba(76,52,65,0.03)]'
                }`}
              >
                {/* Avatar with online bubble */}
                <div className="relative shrink-0">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-12 h-12 rounded-[18px] object-cover border border-[#F7DDE8] shadow-sm"
                  />
                  {c.type === 'direct' && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        isOnline ? 'bg-emerald-400' : 'bg-slate-300'
                      }`}
                    />
                  )}
                  {c.type === 'group' && (
                    <span className="absolute -bottom-1 -right-1 bg-[#FFE4F0] text-[#FF4F8B] text-[9px] font-bold px-1 rounded-full border border-[#FFD6E5]">
                      GP
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[13px] truncate font-semibold ${isActive ? 'text-[#FF4F8B]' : 'text-[#4C3441]'}`}>
                      {c.name}
                    </span>
                    <span className="text-[11px] text-[#927D8A] shrink-0 ml-2">
                      {c.lastMessage
                        ? new Date(c.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-[#927D8A] truncate flex-1 leading-5">
                      {c.lastMessage ? (
                        <span>
                          {c.type === 'group' && <span className="font-medium text-[#4C3441]">{c.lastMessage.senderName}: </span>}
                          {c.lastMessage.type === 'STICKER' ? '🐰 [Sticker tình cảm]' : c.lastMessage.text}
                        </span>
                      ) : (
                        'Bắt đầu nhắn tin ngay nè...'
                      )}
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      {c.isPinned && <Pin className="w-3.5 h-3.5 text-[#FF82AE] fill-[#FF82AE]" />}
                      {c.isMuted && <BellOff className="w-3.5 h-3.5 text-[#927D8A]" />}
                      {c.unreadCount && c.unreadCount > 0 ? (
                        <span className="w-4.5 h-4.5 rounded-full bg-[#FF4F8B] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {c.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
