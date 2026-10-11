import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Check,
  Search,
  Eye,
  Star,
  Flame,
  Layers,
  Heart,
  X
} from 'lucide-react';
import { StickerPack, Sticker } from '../../types';

interface StickerStoreProps {
  packs: StickerPack[];
  installedPackIds: string[];
  onToggleInstallPack: (packId: string) => void;
  onOpenCreateCustom: () => void;
}

export const StickerStore: React.FC<StickerStoreProps> = ({
  packs,
  installedPackIds,
  onToggleInstallPack,
  onOpenCreateCustom
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPack, setPreviewPack] = useState<StickerPack | null>(null);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Animated Stickers', label: '✨ Sticker Động' },
    { id: 'Bunny Collection', label: '🐰 Bunny Collection' },
    { id: 'Love & Romance', label: '💖 Tình Yêu' },
    { id: 'Cats', label: '🐾 Mèo Kawaii' },
    { id: 'Bears', label: '🧸 Gấu Bông' },
    { id: 'Funny & Meme', label: '🤣 Hài Hước' },
    { id: 'Good Morning / Good Night', label: '🌙 Chúc Ngủ Ngon' },
    { id: 'School & Work', label: '💼 Học & Làm' },
    { id: 'Holidays', label: '🎉 Bốn Mùa' },
    { id: 'rabbit', label: '🐰 Thỏ & Kawaii' },
    { id: 'girl', label: '👧 Cô gái chibi' },
    { id: 'boy', label: '👦 Chàng trai chibi' },
    { id: 'couple', label: '💞 Cặp đôi' },
    { id: 'baby', label: '🍼 Em bé' }
  ];

  const filteredPacks = packs.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 bg-[#FFFDFB] overflow-y-auto flex flex-col h-full select-none">
      {/* Banner Hero */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#FFF0F6] via-[#FFE4F0] to-[#FFFDFB] border-b border-[#F7DDE8] relative overflow-hidden">
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[#FF4F8B] text-xs font-bold border border-[#FFD6E5] mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Kho Sticker Độc Quyền
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#4C3441] tracking-tight mb-2">
            Thế giới Sticker 🐰💕
          </h1>
          <p className="text-sm md:text-base text-[#927D8A] font-medium max-w-xl">
            Một chút đáng yêu cho mọi cuộc trò chuyện! Hơn 160+ sticker hoạt hoạ bản quyền gốc được vẽ riêng cho HustMess Bunny Edition.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-[#FF82AE] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm gói sticker..."
                className="w-full bg-white text-xs text-[#4C3441] placeholder:text-[#927D8A]/70 pl-10 pr-4 py-2.5 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none shadow-2xs"
              />
            </div>

            <button
              onClick={onOpenCreateCustom}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#FF82AE]/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Tự tạo Sticker cá nhân
            </button>
          </div>
        </div>

        {/* Decorative Mascot in Corner */}
        <div className="absolute right-6 -bottom-4 hidden lg:block w-44 h-44 drop-shadow-xl animate-bunny-hop">
          <img
            src="/src/assets/images/bunny_mascot_hero_1791670247958.jpg"
            alt="Bunny Mascot"
            className="w-full h-full object-cover rounded-3xl border-4 border-white"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-6 py-3.5 border-b border-[#F7DDE8] bg-[#FFFDFB]/80 backdrop-blur-md sticky top-0 z-20 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#FF82AE] text-white font-bold shadow-xs'
                : 'bg-[#FFF0F6] text-[#927D8A] hover:bg-[#FFE4F0] hover:text-[#4C3441]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Packs Grid */}
      <div className="p-6 md:p-8 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPacks.map((pack) => {
            const isInstalled = installedPackIds.includes(pack.id);

            return (
              <div
                key={pack.id}
                className="bg-white rounded-3xl border border-[#F7DDE8] hover:border-[#FF82AE] p-4 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div>
                  {/* Cover SVG Display */}
                  <div
                    onClick={() => setPreviewPack(pack)}
                    className="w-full h-44 bg-[#FFF0F6]/50 rounded-2xl flex items-center justify-center p-3 cursor-pointer group-hover:bg-[#FFF0F6] transition-colors relative overflow-hidden"
                  >
                    <div className="w-32 h-32 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                      {pack.coverImage ? (
                        <img src={pack.coverImage} alt={pack.name} className="w-full h-full object-contain" />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: pack.coverSvg }} />
                      )}
                    </div>
                    {pack.isAnimated && (
                      <span className="absolute top-2 left-2 bg-[#FF4F8B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                        ✨ ĐỘNG
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 text-[10px] text-[#927D8A] bg-white/90 px-2 py-0.5 rounded-full border border-[#F7DDE8]">
                      {pack.stickersCount} stickers
                    </span>
                  </div>

                  {/* Info */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#4C3441] group-hover:text-[#FF4F8B] transition-colors">
                        {pack.name}
                      </h3>
                      <span className="text-[11px] text-[#927D8A]">{pack.category}</span>
                    </div>
                    <p className="text-xs text-[#927D8A] mt-1 line-clamp-2 leading-relaxed">
                      {pack.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-[#F7DDE8] flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPack(pack)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FFF0F6] hover:bg-[#FFE4F0] text-[#4C3441] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FF82AE]" /> Xem trước
                  </button>

                  <button
                    onClick={() => onToggleInstallPack(pack.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isInstalled
                        ? 'bg-[#EBFBF3] text-emerald-600 border border-emerald-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                        : 'bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white shadow-xs hover:opacity-95'
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Đã cài
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Cài đặt
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pack Preview Modal */}
      {previewPack && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-2 border-[#FFD6E5]">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#FFF0F6] to-[#FFE4F0] border-b border-[#F7DDE8] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#4C3441]">{previewPack.name}</h3>
                <p className="text-xs text-[#927D8A]">{previewPack.description}</p>
              </div>
              <button
                onClick={() => setPreviewPack(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#927D8A] hover:text-[#4C3441]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stickers Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 bg-[#FFFDFB]">
              {previewPack.stickers.map((stk) => (
                <div
                  key={stk.id}
                  className="bg-white rounded-2xl p-2 border border-[#F7DDE8] flex flex-col items-center justify-center shadow-2xs hover:scale-105 hover:border-[#FF82AE] transition-all"
                >
                  <div className="w-20 h-20 flex items-center justify-center">
                    {stk.imageUrl ? (
                      <img src={stk.imageUrl} alt={stk.name} className="w-full h-full object-contain" />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: stk.svgContent }} />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-[#4C3441] text-center mt-1 truncate w-full">
                    {stk.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#FFF0F6] border-t border-[#F7DDE8] flex items-center justify-between">
              <span className="text-xs text-[#927D8A]">
                Tác giả: <strong className="text-[#4C3441]">{previewPack.author}</strong> · {previewPack.stickers.length} stickers
              </span>
              <button
                onClick={() => {
                  onToggleInstallPack(previewPack.id);
                  setPreviewPack(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#FF4F8B] text-white text-xs font-bold shadow-xs hover:bg-[#FF6F9F]"
              >
                {installedPackIds.includes(previewPack.id) ? 'Gỡ cài đặt gói' : 'Cài đặt bộ sticker này'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
