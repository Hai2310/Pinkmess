import React, { useState } from 'react';
import { X, User as UserIcon, Palette, Volume2, ShieldCheck, RefreshCw, Check, Sparkles, LogOut, AtSign } from 'lucide-react';
import { User } from '../../types';

interface SettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateUser: (updates: Partial<User>) => void;
  onResetDemo: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onClose,
  onUpdateUser,
  onResetDemo,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'sound' | 'security'>('profile');
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState(currentUser.themePreference || 'light-pink');

  const handleSaveProfile = () => {
    onUpdateUser({
      name: displayName,
      statusMessage,
      bio,
      themePreference: theme as any
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-2 border-[#FFD6E5] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F7DDE8]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-bold text-lg text-[#4C3441]">Cài Đặt Pinkmess</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#FFF0F6] text-[#927D8A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Left Tabs */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden py-3 gap-4">
          {/* Tabs */}
          <div className="w-full md:w-44 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-[#F7DDE8] pb-2 md:pb-0 pr-0 md:pr-3 shrink-0">
            {[
              { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserIcon },
              { id: 'appearance', label: 'Giao diện & Chủ đề', icon: Palette },
              { id: 'sound', label: 'Âm thanh & Chuông', icon: Volume2 },
              { id: 'security', label: 'Hệ thống & Dữ liệu', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-[#FFE4F0] text-[#FF4F8B]'
                      : 'text-[#4C3441] hover:bg-[#FFF0F6]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#FF82AE]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panel */}
          <div className="flex-1 overflow-y-auto px-1 space-y-4">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFD6E5] shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#4C3441]">{currentUser.name}</h4>
                    <span className="text-[11px] font-mono font-bold text-[#FF4F8B] bg-[#FFE4F0] px-2 py-0.5 rounded-full border border-[#FFD6E5] inline-block my-0.5">
                      @{currentUser.bunnyId || currentUser.id}
                    </span>
                    <p className="text-xs text-[#927D8A]">{currentUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4C3441] mb-1">Tên hiển thị:</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4C3441] mb-1">Trạng thái cảm xúc:</label>
                  <input
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="VD: Đang ăn dâu tây ngọt lịm 🍓"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4C3441] mb-1">Tiểu sử (Bio):</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Giới thiệu đôi nét về bản thân bạn..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#4C3441]">Chủ đề màu sắc (Theme):</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'light-pink', label: 'Hồng Bunny Ngọt Ngào', color: '#FF82AE' },
                    { id: 'lavender-dream', label: 'Lavender Mộng Mơ', color: '#E9D5FF' },
                    { id: 'minimal-pink', label: 'Minimal Pink Tinh Tế', color: '#FFD6E5' },
                    { id: 'midnight-bunny', label: 'Midnight Bunny Đêm', color: '#4C3441' }
                  ].map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        theme === t.id
                          ? 'border-[#FF82AE] bg-[#FFF0F6] shadow-xs'
                          : 'border-[#F7DDE8] hover:bg-[#FFF0F6]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="text-xs font-medium text-[#4C3441]">{t.label}</span>
                      </div>
                      {theme === t.id && <Check className="w-4 h-4 text-[#FF4F8B]" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sound' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF0F6] border border-[#F7DDE8]">
                  <div>
                    <h5 className="font-bold text-xs text-[#4C3441]">Hiệu ứng âm thanh ngọt ngào</h5>
                    <p className="text-[11px] text-[#927D8A]">Phát âm pop và chuông harp khi gửi/nhận tin</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="accent-[#FF4F8B] w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#FFF0F6] border border-[#FFD6E5]">
                  <h5 className="font-bold text-xs text-[#FF4F8B] flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Xoá dữ liệu trò chuyện
                  </h5>
                  <p className="text-[11px] text-[#927D8A] mt-1 leading-relaxed">
                    Xoá các cuộc trò chuyện và sticker tự tạo trên máy chủ của Pinkmess. Tài khoản và hồ sơ của bạn vẫn được giữ lại.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xoá dữ liệu trò chuyện của Pinkmess không?')) {
                        onResetDemo();
                        onClose();
                      }
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-[#FF4F8B] text-white text-xs font-bold hover:bg-[#FF6F9F]"
                  >
                    Xoá dữ liệu chat
                  </button>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <h5 className="font-bold text-xs text-rose-600 flex items-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất khỏi tài khoản
                  </h5>
                  <p className="text-[11px] text-[#927D8A] mt-1 leading-relaxed">
                    Bạn sẽ quay trở lại màn hình đăng nhập và có thể chuyển đổi tài khoản bất cứ lúc nào.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
                        onLogout();
                        onClose();
                      }
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
                  >
                    Đăng xuất tài khoản
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#F7DDE8] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                onLogout();
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-[#927D8A] hover:bg-[#FFF0F6]">
              Đóng
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white text-xs font-bold shadow-md shadow-[#FF82AE]/30 hover:opacity-95"
            >
              Lưu thay đổi 🐰
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
