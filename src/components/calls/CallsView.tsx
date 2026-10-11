import React from 'react';
import { Phone, Video } from 'lucide-react';
import { User } from '../../types';

interface CallsViewProps {
  users: User[];
  currentUser: User;
  onStartCall: (targetUser: User, type: 'audio' | 'video') => void;
}

export const CallsView: React.FC<CallsViewProps> = ({ users, currentUser, onStartCall }) => {
  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  return (
    <div className="flex-1 bg-[#FFFDFB] flex flex-col h-full overflow-y-auto select-none">
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#FFF0F6] to-[#FFE4F0] border-b border-[#F7DDE8]">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-[#FF4F8B] text-xs font-bold border border-[#FFD6E5] mb-2">
            <span>📞</span> Cuộc Gọi WebRTC
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#4C3441]">Lịch Sử & Gọi Nhanh</h1>
          <p className="text-xs md:text-sm text-[#927D8A] mt-1">
            Gọi thoại và video thời gian thực với đường truyền mã hoá, âm thanh trong trẻo và camera sắc nét.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-4xl space-y-6">
        {/* Quick Call Row */}
        <div>
          <h3 className="font-bold text-sm text-[#4C3441] mb-3">Gọi nhanh cho bạn bè:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {otherUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white p-3.5 rounded-2xl border border-[#F7DDE8] flex items-center justify-between shadow-2xs hover:border-[#FF82AE] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-[#FFD6E5]" />
                  <div className="truncate">
                    <div className="text-xs font-bold text-[#4C3441] truncate">{u.name}</div>
                    <div className="text-[10px] text-emerald-500 font-semibold">{u.status === 'online' ? '● Trực tuyến' : '● Ngoại tuyến'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onStartCall(u, 'audio')}
                    className="p-2 rounded-xl bg-[#FFF0F6] text-[#FF82AE] hover:bg-[#FFE4F0] hover:text-[#FF4F8B]"
                    title="Gọi thoại"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onStartCall(u, 'video')}
                    className="p-2 rounded-xl bg-[#FFF0F6] text-[#FF82AE] hover:bg-[#FFE4F0] hover:text-[#FF4F8B]"
                    title="Gọi video"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call History */}
        <div>
          <h3 className="font-bold text-sm text-[#4C3441] mb-3">Lịch sử cuộc gọi gần đây:</h3>
          <div className="bg-white rounded-3xl border border-[#F7DDE8] shadow-xs overflow-hidden p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0F6] text-2xl">📞</div>
            <p className="text-sm font-semibold text-[#4C3441]">Chưa có lịch sử cuộc gọi</p>
            <p className="mt-1 text-xs text-[#927D8A]">Các cuộc gọi thật của bạn sẽ xuất hiện ở đây.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
