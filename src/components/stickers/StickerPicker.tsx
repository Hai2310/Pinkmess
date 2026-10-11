import React, { useState, useMemo, useRef } from 'react';
import { Search, Star, Clock, ImagePlus, X } from 'lucide-react';
import { Sticker, StickerPack } from '../../types';

interface StickerPickerProps {
  packs: StickerPack[];
  favoriteStickerIds: string[];
  recentStickerIds: string[];
  onSelectSticker: (sticker: Sticker) => void;
  onToggleFavorite: (stickerId: string) => void;
  onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  packs,
  favoriteStickerIds,
  recentStickerIds,
  onSelectSticker,
  onToggleFavorite,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackId, setSelectedPackId] = useState<string>('recent');
  const stickerUploadRef = useRef<HTMLInputElement>(null);

  // Flatten all stickers
  const allStickers = useMemo(() => {
    return packs.flatMap((p) => p.stickers);
  }, [packs]);

  // Recent stickers list
  const recentStickers = useMemo(() => {
    return recentStickerIds
      .map((id) => allStickers.find((s) => s.id === id))
      .filter((s): s is Sticker => Boolean(s));
  }, [recentStickerIds, allStickers]);

  // Favorite stickers list
  const favoriteStickers = useMemo(() => {
    return favoriteStickerIds
      .map((id) => allStickers.find((s) => s.id === id))
      .filter((s): s is Sticker => Boolean(s));
  }, [favoriteStickerIds, allStickers]);

  // Filtered stickers based on search or category
  const displayedStickers = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return allStickers.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.keywords.some((k) => k.toLowerCase().includes(q)) ||
          s.emotion.toLowerCase().includes(q)
      );
    }

    if (selectedPackId === 'recent') {
      return recentStickers.length > 0 ? recentStickers : packs[0]?.stickers || [];
    }

    if (selectedPackId === 'favorites') {
      return favoriteStickers;
    }

    const pack = packs.find((p) => p.id === selectedPackId);
    return pack ? pack.stickers : [];
  }, [searchQuery, selectedPackId, allStickers, recentStickers, favoriteStickers, packs]);

  const handleUploadSticker = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Bạn hãy chọn file ảnh PNG, JPG, WEBP hoặc GIF nhé.');
      event.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      window.alert('Sticker cá nhân nên nhỏ hơn 8MB để gửi nhanh hơn nhé.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onSelectSticker({
        id: `custom_upload_${Date.now()}`,
        packId: 'custom-upload',
        name: file.name.replace(/\.[^/.]+$/, '') || 'Sticker của tôi',
        keywords: ['custom', 'cá nhân', file.name],
        emotion: 'custom',
        svgContent: '',
        imageUrl: reader.result as string,
        isAnimated: file.type === 'image/gif',
        sortOrder: 0
      });
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="absolute bottom-20 right-4 left-4 md:left-auto md:right-8 md:w-96 h-[440px] bg-white rounded-3xl shadow-2xl border-2 border-[#FFD6E5] flex flex-col z-40 overflow-hidden select-none animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header & Search */}
      <div className="p-3 bg-gradient-to-r from-[#FFF0F6] to-[#FFE4F0] border-b border-[#F7DDE8] flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#FF82AE] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm sticker dễ thương... (thỏ, yêu, vui, ngủ...)"
            className="w-full bg-white text-xs text-[#4C3441] placeholder:text-[#927D8A]/70 pl-8 pr-3 py-1.5 rounded-2xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <input
            ref={stickerUploadRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleUploadSticker}
          />
          <button
            onClick={() => stickerUploadRef.current?.click()}
            className="p-1.5 rounded-full hover:bg-white text-[#927D8A] hover:text-[#FF4F8B] transition-colors"
            title="Gửi sticker của bạn"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white text-[#927D8A] hover:text-[#4C3441] transition-colors"
            title="Đóng kho sticker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#FFFDFB] border-b border-[#F7DDE8] overflow-x-auto overscroll-x-contain no-scrollbar shrink-0 snap-x snap-mandatory">
        <button
          onClick={() => {
            setSelectedPackId('recent');
            setSearchQuery('');
          }}
          className={`flex shrink-0 snap-start items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedPackId === 'recent' && !searchQuery
              ? 'bg-[#FF82AE] text-white font-semibold shadow-xs'
              : 'bg-[#FFF0F6] text-[#927D8A] hover:bg-[#FFE4F0]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Gần đây
        </button>

        <button
          onClick={() => {
            setSelectedPackId('favorites');
            setSearchQuery('');
          }}
          className={`flex shrink-0 snap-start items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedPackId === 'favorites' && !searchQuery
              ? 'bg-[#FF82AE] text-white font-semibold shadow-xs'
              : 'bg-[#FFF0F6] text-[#927D8A] hover:bg-[#FFE4F0]'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current text-amber-400" /> Yêu thích ({favoriteStickerIds.length})
        </button>

        {packs.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPackId(p.id);
              setSearchQuery('');
            }}
            className={`flex shrink-0 snap-start items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedPackId === p.id && !searchQuery
                ? 'bg-[#FF82AE] text-white font-semibold shadow-xs'
                : 'bg-[#FFF0F6] text-[#927D8A] hover:bg-[#FFE4F0]'
            }`}
          >
            {p.isAnimated ? '✨ ' : ''}
            {p.name.replace(' (Động)', '').replace(' (Phép Thuật)', '')}
          </button>
        ))}
      </div>

      {/* Stickers Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {displayedStickers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🐰💭</div>
            <p className="text-xs font-semibold text-[#4C3441]">Không tìm thấy sticker phù hợp</p>
            <p className="text-[11px] text-[#927D8A] mt-1">Thử tìm bằng từ khoá khác nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {displayedStickers.map((stk) => {
              const isFav = favoriteStickerIds.includes(stk.id);
              return (
                <div
                  key={stk.id}
                  className="group relative bg-[#FFF0F6]/40 hover:bg-[#FFF0F6] rounded-2xl p-2.5 border border-[#F7DDE8] hover:border-[#FF82AE] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  {/* Sticker image or SVG */}
                  <div
                    onClick={() => onSelectSticker(stk)}
                    className="w-16 h-16 flex items-center justify-center"
                  >
                    {stk.imageUrl ? (
                      <img src={stk.imageUrl} alt={stk.name} className="w-full h-full object-contain" />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: stk.svgContent }} />
                    )}
                  </div>

                  {/* Name label */}
                  <span className="text-[10px] text-[#4C3441] font-medium truncate w-full text-center mt-1">
                    {stk.name}
                  </span>

                  {/* Favorite button toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(stk.id);
                    }}
                    className={`absolute top-1 right-1 p-1 rounded-full bg-white/90 shadow-xs transition-opacity ${
                      isFav ? 'opacity-100 text-amber-400' : 'opacity-0 group-hover:opacity-100 text-[#927D8A] hover:text-amber-400'
                    }`}
                    title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <Star className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-[#FFF0F6] border-t border-[#F7DDE8] flex items-center justify-between text-[11px] text-[#927D8A]">
        <span>🐰 Pinkmess Sticker World</span>
        <span className="font-semibold text-[#FF4F8B]">{displayedStickers.length} stickers</span>
      </div>
    </div>
  );
};
