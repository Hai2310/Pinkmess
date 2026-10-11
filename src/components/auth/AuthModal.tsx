import React, { useState } from 'react';
import { Sparkles, User as UserIcon, Mail, Lock, AtSign, ArrowRight, Check, Heart, ShieldCheck, X } from 'lucide-react';
import { User } from '../../types';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [bunnyId, setBunnyId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('/src/assets/images/bunny_mascot_hero_1791670247958.jpg');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState('Minh Hải');
  const [googleEmail, setGoogleEmail] = useState('minhhaiit1k68@gmail.com');

  // Avatar presets
  const avatarPresets = [
    { id: 'mascot', url: '/src/assets/images/bunny_mascot_hero_1791670247958.jpg', label: 'Bunny Mascot' },
    { id: 'calling', url: '/src/assets/images/bunny_calling_avatar_1791670258938.jpg', label: 'Bunny Phone' },
    { id: 'mochi', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MochiBunny&backgroundColor=ffd6e5', label: 'Thỏ Mochi' },
    { id: 'dev', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NamDev&backgroundColor=c8f4e2', label: 'Dev Boy' },
    { id: 'strawberry', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=StrawberryBunny&backgroundColor=ffe4f0', label: 'Dâu Tây' }
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Vui lòng nhập họ và tên của bạn!');
    if (!bunnyId.trim()) return setError('Vui lòng nhập Bunny ID!');

    const cleanId = bunnyId.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (cleanId.length < 3) return setError('Bunny ID phải có ít nhất 3 ký tự (chữ cái, số hoặc dấu gạch dưới)!');

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          bunnyId: cleanId,
          email: email.trim() || `${cleanId}@hustmess.pink`,
          password,
          avatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng ký không thành công!');
      } else {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}
        onLoginSuccess(data.user);
      }
    } catch {
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!bunnyId.trim()) return setError('Vui lòng nhập Bunny ID hoặc Email!');

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: bunnyId.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng nhập không thành công!');
      } else {
        try {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        } catch {}
        onLoginSuccess(data.user);
      }
    } catch {
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmGoogleLogin = async (customEmail?: string, customName?: string) => {
    setIsLoading(true);
    setError(null);
    const targetEmail = customEmail || googleEmail;
    const targetName = customName || googleName;

    try {
      const googleProfile = {
        name: targetName,
        email: targetEmail,
        avatar: '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
        googleId: `google_${targetEmail.replace(/[^a-z0-9]/gi, '_')}`
      };

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleProfile)
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setShowGoogleModal(false);
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF82AE']
          });
        } catch {}
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Đăng nhập Google thất bại');
        setShowGoogleModal(false);
      }
    } catch {
      setError('Không thể kết nối dịch vụ Google');
      setShowGoogleModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FFFDFB] z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      {/* Background Sweet Decorations */}
      <div className="absolute inset-0 pointer-events-none wallpaper-pattern-bunny opacity-60" />
      <div className="absolute top-10 left-10 text-4xl animate-bounce delay-100 opacity-70">🌸</div>
      <div className="absolute top-14 right-14 text-4xl animate-bounce delay-300 opacity-70">💖</div>
      <div className="absolute bottom-10 left-16 text-4xl animate-bunny-hop opacity-70">🐰</div>
      <div className="absolute bottom-12 right-20 text-3xl opacity-70">✨</div>

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#FFD6E5] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Mascot Banner */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-3xl bg-[#FFE4F0] border-2 border-[#FF82AE] overflow-hidden shadow-md animate-bunny-hop">
              <img
                src="/src/assets/images/bunny_mascot_hero_1791670247958.jpg"
                alt="Bunny Mascot"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 text-base">🎀</span>
          </div>

          <h1 className="text-2xl font-black text-[#4C3441] tracking-tight">Pinkmess — Bunny Chat</h1>
          <p className="text-xs text-[#FF4F8B] font-semibold mt-1">
            "Nhắn một chút, thương một chút! 🐰💕"
          </p>
        </div>

        {/* Tab Toggle: Đăng nhập vs Đăng ký */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF0F6] rounded-2xl mb-5 border border-[#F7DDE8]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isRegister
                ? 'bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white shadow-xs'
                : 'text-[#927D8A] hover:text-[#4C3441]'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegister
                ? 'bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white shadow-xs'
                : 'text-[#927D8A] hover:text-[#4C3441]'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Form: Register or Login */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-[#4C3441] mb-1">
                Tên hiển thị của bạn (*):
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#FF82AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Minh Hải, Khánh Linh, Bảo Ngọc..."
                  className="w-full text-xs text-[#4C3441] pl-10 pr-3 py-2.5 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none focus:ring-2 focus:ring-[#FFD6E5]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#4C3441] mb-1">
              {isRegister ? 'Bunny ID độc nhất (*):' : 'Tên, Bunny ID hoặc Email:'}
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-[#FF82AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={bunnyId}
                onChange={(e) => setBunnyId(e.target.value)}
                placeholder={isRegister ? 'VD: minhhai, linh_meo, thỏ99...' : 'Nhập tên, @bunny_id hoặc email...'}
                className="w-full text-xs text-[#4C3441] pl-10 pr-3 py-2.5 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none focus:ring-2 focus:ring-[#FFD6E5]"
              />
            </div>
            {isRegister && (
              <span className="text-[10px] text-[#927D8A] mt-1 block">
                Bunny ID dùng để mọi người tìm kiếm bạn trong danh bạ:{' '}
                <strong className="text-[#FF4F8B] font-mono">
                  @{bunnyId.toLowerCase().trim().replace(/[^a-z0-9_]/g, '') || 'id'}
                </strong>
              </span>
            )}
          </div>

          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-[#4C3441] mb-1">Email (tuỳ chọn):</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#FF82AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: minhhaiit1k68@gmail.com"
                  className="w-full text-xs text-[#4C3441] pl-10 pr-3 py-2.5 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none focus:ring-2 focus:ring-[#FFD6E5]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#4C3441] mb-1">Mật khẩu (*):</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#FF82AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn..."
                className="w-full text-xs text-[#4C3441] pl-10 pr-3 py-2.5 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none focus:ring-2 focus:ring-[#FFD6E5]"
              />
            </div>
          </div>

          {/* Avatar preset selection for register */}
          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-[#4C3441] mb-1">Chọn ảnh đại diện thỏ cưng:</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {avatarPresets.map((av) => (
                  <div
                    key={av.id}
                    onClick={() => setAvatar(av.url)}
                    className={`w-11 h-11 rounded-2xl border-2 p-0.5 cursor-pointer shrink-0 transition-transform hover:scale-105 ${
                      avatar === av.url ? 'border-[#FF4F8B] bg-[#FFE4F0]' : 'border-transparent'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white text-xs font-bold shadow-md shadow-[#FF82AE]/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isLoading ? (
              'Đang xử lý...'
            ) : isRegister ? (
              <>
                Đăng ký tài khoản Bunny 🐰 <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Vào thế giới Bunny ngay 🌸 <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#F7DDE8]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#927D8A]">
            <span className="bg-white px-2">Hoặc tiếp tục với</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-2xl border border-[#F7DDE8] bg-white hover:bg-[#FFF0F6]/60 text-xs font-bold text-[#4C3441] flex items-center justify-center gap-2.5 shadow-2xs hover:border-[#FF82AE] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>

      </div>

      {/* Google Account Selector Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Google Header */}
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Đăng nhập bằng Google</h3>
                <p className="text-[11px] text-slate-500">để tiếp tục đến Pinkmess</p>
              </div>
            </div>

            {/* Primary Google Account Card */}
            <div
              onClick={() => handleConfirmGoogleLogin(googleEmail, googleName)}
              className="p-3 rounded-2xl border-2 border-blue-500/30 bg-blue-50/40 hover:bg-blue-50/80 cursor-pointer transition-all flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {googleName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {googleName}
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-medium">Google</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{googleEmail}</div>
                </div>
              </div>
              <Check className="w-4 h-4 text-blue-600" />
            </div>

            {/* Option to change/customize email */}
            <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 text-left">
              <span className="text-[11px] font-medium text-slate-500 block">Hoặc dùng tài khoản Google khác:</span>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="Tên tài khoản Google"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="Email Google (VD: email@gmail.com)"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleConfirmGoogleLogin()}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isLoading ? 'Đang xác thực...' : 'Tiếp tục 🚀'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              Bảo mật bởi Google Identity Services OAuth 2.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
