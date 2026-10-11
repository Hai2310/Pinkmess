# HustMess Bunny Sticker World 🐰💕

**20 bộ sticker – 179 ảnh PNG nền trong suốt – 256 × 256 px.**

Các nhân vật bao gồm **thỏ, mèo, cún, gấu, panda, gà con** và những kiểu tạo hình khác.
Hình ảnh đã được tách thành từng file độc lập để có thể gửi trực tiếp trong chat.

## Cấu trúc

```text
HustMess-Bunny-Sticker-Pack/
├── hustmess-bunny/
│   ├── manifest.json       # metadata các bộ + stickers
│   ├── stickers.json       # danh sách sticker dạng phẳng
│   └── packs/
│       ├── bunny-love/
│       │   ├── cover.png
│       │   ├── 001.png ...
│       ├── puppy-cute/
│       ├── kitty-kawaii/
│       └── ...
├── PREVIEW_ALL_PACKS.jpg
├── README.md
└── examples/
    └── NextJsStickerPicker.tsx
```

## Cài vào Next.js HustMess

**Bước 1.** Copy nguyên thư mục `hustmess-bunny` vào `apps/web/public/stickers/`.

**Bước 2.** Lấy danh mục sticker trong frontend:

```ts
const res = await fetch('/stickers/hustmess-bunny/manifest.json');
if (!res.ok) throw new Error('Cannot load sticker manifest');
const manifest = await res.json();
```

**Bước 3.** Render sticker từ đường dẫn:

```tsx
<img
  src={`/stickers/hustmess-bunny/${sticker.file}`}
  alt={sticker.name}
  width={96}
  height={96}
  loading="lazy"
/>
```

**Bước 4.** Khi người dùng chọn sticker, gửi **sticker.id** (và conversationId) lên backend; backend kiểm tra stickerId hợp lệ, quyền trong hội thoại rồi lưu Message với `type: 'STICKER'`. Đầu nhận truy xuất asset bằng id từ catalog tin cậy, không tin URL do client tự gửi.

**Lưu ý:** `manifest.json` có tất cả metadata cần thiết để seed các bảng `StickerPack` + `Sticker`; bạn có thể tạo `seed-stickers.ts` theo schema Prisma hiện tại.

## Expo / React Native

Với Expo, host cùng thư mục trên web server/CDN có HTTPS rồi dùng URL đầy đủ, ví dụ:

`https://your-domain.com/stickers/hustmess-bunny/packs/puppy-cute/001.png`

Không dùng `require(variable)` vì Metro không hỗ trợ đường dẫn asset động theo biến như vậy.

## Chất lượng và định dạng

- PNG RGBA, nền đã xử lý trong suốt, kích thước canvas 256 x 256.
- Ảnh được tách từ các sheet minh họa AI; chi tiết gốc phù hợp kích thước chat 80–128 px, **không phải ảnh vector hoặc ảnh in độ phân giải cao**.
- Tất cả là **sticker tĩnh**, không có sticker động thực. Tên bộ có thể mang tính chủ đề, nhưng manifest `animated: false` cho mọi sticker.
- Vì tách nền tự động từ các tấm ảnh pastel, một số nét cực nhạt có thể còn viền hồng nhẹ hoặc chi tiết hơi mềm; nên kiểm tra nếu dùng làm bộ sticker thương mại lớn.
- Tránh tái dùng hình ảnh có chữ AI tạo không chính xác; bạn có thể loại bỏ sticker đó khỏi manifest trước khi phát hành.

## Quyền sử dụng

Ảnh được tạo mới bằng AI cho yêu cầu này, không lấy từ kho sticker có bản quyền của LINE, Telegram hay nhân vật thương mại. Việc sử dụng/phát hành lại cần tuân theo các điều khoản áp dụng với nội dung AI và tự kiểm tra thương hiệu, quyền liên quan khi đưa lên sản phẩm công khai.
