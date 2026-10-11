import React from 'react';
import { Bell, Heart, Sparkles, MessageCircle, PhoneIncoming, Check } from 'lucide-react';

interface NotificationsViewProps {
  onOpenStickerStore: () => void;
  onOpenMessages: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onOpenStickerStore,
  onOpenMessages
}) => {
  const notifs = [
    {
      id: 'n_1',
      title: 'Khánh Linh gửi cho bạn 1 sticker mới!',
      desc: '"Bunny Motion — Nhảy tưng tưng vui sướng 🐰"',
      time: '10 phút trước',
      icon: Sparkles,
      iconBg: 'bg-[#FFE4F0] text-[#FF4F8B]',
      action: onOpenMessages,
      actionText: 'Xem tin nhắn'
    },
    {
      id: 'n_2',
      title: 'Gói sticker mới đã cập bến!',
      desc: 'Bộ "Bunny Magic (Phép Thuật)" với 8 animation lấp lánh vừa ra mắt.',
      time: '1 giờ trước',
      icon: Heart,
      iconBg: 'bg-[#FFF0F6] text-[#FF82AE]',
      action: onOpenStickerStore,
      actionText: 'Khám phá ngay'
    },
    {
      id: 'n_3',
      title: 'Lời mời họp nhóm phòng chat:',
      desc: 'Minh Hoa mời bạn tham gia video call nhóm "Hội Thỏ Bông & Bạn Bè 🌸"',
      time: 'Hôm nay, 13:45',
      icon: PhoneIncoming,
      iconBg: 'bg-emerald-50 text-emerald-600',
      action: onOpenMessages,
      actionText: 'Vào phòng'
    }
  ];

  return (
    <div className="flex-1 bg-[#FFFDFB] flex flex-col h-full overflow-y-auto select-none">
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#FFF0F6] to-[#FFE4F0] border-b border-[#F7DDE8]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-[#FF4F8B] text-xs font-bold border border-[#FFD6E5] mb-2">
            <span>🔔</span> Trung Tâm Thông Báo
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#4C3441]">Thông Báo Mới Nhất</h1>
          <p className="text-xs md:text-sm text-[#927D8A] mt-1">
            Cập nhật tin nhắn ngọt ngào, sticker mới và cuộc gọi từ bạn bè.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-3xl space-y-3">
        {notifs.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className="bg-white p-4 rounded-3xl border border-[#F7DDE8] flex items-center justify-between gap-4 shadow-2xs hover:border-[#FF82AE] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#4C3441]">{n.title}</h4>
                  <p className="text-xs text-[#927D8A] mt-0.5">{n.desc}</p>
                  <span className="text-[10px] text-[#FF82AE] font-medium mt-1 block">{n.time}</span>
                </div>
              </div>

              <button
                onClick={n.action}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFF0F6] hover:bg-[#FFE4F0] text-[#FF4F8B] text-xs font-bold whitespace-nowrap transition-colors"
              >
                {n.actionText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
