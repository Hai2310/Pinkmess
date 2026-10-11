# HustMess Cute People Stickers

**332 PNG ảnh tĩnh nền trong suốt, 256 × 256 px, 26 bộ.**

Chủ đề: cô gái, chàng trai, em bé, cặp đôi, gia đình, bạn bè, học tập, biểu cảm, tình yêu.

## Nguồn
- **Các bộ chibi**: Minh họa AI mới, không trích xuất từ website khác.
- **Các bộ `emoji-*`**: Render từ font Noto Color Emoji cài sẵn trong môi trường; nguồn dự án Internet: https://github.com/googlefonts/noto-emoji — giấy phép trong `licenses/`.
- Không bao gồm ảnh lấy tùy tiện từ Pinterest, LINE, Telegram hoặc các sticker thương mại.

## Dùng với HustMess Next.js

1. Copy thư mục `hustmess-people/` vào `apps/web/public/stickers/hustmess-people/`.
2. Đọc `/stickers/hustmess-people/manifest.json`.
3. Lấy asset: `/stickers/hustmess-people/${sticker.file}`.
4. Lưu `sticker.id`, `sticker.packId` vào tin nhắn WebSocket (`type: STICKER`) và kiểm tra quyền truy cập khi gửi.
5. Render thẻ `img`/`Image` với `alt=sticker.name`, khoảng 100-140 px trong ô chat.

```ts
const r = await fetch('/stickers/hustmess-people/manifest.json');
if (!r.ok) throw new Error('Sticker manifest not found');
const data = await r.json();
const packs = data.packs;
```

Các ảnh đều là sticker TĨNH, không có animation. Các minh họa nguồn lớn được cắt thành từng ô nên chi tiết một số hình có thể hơi mềm hoặc chứa nét nền pastel.

Xem `licenses/` trước khi triển khai sản phẩm công khai.
