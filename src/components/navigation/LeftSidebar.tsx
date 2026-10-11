import React, { useState } from 'react';
import {
  MessageCircleHeart,
  Users,
  Sparkles,
  HeartHandshake,
  PhoneCall,
  Bell,
  Settings,
  Circle,
  UserCheck,
  ChevronUp,
  LogOut
} from 'lucide-react';
import { User, UserStatus } from '../../types';

interface LeftSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onOpenSettings: () => void;
  onUpdateStatus: (status: UserStatus) => void;
  onLogout: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenSettings,
  onUpdateStatus,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'messages', label: 'Tin nhắn', icon: MessageCircleHeart, badge: null },
    { id: 'contacts', label: 'Bạn bè', icon: Users, badge: 2 },
    { id: 'stickers', label: 'Sticker', icon: Sparkles, badge: 'HOT' },
    { id: 'groups', label: 'Nhóm chat', icon: HeartHandshake, badge: null },
    { id: 'calls', label: 'Cuộc gọi', icon: PhoneCall, badge: null },
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: 3 },
    { id: 'settings', label: 'Cài đặt', icon: Settings, badge: null }
  ];

  const statusColors: Record<UserStatus, string> = {
    online: 'bg-emerald-400',
    busy: 'bg-rose-400',
    away: 'bg-amber-400',
    offline: 'bg-slate-300'
  };

  const statusLabels: Record<UserStatus, string> = {
    online: 'Trực tuyến',
    busy: 'Bận rộn',
    away: 'Vắng mặt',
    offline: 'Ngoại tuyến'
  };

  return (
    <aside className="w-20 md:w-64 bg-[#FFFDFB] border-r border-[#F7DDE8] flex flex-col justify-between shrink-0 select-none shadow-[2px_0_12px_rgba(255,130,174,0.06)] z-20">
      {/* Brand Header */}
      <div className="p-4 md:p-5 flex items-center gap-3 border-b border-[#F7DDE8]/80 bg-gradient-to-b from-[#FFF0F6]/80 to-transparent">
        <div className="relative group cursor-pointer">
          <div className="w-11 h-11 rounded-2xl bg-[#FFE4F0] border-2 border-[#FF82AE] flex items-center justify-center shadow-sm overflow-hidden transform group-hover:scale-105 transition-transform duration-200">
            <img
              src="/src/assets/images/bunny_mascot_hero_1791670247958.jpg"
              alt="Bunny Mascot"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -top-1 -right-1 text-xs">✨</span>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-lg text-[#4C3441] tracking-tight">HustMess</h1>
            <span className="text-[10px] font-semibold tracking-wider text-[#FF4F8B] bg-[#FFE4F0] px-1.5 py-0.5 rounded-full uppercase border border-[#FFD6E5]">
              Bunny
            </span>
          </div>
          <p className="text-[11px] text-[#927D8A] truncate font-medium">Nhắn một chút, thương một chút! 🐰💕</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 md:px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'settings') {
                  onOpenSettings();
                } else {
                  onSelectTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 group text-left relative ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white shadow-md shadow-[#FF82AE]/30 font-semibold'
                  : 'text-[#4C3441] hover:bg-[#FFF0F6] hover:text-[#FF4F8B]'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#FFF0F6] text-[#FF82AE] group-hover:bg-[#FFE4F0] group-hover:text-[#FF4F8B]'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="hidden md:inline truncate">{item.label}</span>

              {item.badge && (
                <span
                  className={`hidden md:inline-block ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white text-[#FF4F8B]'
                      : 'bg-[#FFE4F0] text-[#FF4F8B] border border-[#FFD6E5]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile & Switcher */}
      <div className="p-3 border-t border-[#F7DDE8] relative bg-[#FFF0F6]/40">
        {/* User Switch Popup */}
        {showUserMenu && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-2xl p-2.5 shadow-xl border border-[#F7DDE8] z-50 text-xs">
            <div className="px-2 py-1 text-[11px] font-bold text-[#927D8A] uppercase tracking-wider">
              Đổi tài khoản test:
            </div>
            <div className="space-y-1 my-1">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u.id);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                    u.id === currentUser.id
                      ? 'bg-[#FFE4F0] text-[#FF4F8B] font-semibold'
                      : 'hover:bg-[#FFF0F6] text-[#4C3441]'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover border border-[#FFD6E5]" />
                  <div className="truncate flex-1">
                    <div className="truncate flex items-center gap-1">
                      <span>{u.name}</span>
                      <span className="text-[9px] text-[#FF4F8B] font-mono">@{u.bunnyId || u.id}</span>
                    </div>
                    <div className="text-[10px] text-[#927D8A]">{u.email}</div>
                  </div>
                  {u.id === currentUser.id && <UserCheck className="w-4 h-4 text-[#FF4F8B] shrink-0" />}
                </button>
              ))}
            </div>

            <div className="border-t border-[#F7DDE8] pt-1.5 mt-1 space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold text-[#927D8A]">Trạng thái hoạt động:</div>
              {(['online', 'busy', 'away'] as UserStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    onUpdateStatus(st);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#FFF0F6] text-left text-[11px]"
                >
                  <span className={`w-2 h-2 rounded-full ${statusColors[st]}`} />
                  <span>{statusLabels[st]}</span>
                </button>
              ))}
            </div>

            {/* Logout button in popup */}
            <div className="border-t border-[#F7DDE8] pt-1.5 mt-1">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 text-left text-[11px] font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          </div>
        )}

        {/* Current user tile */}
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-[#FFF0F6] cursor-pointer transition-colors"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-2xl object-cover border-2 border-[#FFD6E5] shadow-xs"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                statusColors[currentUser.status || 'online']
              }`}
            />
          </div>
          <div className="hidden md:block flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#4C3441] truncate">{currentUser.name}</div>
            <div className="text-[11px] text-[#FF4F8B] font-mono truncate font-medium">@{currentUser.bunnyId || currentUser.id}</div>
          </div>
          <ChevronUp className="w-4 h-4 text-[#927D8A] hidden md:block shrink-0" />
        </div>
      </div>
    </aside>
  );
};
