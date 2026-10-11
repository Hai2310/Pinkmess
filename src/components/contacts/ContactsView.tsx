import React, { useState } from 'react';
import { Search, MessageSquare, Phone, Video, UserPlus, Heart, Check, Sparkles } from 'lucide-react';
import { User } from '../../types';

interface ContactsViewProps {
  users: User[];
  currentUser: User;
  onStartChat: (targetUser: User) => void;
  onStartCall: (targetUser: User, type: 'audio' | 'video') => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  users,
  currentUser,
  onStartChat,
  onStartCall
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online'>('all');
  const [addedFriends, setAddedFriends] = useState<string[]>([]);

  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  const filtered = otherUsers.filter((u) => {
    const q = search.toLowerCase().trim().replace(/^@/, '');
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      (u.bunnyId && u.bunnyId.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filter === 'online') return u.status === 'online';
    return true;
  });

  return (
    <div className="flex-1 bg-[#FFFDFB] flex flex-col h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#FFF0F6] to-[#FFE4F0] border-b border-[#F7DDE8]">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-[#FF4F8B] text-xs font-bold border border-[#FFD6E5] mb-2">
            <span>🐰</span> Bạn Bè & Danh Bạ
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#4C3441]">Những Người Bạn Dễ Thương</h1>
          <p className="text-xs md:text-sm text-[#927D8A] mt-1">
            Kết nối, trò chuyện và cùng nhau chia sẻ những khoảnh khắc ngọt ngào với HustMess Bunny Edition!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-[#FF82AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo Tên hoặc Bunny ID (VD: linh_meo)..."
                className="w-full bg-white text-xs text-[#4C3441] placeholder:text-[#927D8A]/70 pl-10 pr-4 py-2 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#F7DDE8]">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'all' ? 'bg-[#FF82AE] text-white' : 'text-[#927D8A] hover:bg-[#FFF0F6]'
                }`}
              >
                Tất cả ({otherUsers.length})
              </button>
              <button
                onClick={() => setFilter('online')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'online' ? 'bg-[#FF82AE] text-white' : 'text-[#927D8A] hover:bg-[#FFF0F6]'
                }`}
              >
                Trực tuyến ({otherUsers.filter((u) => u.status === 'online').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Friends Cards Grid */}
      <div className="p-6 md:p-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((user) => {
            const isFriend = addedFriends.includes(user.id);
            return (
              <div
                key={user.id}
                className="bg-white rounded-3xl border border-[#F7DDE8] p-5 shadow-xs hover:shadow-md hover:border-[#FF82AE] transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FFD6E5] shadow-xs"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        user.status === 'online'
                          ? 'bg-emerald-400'
                          : user.status === 'away'
                          ? 'bg-amber-400'
                          : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-[#4C3441] truncate">{user.name}</h3>
                    <span className="text-[11px] font-mono font-bold text-[#FF4F8B] bg-[#FFE4F0] px-2 py-0.5 rounded-full border border-[#FFD6E5] inline-block my-0.5">
                      @{user.bunnyId || user.id}
                    </span>
                    <p className="text-xs text-[#927D8A] truncate">{user.email}</p>
                    <p className="text-xs text-[#FF4F8B] font-medium mt-1 truncate">
                      {user.statusMessage || 'Đang rảnh rỗi nè 🐰'}
                    </p>
                  </div>
                </div>

                {user.bio && (
                  <p className="text-xs text-[#4C3441] mt-3.5 bg-[#FFF0F6]/60 p-2.5 rounded-2xl border border-[#F7DDE8]/60 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-[#F7DDE8] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onStartChat(user)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Nhắn tin
                  </button>

                  <button
                    onClick={() => onStartCall(user, 'audio')}
                    className="p-2 rounded-xl bg-[#FFF0F6] text-[#FF82AE] hover:bg-[#FFE4F0] hover:text-[#FF4F8B] transition-colors"
                    title="Gọi thoại"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onStartCall(user, 'video')}
                    className="p-2 rounded-xl bg-[#FFF0F6] text-[#FF82AE] hover:bg-[#FFE4F0] hover:text-[#FF4F8B] transition-colors"
                    title="Gọi video"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
