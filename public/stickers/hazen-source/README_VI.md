# Pinkmess — Hazen/Trứng Bắc Thảo (Original Sticker Sources)

Đây là bộ ảnh **Hazen xanh**, đúng nhân vật từ ảnh người dùng gửi, không phải AI vẽ lại.

## Thành phẩm ĐÃ CÓ TRONG ZIP

- `stickers/`: 20 ảnh PNG 512×512 (các biểu cảm gốc, cắt riêng từ bảng 5×4 do người dùng cung cấp).
- `ORIGINAL_SOURCE_SHEET.png`: ảnh gốc nguyên vẹn 1024×1024.
- `PREVIEW.jpg`: xem trước 20 ảnh.
- `manifest.json` và `stickers.json`: metadata để nhập vào Pinkmess.

**Lưu ý độ nét:** mỗi sticker gốc trong bảng ảnh chỉ chiếm khoảng 180–205 px. Bản PNG 512px được nội suy Lanczos nên *không* thể phục hồi chi tiết độ phân giải cao mà nguồn ban đầu không có. Một số mẫu trong ảnh nguồn đã bị cắt mất rìa, điều này được giữ nguyên chứ không tự chế vẽ thêm.

## Bộ Hazen tìm thấy trực tuyến (chưa tải vào ZIP)

- https://taosticker.com/ — trên trang hiển thị `Hazen Sticker` với 71 hình.
- https://uk.pinterest.com/gnismos/hazen/ — trang tuyển tập Hazen, khoảng 52 ý tưởng.
- 5 URL ảnh riêng lẻ trong `ONLINE_REFERENCES_NOT_INCLUDED.json`.

Các ảnh trên những trang đó KHÔNG được ngầm coi là có giấy phép phân phối lại. Dùng nội bộ không tự động tạo quyền tải lại/đăng vào app. Hãy kiểm tra quyền sử dụng trước khi nhập vào Pinkmess.

## Nếu bạn có quyền dùng các ảnh trực tuyến

Trên máy có kết nối Internet:

```bash
pip install -r requirements-download.txt
python fetch_online_hazen.py
```

Lệnh tải 5 URL ảnh đã xác định về `online_downloaded/` và lưu riêng nhật ký nguồn + kích thước gốc. Không làm thay đổi ảnh 20 sticker hiện có. Nếu gặp 403/hết hạn thì bỏ qua và ghi rõ lỗi. Không tự động tải trọn trang TaoSticker, không vượt quyền truy cập.

Muốn mở rộng lên đủ 71 ảnh, vui lòng lấy pack Hazen trực tiếp từ nguồn hoặc cung cấp thư mục ảnh gốc đã tải về; khi đó có thể chuẩn hóa thành bộ 512 PNG/WebP mà không bị giảm chất lượng so với file gốc.

## Cách nhập vào app

Copy `stickers/` và `manifest.json` vào `/public/stickers/hazen-source/`, hoặc giao cả ZIP cho Codex theo `CODEX_IMPORT_PROMPT.md`.

## Bản quyền

Ảnh nguồn do người dùng cung cấp và các ảnh trực tuyến có thể thuộc quyền của những tác giả khác nhau. Không tuyên bố bản quyền/giấy phép thay họ.
