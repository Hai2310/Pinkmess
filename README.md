<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Pinkmess

Pinkmess là ứng dụng chat realtime màu hồng dành cho mobile và iPhone web app, gồm nhắn tin, sticker, ảnh, GIF động và gọi thoại/video WebRTC.

View your app in AI Studio: https://ai.studio/apps/d9acfcce-d622-4a12-8fa0-b3e92ad5aef7

## Chạy local

**Prerequisites:**  Node.js


1. Cài dependencies: `npm install`
2. Sao chép `.env.example` thành `.env` và điền `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
3. Chạy: `npm run dev`

## Google OAuth

Trong Google Cloud Console, thêm đúng redirect URI:

`https://<domain-pinkmess>/api/auth/google/callback`

Trên Render, đặt ba biến môi trường `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` và `GOOGLE_REDIRECT_URI`. Không commit file `.env` hoặc secret Google vào GitHub.

## Lưu dữ liệu bền vững trên Render

Pinkmess lưu tài khoản, cuộc trò chuyện, tin nhắn, sticker tự tạo và cuộc gọi nhỡ vào PostgreSQL qua biến `DATABASE_URL`. `render.yaml` đã khai báo database `pinkmess-db` và tự nối `DATABASE_URL` cho web service. Nếu Render đã có database riêng, chỉ cần đặt `DATABASE_URL` của database đó trong Environment.

Không dùng file JSON trong thư mục `data` làm nơi lưu production: filesystem mặc định của Render là tạm thời và dữ liệu sẽ mất sau deploy/restart. Database Render Free hiện có giới hạn thời gian sử dụng, nên hãy nâng database lên gói trả phí trước khi hết hạn nếu muốn giữ dữ liệu lâu dài.

## Cloudflare Realtime TURN

Pinkmess dùng Cloudflare Realtime TURN cho mạng di động/NAT khó, nhưng vẫn ưu tiên kết nối WebRTC trực tiếp để giảm latency. Chỉ đặt hai biến này ở server/Render, không đặt tiền tố `VITE_` và không đưa API token vào frontend:

`TURN_KEY_ID`

`TURN_KEY_API_TOKEN`

Backend sẽ gọi `/api/turn/ice-servers` để cấp credential ngắn hạn cho từng cuộc gọi. Trên Render, xóa các biến cũ `VITE_TURN_URLS`, `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL`, thêm hai biến Cloudflare ở trên rồi deploy lại.

## Kiểm tra trước khi deploy

`npm run lint && npm run build`
