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
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPack, setPreviewPack] = useState<StickerPack | null>(null);
  const totalStickerCount = packs.reduce((total, pack) => total + pack.stickers.length, 0);
  const importedPacks = packs.filter((pack) => Boolean(pack.collectionId));
  const importedStickerCount = importedPacks.reduce((total, pack) => total + pack.stickers.length, 0);
  const githubPacks = importedPacks.filter((pack) => pack.collectionId === 'pinkmess-github');
  const githubStickerCount = githubPacks.reduce((total, pack) => total + pack.stickers.length, 0);

  const collections = [
    { id: 'all', label: '🌸 Tất cả kho', count: importedPacks.length },
    { id: 'pinkmess-github', label: '💻 GitHub Vault', count: githubPacks.length },
    { id: 'hustmess-bunny', label: '🐰 Bunny World', count: importedPacks.filter((p) => p.collectionId === 'hustmess-bunny').length },
    { id: 'hustmess-people', label: '🌷 Cute People', count: importedPacks.filter((p) => p.collectionId === 'hustmess-people').length },
    { id: 'pinkmess-funny', label: '🤣 Funny Originals', count: importedPacks.filter((p) => p.collectionId === 'pinkmess-funny').length },
    { id: 'local', label: '✨ Pinkmess Originals', count: packs.filter((p) => !p.collectionId).length }
  ];

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Animated Stickers', label: '✨ Sticker Động' },
    { id: 'Bunny Collection', label: '🐰 Bunny Collection' },
    { id: 'Love & Romance', label: '💖 Tình Yêu' },
    { id: 'Cats', label: '🐾 Mèo Kawaii' },
    { id: 'Bears', label: '🧸 Gấu Bông' },
    { id: 'Bears & Animals', label: '🐼 Gấu & Panda' },
    { id: 'Animals & Cute', label: '🐰 Thỏ, Mèo & Cún' },
    { id: 'Cats & Reactions', label: '🐱 Mèo biểu cảm' },
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
    const packCollection = p.collectionId || 'local';
    const matchesCollection = selectedCollection === 'all' || packCollection === selectedCollection;
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCollection && matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 min-w-0 bg-[#FFFDFB] overflow-y-auto flex flex-col h-full select-none overscroll-contain">
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
            Một chút đáng yêu cho mọi cuộc trò chuyện! Đã tải đủ <strong className="text-[#FF4F8B]">{importedPacks.length} bộ · {importedStickerCount} sticker</strong> từ các kho tích hợp.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 max-w-2xl">
            <div className="rounded-2xl bg-white/80 border border-[#FFD6E5] px-3 py-2 shadow-sm">
              <p className="text-[10px] uppercase tracking-wide text-[#927D8A]">Kho tích hợp</p>
              <p className="text-sm font-extrabold text-[#4C3441]">{importedPacks.length} bộ · {importedStickerCount}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-[#FFD6E5] px-3 py-2 shadow-sm">
              <p className="text-[10px] uppercase tracking-wide text-[#927D8A]">GitHub Vault</p>
              <p className="text-sm font-extrabold text-[#4C3441]">{githubPacks.length} bộ · {githubStickerCount}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-[#FFD6E5] px-3 py-2 shadow-sm">
              <p className="text-[10px] uppercase tracking-wide text-[#927D8A]">Đang hiển thị</p>
              <p className="text-sm font-extrabold text-[#FF4F8B]">{filteredPacks.length} bộ</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-[#FFD6E5] px-3 py-2 shadow-sm">
              <p className="text-[10px] uppercase tracking-wide text-[#927D8A]">Tổng trong Pinkmess</p>
              <p className="text-sm font-extrabold text-[#4C3441]">{packs.length} bộ · {totalStickerCount}</p>
            </div>
          </div>

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

      {/* Collection and category filters */}
      <div className="sticky top-0 z-20 bg-[#FFFDFB]/95 backdrop-blur-md border-b border-[#F7DDE8] shadow-[0_4px_18px_rgba(255,130,174,0.06)]">
        <div className="px-4 sm:px-6 pt-3 pb-2 overflow-x-auto overscroll-x-contain no-scrollbar">
          <div className="flex w-max items-center gap-2.5">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => {
                  setSelectedCollection(collection.id);
                  setSelectedCategory('all');
                }}
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  selectedCollection === collection.id
                    ? 'border-[#FF82AE] bg-[#FF82AE] text-white shadow-md shadow-[#FF82AE]/20'
                    : 'border-[#FFD6E5] bg-white text-[#927D8A] hover:border-[#FF82AE] hover:bg-[#FFF0F6] hover:text-[#4C3441]'
                }`}
              >
                {collection.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${selectedCollection === collection.id ? 'bg-white/25 text-white' : 'bg-[#FFF0F6] text-[#FF4F8B]'}`}>
                  {collection.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 sm:px-6 pb-3 overflow-x-auto overscroll-x-contain no-scrollbar">
          <div className="flex w-max items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex min-h-8 shrink-0 items-center rounded-xl border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'border-[#FF82AE] bg-[#FFF0F6] text-[#FF4F8B] shadow-sm'
                    : 'border-transparent bg-[#FFF8FB] text-[#927D8A] hover:border-[#FFD6E5] hover:bg-white hover:text-[#4C3441]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="p-4 sm:p-6 md:p-8 flex-1">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[#927D8A]">
            {selectedCollection === 'pinkmess-github' ? '💻 GitHub Vault · 11 bộ · 119 sticker' : `${filteredPacks.length} bộ sticker đang hiển thị`}
          </p>
          {(selectedCollection !== 'all' || selectedCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCollection('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="shrink-0 rounded-full border border-[#FFD6E5] bg-white px-3 py-1.5 text-[11px] font-bold text-[#FF4F8B] hover:bg-[#FFF0F6]"
            >
              Xoá bộ lọc
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPacks.map((pack) => {
            const isInstalled = installedPackIds.includes(pack.id);

            return (
              <div
                key={pack.id}
                className="bg-white rounded-3xl border border-[#F7DDE8] hover:border-[#FF82AE] p-3.5 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
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
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base leading-tight text-[#4C3441] group-hover:text-[#FF4F8B] transition-colors">
                        {pack.name}
                      </h3>
                      <span className="shrink-0 text-[10px] text-[#927D8A] text-right max-w-[42%]">{pack.category}</span>
                    </div>
                    <span className="inline-flex max-w-full mt-1.5 rounded-full bg-[#FFF0F6] px-2 py-0.5 text-[10px] font-semibold text-[#FF4F8B] truncate">
                      {pack.collectionName || 'Pinkmess Originals'}
                    </span>
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
