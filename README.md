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

## Kiểm tra trước khi deploy

`npm run lint && npm run build`
