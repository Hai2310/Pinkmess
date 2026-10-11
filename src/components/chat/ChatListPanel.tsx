import React, { useState } from 'react';
import { Search, Plus, Pin, BellOff, Heart, MessageCirclePlus, Sparkles } from 'lucide-react';
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
    <div className="w-80 md:w-88 bg-[#FFFDFB] border-r border-[#F7DDE8] flex flex-col h-full shrink-0 relative select-none">
      {/* Header & Search */}
      <div className="p-4 border-b border-[#F7DDE8]/80 bg-gradient-to-b from-[#FFF0F6]/40 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#4C3441] tracking-tight">Trò chuyện</h2>
            <span className="text-sm">🐰</span>
          </div>
          <button
            onClick={onNewChat}
            className="w-9 h-9 rounded-2xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white flex items-center justify-center shadow-md shadow-[#FF82AE]/30 hover:scale-105 active:scale-95 transition-all duration-200"
            title="Tạo cuộc trò chuyện mới"
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
            placeholder="Tìm ai đó để trò chuyện nè... 🐰"
            className="w-full bg-[#FFF0F6]/70 hover:bg-[#FFF0F6] focus:bg-white text-sm text-[#4C3441] placeholder:text-[#927D8A]/70 pl-10 pr-4 py-2.5 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none focus:ring-2 focus:ring-[#FFD6E5] transition-all"
          />
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
                  ? 'bg-[#FF82AE] text-white font-semibold shadow-xs'
                  : 'bg-[#FFF0F6] text-[#927D8A] hover:text-[#4C3441] hover:bg-[#FFE4F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFF0F6] to-[#FFE4F0]/60 border-[#FF82AE] shadow-sm'
                    : 'bg-transparent hover:bg-[#FFF0F6]/60 border-transparent hover:border-[#F7DDE8]'
                }`}
              >
                {/* Avatar with online bubble */}
                <div className="relative shrink-0">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#F7DDE8] shadow-xs"
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
                    <span className={`text-sm truncate font-medium ${isActive ? 'text-[#FF4F8B] font-bold' : 'text-[#4C3441]'}`}>
                      {c.name}
                    </span>
                    <span className="text-[11px] text-[#927D8A] shrink-0 ml-2">
                      {c.lastMessage
                        ? new Date(c.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-[#927D8A] truncate flex-1">
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
