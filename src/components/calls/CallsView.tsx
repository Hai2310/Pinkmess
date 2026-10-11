import React from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Sparkles } from 'lucide-react';
import { User } from '../../types';

interface CallsViewProps {
  users: User[];
  currentUser: User;
  onStartCall: (targetUser: User, type: 'audio' | 'video') => void;
}

export const CallsView: React.FC<CallsViewProps> = ({ users, currentUser, onStartCall }) => {
  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  const sampleCallHistory = [
    {
      id: 'call_1',
      user: otherUsers[0] || currentUser,
      type: 'video',
      direction: 'incoming',
      timestamp: 'Hôm nay, 14:20',
      duration: '12:45',
      status: 'completed'
    },
    {
      id: 'call_2',
      user: otherUsers[1] || currentUser,
      type: 'audio',
      direction: 'outgoing',
      timestamp: 'Hôm nay, 10:15',
      duration: '05:30',
      status: 'completed'
    },
    {
      id: 'call_3',
      user: otherUsers[2] || currentUser,
      type: 'video',
      direction: 'incoming',
      timestamp: 'Hôm qua, 21:05',
      duration: '00:00',
      status: 'missed'
    }
  ];

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
          <div className="bg-white rounded-3xl border border-[#F7DDE8] divide-y divide-[#F7DDE8]/80 shadow-xs overflow-hidden">
            {sampleCallHistory.map((h) => (
              <div key={h.id} className="p-4 flex items-center justify-between hover:bg-[#FFF0F6]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={h.user.avatar} alt={h.user.name} className="w-11 h-11 rounded-2xl object-cover border border-[#FFD6E5]" />
                  <div>
                    <div className="text-xs font-bold text-[#4C3441]">{h.user.name}</div>
                    <div className="text-[11px] text-[#927D8A] flex items-center gap-1.5 mt-0.5">
                      {h.status === 'missed' ? (
                        <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                      ) : h.direction === 'incoming' ? (
                        <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <PhoneOutgoing className="w-3.5 h-3.5 text-[#FF82AE]" />
                      )}
                      <span>{h.status === 'missed' ? 'Cuộc gọi nhỡ' : `${h.type === 'video' ? 'Video' : 'Thoại'} (${h.duration})`}</span>
                      <span>·</span>
                      <span>{h.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartCall(h.user, h.type as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#FFF0F6] hover:bg-[#FFE4F0] text-[#FF4F8B] text-xs font-bold flex items-center gap-1"
                  >
                    {h.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />} Gọi lại
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
