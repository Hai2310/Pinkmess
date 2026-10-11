import React, { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

interface CustomStickerModalProps {
  onClose: () => void;
  onSavePack: (packData: any) => void;
}

export const CustomStickerModal: React.FC<CustomStickerModalProps> = ({ onClose, onSavePack }) => {
  const [packName, setPackName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tự Tạo');
  const [stickersList, setStickersList] = useState<{ name: string; svgContent: string; imageUrl?: string }[]>([
    {
      name: 'Thỏ Cute Của Tôi',
      svgContent: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="75" fill="#FFE4F0" stroke="#FF82AE" stroke-width="4"/>
        <circle cx="70" cy="85" r="7" fill="#4C3441"/>
        <circle cx="130" cy="85" r="7" fill="#4C3441"/>
        <ellipse cx="60" cy="98" rx="8" ry="5" fill="#FF82AE" opacity="0.6"/>
        <ellipse cx="140" cy="98" rx="8" ry="5" fill="#FF82AE" opacity="0.6"/>
        <path d="M94,105 Q100,115 106,105" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
        <text x="100" y="150" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FF4F8B" text-anchor="middle">My Sticker 💕</text>
      </svg>`
    }
  ]);
  const [newStickerName, setNewStickerName] = useState('');

  const handleUploadImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    const acceptedFiles = files.filter((file) => file.size <= 8 * 1024 * 1024);
    if (acceptedFiles.length !== files.length) {
      window.alert('Một số ảnh lớn hơn 8MB nên đã được bỏ qua.');
    }

    const uploaded = await Promise.all(
      acceptedFiles.map(
        (file) =>
          new Promise<{ name: string; svgContent: string; imageUrl: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                name: file.name.replace(/\.[^/.]+$/, '') || 'Sticker của tôi',
                svgContent: '',
                imageUrl: reader.result as string
              });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    setStickersList((prev) => [...prev, ...uploaded]);
    event.target.value = '';
  };

  const handleAddSample = () => {
    if (!newStickerName.trim()) return;
    const sampleSvg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="70" fill="#FFF0F6" stroke="#FF6F9F" stroke-width="4"/>
      <circle cx="75" cy="85" r="8" fill="#4C3441"/>
      <circle cx="125" cy="85" r="8" fill="#4C3441"/>
      <ellipse cx="65" cy="95" rx="8" ry="5" fill="#FF82AE" opacity="0.6"/>
      <ellipse cx="135" cy="95" rx="8" ry="5" fill="#FF82AE" opacity="0.6"/>
      <path d="M92,105 Q100,118 108,105" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text x="100" y="150" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FF4F8B" text-anchor="middle">${newStickerName}</text>
    </svg>`;

    setStickersList([...stickersList, { name: newStickerName, svgContent: sampleSvg }]);
    setNewStickerName('');
  };

  const handleRemove = (index: number) => {
    setStickersList(stickersList.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!packName.trim() || stickersList.length === 0) return;
    onSavePack({
      name: packName,
      description: description || 'Gói sticker do tôi tự tạo',
      category,
      stickers: stickersList.map((s, idx) => ({
        id: `custom_stk_${Date.now()}_${idx}`,
        name: s.name,
        keywords: [s.name, 'custom'],
        emotion: 'cute',
        svgContent: s.svgContent,
        imageUrl: s.imageUrl,
        sortOrder: idx + 1
      }))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-2 border-[#FFD6E5] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-[#F7DDE8]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐰🎨</span>
            <h3 className="font-bold text-lg text-[#4C3441]">Tự Tạo Bộ Sticker Cá Nhân</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#FFF0F6] text-[#927D8A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4C3441] mb-1">Tên gói sticker (*):</label>
            <input
              type="text"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="VD: Thỏ Tinh Nghịch, Cún Cưng..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4C3441] mb-1">Mô tả gói:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn về bộ sưu tập..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4C3441] mb-2">
              Danh sách sticker trong gói ({stickersList.length}):
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {stickersList.map((stk, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFF0F6] rounded-2xl p-2.5 border border-[#F7DDE8] flex flex-col items-center relative group"
                >
                  <div className="w-16 h-16 flex items-center justify-center">
                    {stk.imageUrl ? (
                      <img src={stk.imageUrl} alt={stk.name} className="w-full h-full object-contain" />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: stk.svgContent }} />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-[#4C3441] mt-1 truncate w-full text-center">
                    {stk.name}
                  </span>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xoá"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add uploaded sticker images or a sample */}
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#FFFDFB] border border-[#F7DDE8]">
              <label className="px-3 py-1.5 rounded-xl bg-[#FFE4F0] text-[#FF4F8B] text-xs font-semibold flex items-center gap-1 hover:bg-[#FFD6E5] cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Tải ảnh sticker
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  onChange={handleUploadImages}
                  className="hidden"
                />
              </label>
              <input
                type="text"
                value={newStickerName}
                onChange={(e) => setNewStickerName(e.target.value)}
                placeholder="Tên sticker mới (VD: Cười tít mắt)..."
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#F7DDE8] focus:outline-none"
              />
              <button
                onClick={handleAddSample}
                className="px-3 py-1.5 rounded-xl bg-[#FF82AE] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#FF6F9F]"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mẫu
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#F7DDE8] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#927D8A] hover:bg-[#FFF0F6]"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={!packName.trim() || stickersList.length === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white text-xs font-bold shadow-md shadow-[#FF82AE]/30 disabled:opacity-50 hover:opacity-95"
          >
            Lưu và phát hành gói 🐰
          </button>
        </div>
      </div>
    </div>
  );
};
