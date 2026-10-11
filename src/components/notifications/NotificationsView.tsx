import React from 'react';
import { Heart, PhoneCall, Sparkles, X } from 'lucide-react';
import { MissedCallRequest } from '../../types';

interface NotificationsViewProps {
  onOpenStickerStore: () => void;
  onOpenMessages: () => void;
  missedCalls?: MissedCallRequest[];
  onCallBack?: (request: MissedCallRequest) => void;
  onDismissCall?: (request: MissedCallRequest) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onOpenStickerStore,
  onOpenMessages,
  missedCalls = [],
  onCallBack,
  onDismissCall
}) => {
  const notifs = [
    {
      id: 'n_2',
      title: 'Kho sticker Pinkmess đã sẵn sàng!',
      desc: 'Khám phá các bộ sticker cute, hài hước và GIF động mới nhất.',
      time: 'Mới cập nhật',
      icon: Heart,
      iconBg: 'bg-[#FFF0F6] text-[#FF82AE]',
      action: onOpenStickerStore,
      actionText: 'Khám phá ngay'
    },
    {
      id: 'n_3',
      title: 'Tin nhắn realtime đã bật',
      desc: 'Mở một cuộc trò chuyện để nhắn tin, gửi ảnh và gọi trực tiếp với bạn bè online.',
      time: 'Pinkmess realtime',
      icon: Sparkles,
      iconBg: 'bg-[#FFE4F0] text-[#FF4F8B]',
      action: onOpenMessages,
      actionText: 'Mở tin nhắn'
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
        {missedCalls.map((request) => {
          const callerName = request.fromUser?.name || 'Bạn Pinkmess';
          const time = new Date(request.createdAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
          return (
            <div
              key={request.id}
              className="bg-gradient-to-r from-[#FFF0F6] to-white p-4 rounded-3xl border border-[#FF9FC3] flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={request.fromUser?.avatar}
                    alt={callerName}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#FFD0E1]"
                  />
                  <span className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-[#FF4F8B] text-white flex items-center justify-center border-2 border-white">
                    <PhoneCall className="w-3 h-3" />
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-[#4C3441] truncate">{callerName} gọi bạn nè 💗</h4>
                  <p className="text-xs text-[#927D8A] mt-0.5">
                    Cuộc gọi {request.type === 'video' ? 'video' : 'thoại'} • {time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onCallBack?.(request)}
                  className="px-3.5 py-2 rounded-xl bg-[#FF4F8B] text-white text-xs font-bold hover:bg-[#F23C7C] transition-colors"
                >
                  Gọi lại
                </button>
                <button
                  aria-label="Đánh dấu đã xem"
                  onClick={() => onDismissCall?.(request)}
                  className="w-8 h-8 rounded-xl bg-white text-[#B99AA9] hover:text-[#FF4F8B] border border-[#F7DDE8] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

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
