# Pinkmess — 30 bộ sticker meme & cute (ZIP độc lập)

**30 bộ, 368 PNG** (512×512 canvas, nền trong suốt), trong đó bộ vector có cả file **SVG gốc**.

## Chi tiết chất lượng và nguồn

| Phần | Số ảnh | Ghi chú |
|---|---:|---|
| Hazen Trứng Bắc Thảo | 20 | Giữ nhân vật nguyên gốc từ ảnh tổng hợp do người dùng cung cấp; ảnh gốc mỗi ô chỉ ~205×187 px, không thể tăng nét thật bằng upscale |
| Meme ảnh mẫu người dùng | 12 | Cắt từ ảnh 387×516 px; chất lượng ảnh nguồn thấp; KHÔNG thể thành HD thật |
| Mèo, hamster, Shiba, capybara kiểu ảnh/3D | 48 | Minh họa gốc mới tạo cho yêu cầu này, không phải ảnh chụp hay sticker thương mại tải lại |
| Biến thể câu nói hài trên 48 ảnh | 48 | Caption tiếng Việt mới thêm, mỗi hình có cùng nhân vật gốc với bản không chữ |
| Bộ vector Pinkmess từ ZIP trước | 240 | 20 pack × 12, có SVG native và PNG, giữ nét khi thu phóng |

**Tổng 30 pack, 368 ảnh PNG.** 96 ảnh thuộc 48 minh họa mới và các biến thể caption của chúng, không phải 96 nhân vật hoàn toàn khác nhau. Sticker tĩnh, không có GIF/APNG.

## Tích hợp Vite/React/Next.js

1. Copy thư mục `pinkmess-meme-30/` vào `public/stickers/` của app Pinkmess.
2. Nạp `/stickers/pinkmess-meme-30/manifest.json` (ví dụ `fetch('/stickers/pinkmess-meme-30/manifest.json')`).
3. Trong sticker picker, hiển thị `packs[]`; thumbnail = `baseUrl + cover`; mỗi sticker có `url` đầy đủ đã định sẵn.
4. Khi gửi sticker, gửi `packId` và `stickerId` tới server Socket.IO; server kiểm tra ID trong manifest được quản lý tin cậy trước khi lưu loại tin nhắn `STICKER`.
5. Không gửi URL tùy ý từ phía client. Renderer sử dụng URL asset đã được server chấp nhận.
6. Test hai tài khoản khác trình duyệt/mạng, refresh, xem ảnh, chế độ mobile và dark mode.

## Quyền sử dụng / nguồn
- Tham khảo kỹ thuật: Microsoft Fluent Emoji https://github.com/microsoft/fluentui-emoji (MIT), OpenMoji https://github.com/hfg-gmuend/openmoji (CC BY-SA 4.0). **Không đóng gói trực tiếp icon từ hai nguồn này**.
- Ảnh Hazen/ảnh mẫu là ảnh người dùng tự cung cấp và có thể chứa nội dung của tác giả thứ ba, bản quyền chưa xác minh; cần kiểm tra quyền trước khi chia sẻ công khai.
- Không có kho ảnh từ LINE, Telegram hoặc Pinterest được sao chép hàng loạt vào ZIP.
- Các meme photo-style được tạo mới, không dùng hình từ Internet của chủ sở hữu chưa rõ.

## Hướng dẫn Codex
Xem `CODEX_IMPORT_PROMPT.md`. 
