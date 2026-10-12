import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import webpush from 'web-push';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'hustmess_db.json');
const DATABASE_URL = process.env.DATABASE_URL?.trim() || '';
const databasePool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    })
  : null;
const DATABASE_TABLE = 'pinkmess_app_state';
const SESSION_COOKIE = 'pinkmess_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const LEGACY_DEMO_USER_IDS = new Set(['user_bunny', 'user_linh', 'user_hoa', 'user_nam']);
const LEGACY_DEMO_CONVERSATION_IDS = new Set(['conv_bunny_linh', 'conv_group_cute', 'conv_bunny_nam']);

type GoogleAuthResult = { user: any; createdAt: number };
const googleAuthStates = new Map<string, number>();
const googleAuthResults = new Map<string, GoogleAuthResult>();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY?.trim() || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim() || '';
const rawVapidSubject = process.env.VAPID_SUBJECT?.trim() || '';
const vapidSubject = /^(mailto:|https?:\/\/)/i.test(rawVapidSubject)
  ? rawVapidSubject
  : rawVapidSubject.includes('@')
  ? `mailto:${rawVapidSubject}`
  : 'mailto:pinkmess@example.com';
let webPushEnabled = Boolean(vapidPublicKey && vapidPrivateKey);
if (webPushEnabled) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (error) {
    // A malformed VAPID subject must not prevent chat and calls from starting.
    console.error('[Push] VAPID configuration is invalid; push notifications disabled:', error);
    webPushEnabled = false;
  }
}

// Cloudflare Realtime TURN keys are server-only secrets. The browser receives
// short-lived ICE credentials through /api/turn/ice-servers instead of seeing
// TURN_KEY_API_TOKEN or the long-lived TURN key ID.
const turnKeyId = process.env.TURN_KEY_ID?.trim() || '';
const turnKeyApiToken = process.env.TURN_KEY_API_TOKEN?.trim() || '';
const cloudflareTurnEnabled = Boolean(turnKeyId && turnKeyApiToken);
const cloudflareTurnCredentialTtl = 86400;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed users with bunnyId
const initialUsers = [
  {
    id: 'user_bunny',
    bunnyId: 'bunny_cute',
    name: 'Bunny Bé Bỏng',
    email: 'bunny@hustmess.pink',
    avatar: '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
    bio: 'Trưởng ban phát thanh cà rốt 🥕 Nhắn một chút, thương một chút! 🐰💕',
    status: 'online',
    statusMessage: 'Đang ăn dâu tây ngọt lịm 🍓',
    themePreference: 'light-pink',
    chatWallpaper: 'pattern-bunny',
    favoriteStickers: ['p1_stk_1', 'p1_stk_2', 'panim1_stk_1', 'panim1_stk_2', 'p_ribbon_1', 'p_emote_1'],
    installedPacks: ['pack_01', 'pack_02', 'pack_03', 'pack_04', 'pack_anim_01', 'pack_ribbon_bunny', 'pack_bunny_emotes', 'pack_outline_mochi'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_linh',
    bunnyId: 'linh_meo',
    name: 'Khánh Linh (Mèo Con)',
    email: 'linh@hustmess.pink',
    avatar: '/src/assets/images/bunny_calling_avatar_1791670258938.jpg',
    bio: 'Thích trà sữa ít đường nhiều thạch 🧋 Mê sticker Pinkmess!',
    status: 'online',
    statusMessage: 'Đang nghe nhạc lo-fi 🎧',
    themePreference: 'lavender-dream',
    chatWallpaper: 'strawberry-milk',
    favoriteStickers: ['p6_stk_1', 'p1_stk_4', 'p_ribbon_2'],
    installedPacks: ['pack_01', 'pack_06', 'pack_anim_01', 'pack_ribbon_bunny'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_hoa',
    bunnyId: 'mochi_hoa',
    name: 'Minh Hoa (Mochi)',
    email: 'hoa@hustmess.pink',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MochiBunny&backgroundColor=ffd6e5',
    bio: 'Thiết kế đồ hoạ & Fan cứng hội thỏ hồng ✨',
    status: 'away',
    statusMessage: 'Vẽ sticker mới... 🎨',
    themePreference: 'light-pink',
    chatWallpaper: 'pastel-clouds',
    favoriteStickers: ['p4_stk_1', 'p4_stk_2', 'p_outline_10'],
    installedPacks: ['pack_01', 'pack_04', 'pack_outline_mochi'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_nam',
    bunnyId: 'nam_dev',
    name: 'Thành Nam (Dev Boy)',
    email: 'nam@hustmess.pink',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NamDev&backgroundColor=c8f4e2',
    bio: 'Coding WebRTC & Realtime Socket. Gõ phím thâu đêm 💻',
    status: 'online',
    statusMessage: 'Bug fix xong rồi nha ✌️',
    themePreference: 'minimal-pink',
    chatWallpaper: 'minimal-white',
    favoriteStickers: ['p12_stk_6', 'p12_stk_7', 'p_emote_3'],
    installedPacks: ['pack_01', 'pack_12', 'pack_bunny_emotes'],
    createdAt: new Date().toISOString()
  }
];

// Initial conversations
const initialConversations = [
  {
    id: 'conv_bunny_linh',
    type: 'direct',
    name: 'Khánh Linh (Mèo Con)',
    avatar: '/src/assets/images/bunny_calling_avatar_1791670258938.jpg',
    participants: ['user_bunny', 'user_linh'],
    isPinned: true,
    isMuted: false,
    wallpaper: 'pattern-bunny',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: {
      text: 'Gửi cậu một chùm tim hồng nè! 🐰💗',
      type: 'STICKER',
      senderName: 'Bunny Bé Bỏng',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'conv_group_cute',
    type: 'group',
    name: '🐰 Hội Thỏ Bông & Bạn Bè 🌸',
    avatar: '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
    participants: ['user_bunny', 'user_linh', 'user_hoa', 'user_nam'],
    isPinned: true,
    isMuted: false,
    wallpaper: 'strawberry-milk',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 60000 * 5).toISOString(),
    lastMessage: {
      text: 'Tối nay 8h họp nhóm gọi video qua Pinkmess nha mọi người ơi! 📹✨',
      type: 'TEXT',
      senderName: 'Minh Hoa (Mochi)',
      timestamp: new Date(Date.now() - 60000 * 5).toISOString()
    }
  },
  {
    id: 'conv_bunny_nam',
    type: 'direct',
    name: 'Thành Nam (Dev Boy)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NamDev&backgroundColor=c8f4e2',
    participants: ['user_bunny', 'user_nam'],
    isPinned: false,
    isMuted: false,
    wallpaper: 'minimal-white',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 60000 * 30).toISOString(),
    lastMessage: {
      text: 'WebRTC và Socket.IO mượt mà 100% rồi Bunny ơi!',
      type: 'TEXT',
      senderName: 'Thành Nam (Dev Boy)',
      timestamp: new Date(Date.now() - 60000 * 30).toISOString()
    }
  }
];

// Initial messages
const initialMessages = [
  {
    id: 'msg_1',
    conversationId: 'conv_bunny_linh',
    senderId: 'user_linh',
    senderName: 'Khánh Linh (Mèo Con)',
    senderAvatar: '/src/assets/images/bunny_calling_avatar_1791670258938.jpg',
    type: 'TEXT',
    content: 'Alo Bunny ơi, giao diện mới của Pinkmess cưng xỉu luôn á! Màu hồng pastel ngọt ngào quá đi mất 🌸💕',
    createdAt: new Date(Date.now() - 60000 * 15).toISOString(),
    reactions: { '💖': ['user_bunny'], '🥰': ['user_linh'] }
  },
  {
    id: 'msg_2',
    conversationId: 'conv_bunny_linh',
    senderId: 'user_bunny',
    senderName: 'Bunny Bé Bỏng',
    senderAvatar: '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
    type: 'TEXT',
    content: 'Hihi cảm ơn Linh nha! Đã tích hợp cả kho 160 sticker bản quyền, âm thanh thỏ con và gọi video WebRTC sắc nét luôn đó nè! 🐰✨',
    createdAt: new Date(Date.now() - 60000 * 10).toISOString(),
    reactions: { '🐰': ['user_linh'] }
  },
  {
    id: 'msg_3',
    conversationId: 'conv_bunny_linh',
    senderId: 'user_bunny',
    senderName: 'Bunny Bé Bỏng',
    senderAvatar: '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
    type: 'STICKER',
    content: 'Heart Eyes',
    stickerId: 'p1_stk_1',
    stickerPackId: 'pack_01',
    stickerName: 'Heart Eyes',
    isAnimatedSticker: false,
    createdAt: new Date(Date.now() - 60000 * 5).toISOString(),
    reactions: { '💓': ['user_linh', 'user_bunny'] }
  },
  {
    id: 'msg_4',
    conversationId: 'conv_bunny_linh',
    senderId: 'user_linh',
    senderName: 'Khánh Linh (Mèo Con)',
    senderAvatar: '/src/assets/images/bunny_calling_avatar_1791670258938.jpg',
    type: 'STICKER',
    content: 'Bunny Jumping',
    stickerId: 'panim1_stk_1',
    stickerPackId: 'pack_anim_01',
    stickerName: 'Bunny Jumping',
    isAnimatedSticker: true,
    createdAt: new Date(Date.now() - 60000 * 2).toISOString(),
    reactions: { '✨': ['user_bunny'] }
  },
  // Group messages
  {
    id: 'msg_grp_1',
    conversationId: 'conv_group_cute',
    senderId: 'user_bunny',
    senderName: 'Bunny Bé Bỏng',
    senderAvatar: '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
    type: 'TEXT',
    content: 'Chào mừng cả nhà đến với phòng chat nhóm Pinkmess! Mọi người thử tính năng sticker và gọi nhóm chưa?',
    createdAt: new Date(Date.now() - 60000 * 40).toISOString(),
    reactions: { '🎉': ['user_linh', 'user_hoa', 'user_nam'] }
  },
  {
    id: 'msg_grp_2',
    conversationId: 'conv_group_cute',
    senderId: 'user_nam',
    senderName: 'Thành Nam (Dev Boy)',
    senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NamDev&backgroundColor=c8f4e2',
    type: 'TEXT',
    content: 'Đã test thành công WebRTC camera, mic, screen-sharing và gửi file mượt mà trên port 3000!',
    createdAt: new Date(Date.now() - 60000 * 20).toISOString()
  },
  {
    id: 'msg_grp_3',
    conversationId: 'conv_group_cute',
    senderId: 'user_hoa',
    senderName: 'Minh Hoa (Mochi)',
    senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MochiBunny&backgroundColor=ffd6e5',
    type: 'TEXT',
    content: 'Tối nay 8h họp nhóm gọi video qua Pinkmess nha mọi người ơi! 📹✨',
    createdAt: new Date(Date.now() - 60000 * 5).toISOString(),
    reactions: { '🐰': ['user_bunny', 'user_linh'] }
  }
];

// Server Database Models
interface ServerMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: string;
  content: string;
  stickerId?: string;
  stickerUrl?: string;
  stickerPackId?: string;
  stickerName?: string;
  isAnimatedSticker?: boolean;
  fontFamily?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAccuracy?: number;
  locationMapUrl?: string;
  locationRequestId?: string;
  audioDuration?: number;
  audioMimeType?: string;
  attachments?: any[];
  reactions?: Record<string, any>;
  replyToId?: string;
  replyToMessage?: any;
  isPinned?: boolean;
  isEdited?: boolean;
  createdAt: string;
  readBy?: string[];
}

interface ServerConversation {
  id: string;
  type: string;
  name: string;
  avatar: string;
  participants: string[];
  isPinned?: boolean;
  isMuted?: boolean;
  nicknames?: Record<string, string>;
  wallpaper?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    text: string;
    type: string;
    senderName: string;
    timestamp: string;
  };
}

interface ServerCallRequest {
  id: string;
  callId: string;
  fromUserId: string;
  targetUserId: string;
  type: 'audio' | 'video';
  createdAt: string;
  status: 'pending' | 'read';
}

interface ServerLocationPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  updatedAt: string;
}

interface ServerLocationSession {
  id: string;
  conversationId: string;
  requesterId: string;
  targetUserId: string;
  startedAt: string;
  lastLocations: Record<string, ServerLocationPoint>;
}

interface PersistentSession {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface Database {
  users: Array<(typeof initialUsers)[number] & { passwordHash?: string }>;
  conversations: ServerConversation[];
  messages: ServerMessage[];
  customPacks: any[];
  pushSubscriptions: Array<{ userId: string; subscription: any; updatedAt: string }>;
  callRequests: ServerCallRequest[];
  locationSessions: ServerLocationSession[];
  sessions: PersistentSession[];
}

let db: Database = {
  users: [],
  conversations: [],
  messages: [],
  customPacks: [],
  pushSubscriptions: [],
  callRequests: [],
  locationSessions: [],
  sessions: []
};

let databaseReady = false;
let databaseSaveTimer: ReturnType<typeof setTimeout> | null = null;
let databaseSaveQueue = Promise.resolve();
let databaseSaveWarningShown = false;

function removeLegacyDemoData(raw: Partial<Database>): Database {
  const users = (Array.isArray(raw.users) ? raw.users : []).filter(
    (user: any) =>
      !LEGACY_DEMO_USER_IDS.has(user.id) &&
      !String(user.id || '').startsWith('user_g_') &&
      !user.isDemo
  );
  const userIds = new Set(users.map((user: any) => user.id));
  const conversations = (Array.isArray(raw.conversations) ? raw.conversations : []).filter((conversation: any) => {
    if (LEGACY_DEMO_CONVERSATION_IDS.has(conversation.id)) return false;
    const participants = Array.isArray(conversation.participants)
      ? conversation.participants.filter((participantId: string) => userIds.has(participantId))
      : [];
    conversation.participants = participants;
    return participants.length >= 2;
  });
  const conversationIds = new Set(conversations.map((conversation: any) => conversation.id));
  const messages = (Array.isArray(raw.messages) ? raw.messages : []).filter(
    (message: any) => conversationIds.has(message.conversationId) && userIds.has(message.senderId)
  );

  return {
    users: users as Database['users'],
    conversations: conversations as ServerConversation[],
    messages: messages as ServerMessage[],
    customPacks: Array.isArray(raw.customPacks) ? raw.customPacks : [],
    pushSubscriptions: Array.isArray(raw.pushSubscriptions)
      ? raw.pushSubscriptions.filter((item: any) => userIds.has(item?.userId) && item?.subscription?.endpoint)
      : [],
    callRequests: Array.isArray(raw.callRequests)
      ? raw.callRequests.filter(
          (item: any) =>
            item?.id &&
            item?.callId &&
            userIds.has(item?.fromUserId) &&
            userIds.has(item?.targetUserId) &&
            (item?.type === 'audio' || item?.type === 'video')
        )
      : [],
    locationSessions: Array.isArray(raw.locationSessions)
      ? raw.locationSessions.filter(
          (item: any) =>
            item?.id &&
            item?.conversationId &&
            conversationIds.has(item.conversationId) &&
            userIds.has(item?.requesterId) &&
            userIds.has(item?.targetUserId) &&
            item.requesterId !== item.targetUserId
        )
      : [],
    sessions: Array.isArray(raw.sessions)
      ? raw.sessions.filter(
          (session: any) =>
            session?.id &&
            userIds.has(session?.userId) &&
            session?.createdAt &&
            session?.expiresAt &&
            Date.parse(session.expiresAt) > Date.now()
        )
      : []
  };
}

function ensureUserBunnyIds() {
  db.users.forEach((u: any) => {
    if (!u.bunnyId) {
      if (u.id === 'user_bunny') u.bunnyId = 'bunny_cute';
      else if (u.id === 'user_linh') u.bunnyId = 'linh_meo';
      else if (u.id === 'user_hoa') u.bunnyId = 'mochi_hoa';
      else if (u.id === 'user_nam') u.bunnyId = 'nam_dev';
      else u.bunnyId = u.email ? u.email.split('@')[0] : u.id;
    }
  });
}

function writeLocalDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving data:', err);
  }
}

async function writeDatabaseSnapshot(snapshot = JSON.stringify(db)) {
  if (!databasePool) return;
  await databasePool.query(
    `INSERT INTO ${DATABASE_TABLE} (id, payload, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [snapshot]
  );
}

function saveDb() {
  // Keep a local copy for development and as a migration source. Render's
  // default filesystem is ephemeral, so the durable copy is PostgreSQL below.
  writeLocalDb();
  if (!databasePool || !databaseReady) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[DB] Refusing to persist production data without a ready PostgreSQL database.');
    }
    return;
  }

  if (databaseSaveTimer) clearTimeout(databaseSaveTimer);
  databaseSaveTimer = setTimeout(() => {
    databaseSaveTimer = null;
    const snapshot = JSON.stringify(db);
    databaseSaveQueue = databaseSaveQueue
      .catch(() => undefined)
      .then(() => writeDatabaseSnapshot(snapshot))
      .catch((error) => {
        if (!databaseSaveWarningShown) {
          databaseSaveWarningShown = true;
          console.error('[DB] PostgreSQL save failed; the next update will retry.', error);
        }
      });
  }, 150);
}

async function flushDatabase() {
  if (!databasePool || !databaseReady) return;
  if (databaseSaveTimer) {
    clearTimeout(databaseSaveTimer);
    databaseSaveTimer = null;
  }
  await databaseSaveQueue.catch(() => undefined);
  await writeDatabaseSnapshot();
}

function loadLocalDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = removeLegacyDemoData(JSON.parse(raw));
      ensureUserBunnyIds();
      writeLocalDb();
      console.log('[DB] Loaded local database snapshot.');
      return;
    } catch (error) {
      console.error('[DB] Failed to parse local database snapshot; starting clean.', error);
    }
  }

  // New deployments intentionally start without demo users or fake chats.
  db = removeLegacyDemoData({});
  ensureUserBunnyIds();
  writeLocalDb();
}

async function loadPersistentDatabase() {
  loadLocalDatabase();
  if (!databasePool) {
    const message = '[DB] DATABASE_URL is not configured. Production cannot safely start because Render filesystem storage is temporary.';
    if (process.env.NODE_ENV === 'production') throw new Error(message);
    console.warn(`${message} Using local filesystem for development.`);
    return;
  }

  try {
    await databasePool.query(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_TABLE} (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const result = await databasePool.query(`SELECT payload FROM ${DATABASE_TABLE} WHERE id = 1`);
    if (result.rows[0]?.payload) {
      db = removeLegacyDemoData(result.rows[0].payload as Partial<Database>);
      ensureUserBunnyIds();
      writeLocalDb();
      console.log('[DB] Loaded durable PostgreSQL database successfully.');
    } else {
      databaseReady = true;
      await writeDatabaseSnapshot();
      console.log('[DB] Migrated the local snapshot to PostgreSQL.');
    }
    databaseReady = true;
  } catch (error) {
    databaseReady = false;
    console.error('[DB] PostgreSQL is unavailable.', error);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PostgreSQL is unavailable. The production server was stopped to prevent data loss.');
    }
  }
}

function createSession(userId: string) {
  const now = Date.now();
  db.sessions = (db.sessions || []).filter((session) => Date.parse(session.expiresAt) > now);
  const session: PersistentSession = {
    id: randomBytes(32).toString('hex'),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_MAX_AGE_SECONDS * 1000).toISOString()
  };
  db.sessions.push(session);
  return session;
}

function setSessionCookie(req: express.Request, res: express.Response, sessionId: string) {
  const secure = process.env.NODE_ENV === 'production' || req.secure;
  const existing = res.getHeader('Set-Cookie');
  const cookies = Array.isArray(existing) ? existing.map(String) : existing ? [String(existing)] : [];
  cookies.push(
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure ? '; Secure' : ''}`
  );
  res.setHeader('Set-Cookie', cookies);
}

function clearSessionCookie(req: express.Request, res: express.Response) {
  const secure = process.env.NODE_ENV === 'production' || req.secure;
  const existing = res.getHeader('Set-Cookie');
  const cookies = Array.isArray(existing) ? existing.map(String) : existing ? [String(existing)] : [];
  cookies.push(`${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`);
  res.setHeader('Set-Cookie', cookies);
}

function getSessionUser(req: express.Request) {
  const sessionId = readCookie(req, SESSION_COOKIE);
  if (!sessionId) return null;
  const session = (db.sessions || []).find((candidate) => candidate.id === sessionId);
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) {
    db.sessions = db.sessions.filter((candidate) => candidate.id !== sessionId);
    saveDb();
    return null;
  }
  return db.users.find((user) => user.id === session.userId) || null;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function createGoogleOAuthState(secret: string) {
  const payload = `${Date.now()}.${randomBytes(24).toString('hex')}`;
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyGoogleOAuthState(state: string, secret: string) {
  const parts = state.split('.');
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, signature] = parts;
  if (!/^\d+$/.test(issuedAt) || !nonce || !signature) return false;
  if (Date.now() - Number(issuedAt) > 10 * 60 * 1000) return false;
  const expected = createHmac('sha256', secret).update(`${issuedAt}.${nonce}`).digest('base64url');
  return expected === signature;
}

function readCookie(req: express.Request, name: string) {
  const header = req.headers.cookie || '';
  const item = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : '';
}

function toPublicUser(user: any) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function getPublicBaseUrl(req: express.Request) {
  const configuredUrl = process.env.APP_URL?.trim().replace(/\/$/, '');
  if (configuredUrl && /^https?:\/\//i.test(configuredUrl) && !configuredUrl.includes('MY_APP_URL')) {
    return configuredUrl;
  }
  const forwardedProto = String(req.headers['x-forwarded-proto'] || req.protocol).split(',')[0];
  return `${forwardedProto}://${req.get('host')}`;
}

function getGoogleRedirectUri(req: express.Request) {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim().replace(/\/$/, '') ||
    `${getPublicBaseUrl(req)}/api/auth/google/callback`
  );
}

function createGoogleUser(profile: { sub?: string; email?: string; name?: string; picture?: string }) {
  const email = profile.email?.trim().toLowerCase();
  if (!email) throw new Error('Google không trả về email tài khoản.');

  let user: any = db.users.find((candidate: any) => candidate.email?.toLowerCase() === email);
  if (user) {
    user.name = profile.name?.trim() || user.name;
    user.avatar = profile.picture || user.avatar;
    user.authProvider = 'google';
    user.googleSubject = profile.sub || user.googleSubject;
    user.status = 'online';
    return user;
  }

  const baseBunnyId = email.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 24) || `bunny_${Date.now()}`;
  let bunnyId = baseBunnyId;
  let suffix = 2;
  while (db.users.some((candidate: any) => candidate.bunnyId === bunnyId)) {
    bunnyId = `${baseBunnyId}_${suffix++}`;
  }

  user = {
    id: `user_google_${Date.now()}_${randomBytes(3).toString('hex')}`,
    bunnyId,
    name: profile.name?.trim() || 'Pinkmess user',
    email,
    avatar: profile.picture || '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
    bio: 'Đã tham gia Pinkmess bằng Google 💗',
    status: 'online',
    statusMessage: 'Đang online trên Pinkmess 🌸',
    themePreference: 'light-pink',
    chatWallpaper: 'pattern-bunny',
    favoriteStickers: [],
    installedPacks: [],
    authProvider: 'google',
    googleSubject: profile.sub,
    createdAt: new Date().toISOString()
  };
  db.users.push(user as any);
  return user;
}

async function startServer() {
  await loadPersistentDatabase();

  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Track online sockets: socketId -> userId
  const socketToUser = new Map<string, string>();
  const userToSockets = new Map<string, Set<string>>();
  const activeCalls = new Map<string, { fromUserId: string; targetUserId: string }>();
  const activeGroupCalls = new Map<
    string,
    {
      callId: string;
      conversationId: string;
      type: 'audio' | 'video';
      hostUserId: string;
      invitedUserIds: Set<string>;
      participants: Set<string>;
      createdAt: string;
    }
  >();
  const activeLocationSessions = new Map<string, ServerLocationSession>(
    (db.locationSessions || []).map((session) => [session.id, session])
  );
  const locationPersistenceAt = new Map<string, number>();
  const locationRequests = new Map<
    string,
    {
      id: string;
      conversationId: string;
      requesterId: string;
      targetUserId: string;
      status: 'pending' | 'accepted';
      createdAt: string;
    }
  >();

  const emitToUser = (userId: string | undefined, event: string, payload: any) => {
    if (!userId) return;
    const socketIds = userToSockets.get(userId);
    if (!socketIds || socketIds.size === 0) return;
    socketIds.forEach((socketId) => io.to(socketId).emit(event, payload));
  };

  const publicLocationSession = (session: ServerLocationSession) => ({
    sessionId: session.id,
    conversationId: session.conversationId,
    requesterId: session.requesterId,
    targetUserId: session.targetUserId,
    startedAt: session.startedAt,
    locations: session.lastLocations
  });

  const persistLocationSessions = () => {
    db.locationSessions = Array.from(activeLocationSessions.values()).slice(-50);
    saveDb();
  };

  const getConversation = (conversationId: string) =>
    db.conversations.find((conversation) => conversation.id === conversationId);

  const toPublicConversation = (conversation: ServerConversation, viewerId?: string): ServerConversation => {
    if (conversation.type !== 'direct' || !viewerId) return conversation;
    const otherUserId = conversation.participants.find((participantId) => participantId !== viewerId);
    const otherUser = db.users.find((user) => user.id === otherUserId);
    return {
      ...conversation,
      name: otherUser?.name || conversation.name,
      avatar: otherUser?.avatar || conversation.avatar
    };
  };

  const emitToConversation = (
    conversationId: string,
    event: string,
    payload: any,
    excludedSocketId?: string
  ) => {
    const conversation = getConversation(conversationId);
    if (!conversation) return;
    const emittedSocketIds = new Set<string>();
    conversation.participants.forEach((participantId) => {
      userToSockets.get(participantId)?.forEach((socketId) => {
        if (socketId !== excludedSocketId && !emittedSocketIds.has(socketId)) {
          emittedSocketIds.add(socketId);
          const viewerId = socketToUser.get(socketId);
          const eventPayload = event.startsWith('conversation:') && payload?.id
            ? toPublicConversation(payload as ServerConversation, viewerId)
            : payload;
          io.to(socketId).emit(event, eventPayload);
        }
      });
    });
  };

  const sendMessagePushNotifications = async (message: ServerMessage) => {
    if (!webPushEnabled) return;
    const conversation = getConversation(message.conversationId);
    if (!conversation) return;

    const recipientIds = conversation.participants.filter((userId) => userId !== message.senderId);
    const subscriptions = db.pushSubscriptions.filter((record) => recipientIds.includes(record.userId));
    if (subscriptions.length === 0) return;

    const body = message.type === 'IMAGE'
      ? '🖼️ Gửi bạn một tấm ảnh dễ thương'
      : message.type === 'STICKER' || message.type === 'GIF'
      ? '🐰 Gửi bạn một sticker đáng yêu'
      : message.type === 'AUDIO'
      ? '🎙️ Gửi bạn một tin nhắn thoại'
      : message.content.slice(0, 120) || 'Có tin nhắn mới cho bạn';

    await Promise.all(subscriptions.map(async (record) => {
      try {
        await webpush.sendNotification(
          record.subscription,
          JSON.stringify({
            title: `${message.senderName} đang nhắn nè 💌`,
            body,
            icon: '/assets/pinkmess-iphone-wallpaper.png',
            badge: '/assets/pinkmess-iphone-wallpaper.png',
            tag: `pinkmess-${message.conversationId}`,
            data: { conversationId: message.conversationId }
          }),
          { TTL: 120, urgency: 'normal' }
        );
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          db.pushSubscriptions = db.pushSubscriptions.filter(
            (candidate) => candidate.subscription?.endpoint !== record.subscription?.endpoint
          );
          saveDb();
        } else {
          console.warn('[Push] Could not send notification:', error?.message || error);
        }
      }
    }));
  };

  const sendCallPushNotification = async (request: ServerCallRequest) => {
    if (!webPushEnabled) return false;

    const caller = db.users.find((user) => user.id === request.fromUserId);
    const subscriptions = db.pushSubscriptions.filter((record) => record.userId === request.targetUserId);
    if (!caller || subscriptions.length === 0) return false;

    const callLabel = request.type === 'video' ? 'cuộc gọi video' : 'cuộc gọi thoại';
    let delivered = false;
    await Promise.all(
      subscriptions.map(async (record) => {
        try {
          await webpush.sendNotification(
            record.subscription,
            JSON.stringify({
              title: `📞 ${caller.name} đang gọi bạn`,
              body: `Có ${callLabel} Pinkmess đang chờ bạn nè 💗`,
              icon: '/icons/pinkmess-icon-512.jpg',
              badge: '/icons/pinkmess-icon-180.jpg',
              tag: `pinkmess-call-${request.callId}`,
              data: {
                type: 'call',
                callRequestId: request.id,
                callerId: request.fromUserId,
                callType: request.type
              }
            }),
            { TTL: 86400, urgency: 'high' }
          );
          delivered = true;
        } catch (error: any) {
          if (error?.statusCode === 404 || error?.statusCode === 410) {
            db.pushSubscriptions = db.pushSubscriptions.filter(
              (candidate) => candidate.subscription?.endpoint !== record.subscription?.endpoint
            );
            saveDb();
          } else {
            console.warn('[Push] Could not send call notification:', error?.message || error);
          }
        }
      })
    );
    return delivered;
  };

  const isConversationMember = (conversationId: string, userId: string | undefined) => {
    const conversation = getConversation(conversationId);
    return Boolean(userId && conversation?.participants.includes(userId));
  };

  const groupParticipantUsers = (groupCall: { participants: Set<string> }) =>
    Array.from(groupCall.participants)
      .map((userId) => db.users.find((user) => user.id === userId))
      .filter(Boolean)
      .map((user) => toPublicUser(user));

  const removeUserFromGroupCalls = (userId: string) => {
    activeGroupCalls.forEach((groupCall, callId) => {
      if (!groupCall.participants.has(userId)) return;

      if (groupCall.hostUserId === userId) {
        groupCall.participants.forEach((participantId) => {
          if (participantId !== userId) emitToUser(participantId, 'group-call:ended', { callId, endedBy: userId });
        });
        activeGroupCalls.delete(callId);
        return;
      }

      groupCall.participants.delete(userId);
      groupCall.invitedUserIds.delete(userId);
      groupCall.participants.forEach((participantId) => {
        emitToUser(participantId, 'group-call:participant-left', { callId, userId });
      });
      if (groupCall.participants.size === 0) activeGroupCalls.delete(callId);
    });
  };

  const detachSocketUser = (socketId: string, announce = true) => {
    const userId = socketToUser.get(socketId);
    if (!userId) return;
    socketToUser.delete(socketId);
    const sockets = userToSockets.get(userId);
    sockets?.delete(socketId);
    if (sockets && sockets.size > 0) return;
    userToSockets.delete(userId);
    removeUserFromGroupCalls(userId);
    const user = db.users.find((candidate) => candidate.id === userId);
    if (user) {
      user.status = 'away';
      saveDb();
      if (announce) {
        io.emit('presence:update', {
          userId,
          status: 'away',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on('user:join', (userId: string) => {
      detachSocketUser(socket.id, false);
      if (!db.users.some((user) => user.id === userId)) return;
      socketToUser.set(socket.id, userId);
      if (!userToSockets.has(userId)) {
        userToSockets.set(userId, new Set());
      }
      userToSockets.get(userId)!.add(socket.id);

      // Update user status
      const user = db.users.find((u) => u.id === userId);
      if (user) {
        user.status = 'online';
        saveDb();
      }

      activeLocationSessions.forEach((session) => {
        if (session.requesterId === userId || session.targetUserId === userId) {
          socket.emit('location:session-started', publicLocationSession(session));
        }
      });

      // Broadcast presence
      io.emit('presence:update', {
        userId,
        status: 'online',
        timestamp: new Date().toISOString()
      });
      console.log(`[Socket] User joined: ${userId}`);
    });

    socket.on('user:leave', () => detachSocketUser(socket.id));

    socket.on('presence:set', ({ userId, status, statusMessage }: any) => {
      const user = db.users.find((u) => u.id === userId);
      if (user) {
        user.status = status;
        if (statusMessage !== undefined) user.statusMessage = statusMessage;
        saveDb();
        io.emit('presence:update', {
          userId,
          status,
          statusMessage,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Realtime message
    socket.on('message:send', (messagePayload: any) => {
      const senderId = socketToUser.get(socket.id);
      const conversation = getConversation(messagePayload.conversationId);
      if (!senderId || !conversation?.participants.includes(senderId)) return;
      const sender = db.users.find((user) => user.id === senderId);
      const locationLatitude = messagePayload.type === 'LOCATION' ? Number(messagePayload.locationLatitude) : undefined;
      const locationLongitude = messagePayload.type === 'LOCATION' ? Number(messagePayload.locationLongitude) : undefined;
      const locationRequestId = typeof messagePayload.locationRequestId === 'string'
        ? messagePayload.locationRequestId
        : '';
      const locationRequest = locationRequests.get(locationRequestId);
      const hasValidLocation =
        Number.isFinite(locationLatitude) &&
        Number.isFinite(locationLongitude) &&
        (locationLatitude ?? 0) >= -90 &&
        (locationLatitude ?? 0) <= 90 &&
        (locationLongitude ?? 0) >= -180 &&
        (locationLongitude ?? 0) <= 180;
      if (messagePayload.type === 'LOCATION' && !hasValidLocation) return;
      if (
        messagePayload.type === 'LOCATION' &&
        (!locationRequest ||
          locationRequest.status !== 'accepted' ||
          locationRequest.conversationId !== conversation.id ||
          (senderId !== locationRequest.requesterId && senderId !== locationRequest.targetUserId))
      ) {
        return;
      }

      const newMsg = {
        id: messagePayload.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        conversationId: messagePayload.conversationId,
        senderId,
        senderName: sender?.name || messagePayload.senderName,
        senderAvatar: sender?.avatar || messagePayload.senderAvatar,
        type: messagePayload.type || 'TEXT',
        content: messagePayload.content || '',
        stickerId: messagePayload.stickerId,
        stickerUrl: messagePayload.stickerUrl,
        stickerPackId: messagePayload.stickerPackId,
        stickerName: messagePayload.stickerName,
        isAnimatedSticker: messagePayload.isAnimatedSticker,
        fontFamily: typeof messagePayload.fontFamily === 'string' ? messagePayload.fontFamily.slice(0, 160) : undefined,
        locationLatitude: hasValidLocation ? locationLatitude : undefined,
        locationLongitude: hasValidLocation ? locationLongitude : undefined,
        locationAccuracy: hasValidLocation && Number.isFinite(Number(messagePayload.locationAccuracy))
          ? Math.max(0, Number(messagePayload.locationAccuracy))
          : undefined,
        locationMapUrl: hasValidLocation
          ? `https://www.google.com/maps?q=${locationLatitude ?? 0},${locationLongitude ?? 0}`
          : undefined,
        locationRequestId: hasValidLocation && locationRequestId
          ? locationRequestId.slice(0, 120)
          : undefined,
        audioDuration: messagePayload.audioDuration,
        audioMimeType: typeof messagePayload.audioMimeType === 'string'
          ? messagePayload.audioMimeType.slice(0, 80)
          : undefined,
        attachments: messagePayload.attachments,
        reactions: {},
        replyToId: messagePayload.replyToId,
        replyToMessage: messagePayload.replyToMessage,
        createdAt: new Date().toISOString(),
        readBy: [senderId]
      };

      db.messages.push(newMsg);

      // Update conversation lastMessage
      const conv = db.conversations.find((c) => c.id === messagePayload.conversationId);
      if (conv) {
        conv.updatedAt = newMsg.createdAt;
        conv.lastMessage = {
          text:
            newMsg.type === 'STICKER'
              ? `[Sticker ${newMsg.stickerName || ''}]`
              : newMsg.type === 'IMAGE'
              ? '🖼️ [Ảnh]'
              : newMsg.type === 'FILE'
              ? `📎 ${newMsg.attachments?.[0]?.name || 'Tệp đính kèm'}`
              : newMsg.type === 'LOCATION'
              ? '📍 Đã chia sẻ vị trí'
              : newMsg.content,
          type: newMsg.type,
          senderName: newMsg.senderName,
          timestamp: newMsg.createdAt
        };
      }
      saveDb();

      // Broadcast to everyone in conversation
      emitToConversation(newMsg.conversationId, 'message:new', newMsg, socket.id);
      emitToConversation(newMsg.conversationId, 'conversation:updated', conv, socket.id);
      socket.emit('message:new', newMsg);
      socket.emit('conversation:updated', conv ? toPublicConversation(conv, senderId) : conv);
      void sendMessagePushNotifications(newMsg);
    });

    // Message reactions
    socket.on('message:react', ({ messageId, emoji, userId }: any) => {
      const msg = db.messages.find((m) => m.id === messageId);
      if (!msg) return;
      const actorId = socketToUser.get(socket.id);
      if (!actorId || actorId !== userId || !isConversationMember(msg.conversationId, actorId)) return;

      if (!msg.reactions) msg.reactions = {};
      const current = msg.reactions[emoji] || [];

      if (current.includes(userId)) {
        // Toggle off
        msg.reactions[emoji] = current.filter((u: string) => u !== userId);
        if (msg.reactions[emoji].length === 0) {
          delete msg.reactions[emoji];
        }
      } else {
        msg.reactions[emoji] = [...current, userId];
      }

      saveDb();
      emitToConversation(msg.conversationId, 'message:reaction-updated', {
        messageId,
        reactions: msg.reactions,
        conversationId: msg.conversationId
      });
    });

    // Message Edit
    socket.on('message:edit', ({ messageId, newContent }: any) => {
      const msg = db.messages.find((m) => m.id === messageId);
      if (msg && msg.senderId === socketToUser.get(socket.id)) {
        msg.content = newContent;
        msg.isEdited = true;
        saveDb();
        emitToConversation(msg.conversationId, 'message:updated', msg);
      }
    });

    // Message Delete
    socket.on('message:delete', ({ messageId }: any) => {
      const idx = db.messages.findIndex((m) => m.id === messageId);
      if (idx !== -1 && db.messages[idx].senderId === socketToUser.get(socket.id)) {
        const deleted = db.messages[idx];
        db.messages.splice(idx, 1);
        saveDb();
        emitToConversation(deleted.conversationId, 'message:deleted', { messageId, conversationId: deleted.conversationId });
      }
    });

    // Message Pin
    socket.on('message:pin', ({ messageId }: any) => {
      const msg = db.messages.find((m) => m.id === messageId);
      if (msg && isConversationMember(msg.conversationId, socketToUser.get(socket.id))) {
        msg.isPinned = !msg.isPinned;
        saveDb();
        emitToConversation(msg.conversationId, 'message:updated', msg);
      }
    });

    // Typing status
    socket.on('typing:start', ({ conversationId, userId, userName }: any) => {
      const actorId = socketToUser.get(socket.id);
      if (!actorId || actorId !== userId || !isConversationMember(conversationId, actorId)) return;
      emitToConversation(conversationId, 'typing:status', { conversationId, userId, userName, isTyping: true }, socket.id);
    });
    socket.on('typing:stop', ({ conversationId, userId }: any) => {
      const actorId = socketToUser.get(socket.id);
      if (!actorId || actorId !== userId || !isConversationMember(conversationId, actorId)) return;
      emitToConversation(conversationId, 'typing:status', { conversationId, userId, isTyping: false }, socket.id);
    });

    // Live location sharing. Both people must explicitly accept before either
    // browser is asked for GPS permission. The browser then sends updates from
    // watchPosition while the Pinkmess page/PWA is allowed to run.
    socket.on('location:request', (payload: any) => {
      const requesterId = socketToUser.get(socket.id);
      const conversation = getConversation(String(payload?.conversationId || ''));
      if (!requesterId || !conversation || conversation.type !== 'direct' || !conversation.participants.includes(requesterId)) return;

      const targetUserId = conversation.participants.find((userId) => userId !== requesterId);
      if (!targetUserId) return;

      const existingSession = Array.from(activeLocationSessions.values()).find(
        (session) => session.conversationId === conversation.id
      );
      if (existingSession) {
        socket.emit('location:session-started', publicLocationSession(existingSession));
        return;
      }

      const request = {
        id: `location_request_${Date.now()}_${randomBytes(3).toString('hex')}`,
        conversationId: conversation.id,
        requesterId,
        targetUserId,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };
      locationRequests.set(request.id, request);

      if (!userToSockets.has(targetUserId)) {
        socket.emit('location:request-unavailable', {
          requestId: request.id,
          message: 'Người kia cần online để xác nhận chia sẻ vị trí.'
        });
        locationRequests.delete(request.id);
        return;
      }

      socket.emit('location:request-sent', { requestId: request.id, conversationId: conversation.id });

      const requester = db.users.find((user) => user.id === requesterId);
      emitToUser(targetUserId, 'location:incoming-request', {
        requestId: request.id,
        conversationId: conversation.id,
        requester: requester ? toPublicUser(requester) : null
      });

      setTimeout(() => {
        if (locationRequests.get(request.id)?.status === 'pending') locationRequests.delete(request.id);
      }, 10 * 60 * 1000);
    });

    socket.on('location:respond', (payload: any) => {
      const request = locationRequests.get(String(payload?.requestId || ''));
      const responderId = socketToUser.get(socket.id);
      if (!request || !responderId || responderId !== request.targetUserId) return;

      if (!payload?.accepted) {
        emitToUser(request.requesterId, 'location:consent-declined', {
          requestId: request.id,
          conversationId: request.conversationId
        });
        locationRequests.delete(request.id);
        return;
      }

      request.status = 'accepted';
      const session: ServerLocationSession = {
        id: `location_session_${Date.now()}_${randomBytes(3).toString('hex')}`,
        conversationId: request.conversationId,
        requesterId: request.requesterId,
        targetUserId: request.targetUserId,
        startedAt: new Date().toISOString(),
        lastLocations: {}
      };
      activeLocationSessions.set(session.id, session);
      persistLocationSessions();
      const sessionPayload = publicLocationSession(session);
      emitToUser(request.requesterId, 'location:session-started', sessionPayload);
      emitToUser(request.targetUserId, 'location:session-started', sessionPayload);
      locationRequests.delete(request.id);
    });

    socket.on('location:update', (payload: any) => {
      const userId = socketToUser.get(socket.id);
      const session = activeLocationSessions.get(String(payload?.sessionId || ''));
      const latitude = Number(payload?.latitude);
      const longitude = Number(payload?.longitude);
      if (
        !userId ||
        !session ||
        (userId !== session.requesterId && userId !== session.targetUserId) ||
        session.conversationId !== payload?.conversationId ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) return;

      const point: ServerLocationPoint = {
        latitude,
        longitude,
        accuracy: Number.isFinite(Number(payload?.accuracy)) ? Math.max(0, Number(payload.accuracy)) : undefined,
        updatedAt: new Date().toISOString()
      };
      session.lastLocations[userId] = point;
      emitToUser(session.requesterId, 'location:updated', {
        sessionId: session.id,
        conversationId: session.conversationId,
        userId,
        ...point,
        mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`
      });
      emitToUser(session.targetUserId, 'location:updated', {
        sessionId: session.id,
        conversationId: session.conversationId,
        userId,
        ...point,
        mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`
      });

      const lastPersistedAt = locationPersistenceAt.get(session.id) || 0;
      if (Date.now() - lastPersistedAt > 15000) {
        locationPersistenceAt.set(session.id, Date.now());
        persistLocationSessions();
      }
    });

    socket.on('location:stop', (payload: any) => {
      const userId = socketToUser.get(socket.id);
      const session = activeLocationSessions.get(String(payload?.sessionId || ''));
      if (!userId || !session || (userId !== session.requesterId && userId !== session.targetUserId)) return;

      activeLocationSessions.delete(session.id);
      locationPersistenceAt.delete(session.id);
      persistLocationSessions();
      const stoppedPayload = { sessionId: session.id, conversationId: session.conversationId, stoppedBy: userId };
      emitToUser(session.requesterId, 'location:session-stopped', stoppedPayload);
      emitToUser(session.targetUserId, 'location:session-stopped', stoppedPayload);
    });

    // WebRTC Calling Signaling
    socket.on('call:invite', (payload: any) => {
      const fromUserId = socketToUser.get(socket.id);
      const targetUserId = payload.targetUserId;
      if (!fromUserId || !targetUserId || fromUserId === targetUserId) return;

      const callId = String(payload.callId || `call_${Date.now()}`);
      const callType = payload.type === 'video' ? 'video' : 'audio';
      activeCalls.set(callId, { fromUserId, targetUserId });
      console.log(`[Call] Invite from ${fromUserId} to ${targetUserId}`);
      if (!userToSockets.has(targetUserId)) {
        const request: ServerCallRequest = {
          id: `call_request_${Date.now()}_${randomBytes(3).toString('hex')}`,
          callId,
          fromUserId,
          targetUserId,
          type: callType,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        db.callRequests = [...db.callRequests, request].slice(-500);
        saveDb();

        const hasPushSubscription = webPushEnabled && db.pushSubscriptions.some((record) => record.userId === targetUserId);
        emitToUser(fromUserId, 'call:unavailable', {
          callId,
          targetUserId,
          requestId: request.id,
          offline: true,
          notifyQueued: hasPushSubscription
        });
        void sendCallPushNotification(request);
        activeCalls.delete(callId);
        return;
      }
      const caller = db.users.find((user) => user.id === fromUserId);
      emitToUser(targetUserId, 'call:incoming', {
        callId,
        type: callType,
        fromUser: caller ? toPublicUser(caller) : payload.fromUser,
        targetUserId,
        fromUserId
      });
    });

    socket.on('call:accept', (payload: any) => {
      console.log(`[Call] Accepted call ${payload.callId}`);
      const call = activeCalls.get(payload.callId);
      const acceptedBy = socketToUser.get(socket.id);
      if (!call || acceptedBy !== call.targetUserId) return;
      const callerId = call.fromUserId;
      emitToUser(callerId, 'call:accepted', { ...payload, acceptedBy });
    });

    socket.on('call:reject', (payload: any) => {
      console.log(`[Call] Rejected call ${payload.callId}`);
      const call = activeCalls.get(payload.callId);
      const rejectedBy = socketToUser.get(socket.id);
      if (!call || (rejectedBy !== call.targetUserId && rejectedBy !== call.fromUserId)) return;
      const otherUserId = call && rejectedBy === call.targetUserId ? call.fromUserId : call?.targetUserId;
      emitToUser(otherUserId, 'call:rejected', { ...payload, rejectedBy });
      activeCalls.delete(payload.callId);
    });

    socket.on('call:end', (payload: any) => {
      console.log(`[Call] Ended call ${payload.callId}`);
      const call = activeCalls.get(payload.callId);
      const endedBy = socketToUser.get(socket.id);
      if (!call || (endedBy !== call.targetUserId && endedBy !== call.fromUserId)) return;
      const otherUserId = call && endedBy === call.targetUserId ? call.fromUserId : call?.targetUserId;
      emitToUser(otherUserId, 'call:ended', { ...payload, endedBy });
      activeCalls.delete(payload.callId);
    });

    socket.on('call:media-state', (payload: any) => {
      const call = activeCalls.get(payload?.callId);
      const actorId = socketToUser.get(socket.id);
      if (!call || !actorId || (actorId !== call.fromUserId && actorId !== call.targetUserId)) return;
      const otherUserId = actorId === call.fromUserId ? call.targetUserId : call.fromUserId;
      emitToUser(otherUserId, 'call:media-state', {
        callId: payload.callId,
        fromUserId: actorId,
        isMuted: Boolean(payload.isMuted),
        isVideoOff: Boolean(payload.isVideoOff)
      });
    });

    socket.on('webrtc:signal', (payload: any) => {
      // Route SDP and ICE only to the intended peer. Broadcasting SDP to every
      // connected user can attach the wrong stream and breaks multi-user calls.
      const fromUserId = socketToUser.get(socket.id) || payload.fromUserId;
      const activeCall = activeCalls.get(payload.callId);
      const isCallPeer = Boolean(
        fromUserId &&
          activeCall &&
          ((activeCall.fromUserId === fromUserId && activeCall.targetUserId === payload.targetUserId) ||
            (activeCall.targetUserId === fromUserId && activeCall.fromUserId === payload.targetUserId))
      );
      if (!isCallPeer) {
        return;
      }
      emitToUser(payload.targetUserId, 'webrtc:signal', { ...payload, fromUserId });
    });

    // Group WebRTC signaling. The server never mixes media; it only validates
    // the room and routes each SDP/ICE packet to its intended user. Keeping
    // the signaling user-based (instead of socketId-based) also survives a
    // phone reconnect and supports multiple tabs for the same account.
    socket.on('group-call:invite', (payload: any) => {
      const hostUserId = socketToUser.get(socket.id);
      const conversationId = String(payload?.conversationId || '');
      const conversation = getConversation(conversationId);
      if (!hostUserId || !conversation || conversation.type !== 'group' || !conversation.participants.includes(hostUserId)) return;

      const participantIds = Array.from(new Set([
        hostUserId,
        ...(Array.isArray(payload?.participantIds) ? payload.participantIds.map((id: unknown) => String(id)) : conversation.participants)
      ])).filter((userId) => conversation.participants.includes(userId));
      if (participantIds.length < 2 || participantIds.length > 6) {
        socket.emit('group-call:unavailable', {
          callId: payload?.callId,
          message: 'Cuộc gọi nhóm hiện hỗ trợ tối đa 6 người để giữ hình và tiếng mượt nhất.'
        });
        return;
      }

      const existingCall = Array.from(activeGroupCalls.values()).find(
        (groupCall) => groupCall.conversationId === conversationId && groupCall.participants.has(hostUserId)
      );
      if (existingCall) {
        socket.emit('group-call:unavailable', { callId: existingCall.callId, message: 'Nhóm này đang có một cuộc gọi.' });
        return;
      }

      const callId = String(payload?.callId || `group_call_${Date.now()}`);
      const groupCall = {
        callId,
        conversationId,
        type: payload?.type === 'video' ? 'video' as const : 'audio' as const,
        hostUserId,
        invitedUserIds: new Set(participantIds),
        participants: new Set([hostUserId]),
        createdAt: new Date().toISOString()
      };
      activeGroupCalls.set(callId, groupCall);

      const invitedUsers = participantIds
        .map((userId) => db.users.find((user) => user.id === userId))
        .filter(Boolean)
        .map((user) => toPublicUser(user));
      const host = db.users.find((user) => user.id === hostUserId);
      participantIds.filter((userId) => userId !== hostUserId).forEach((targetUserId) => {
        if (!userToSockets.has(targetUserId)) return;
        emitToUser(targetUserId, 'group-call:incoming', {
          callId,
          conversationId,
          type: groupCall.type,
          hostUserId,
          fromUser: host ? toPublicUser(host) : null,
          participants: invitedUsers
        });
      });
      emitToUser(hostUserId, 'group-call:started', {
        callId,
        conversationId,
        type: groupCall.type,
        hostUserId,
        participants: invitedUsers
      });
    });

    socket.on('group-call:join', (payload: any) => {
      const userId = socketToUser.get(socket.id);
      const callId = String(payload?.callId || '');
      const groupCall = activeGroupCalls.get(callId);
      if (!userId || !groupCall || groupCall.conversationId !== String(payload?.conversationId || '') || !groupCall.invitedUserIds.has(userId)) return;
      if (groupCall.participants.size >= 6 && !groupCall.participants.has(userId)) {
        socket.emit('group-call:unavailable', { callId, message: 'Phòng đã đủ 6 người để bảo đảm latency thấp.' });
        return;
      }

      groupCall.participants.add(userId);
      const participant = db.users.find((candidate) => candidate.id === userId);
      const participantPayload = participant ? toPublicUser(participant) : null;
      const activeParticipants = groupParticipantUsers(groupCall);
      emitToUser(userId, 'group-call:joined', {
        callId,
        conversationId: groupCall.conversationId,
        type: groupCall.type,
        hostUserId: groupCall.hostUserId,
        participants: activeParticipants
      });
      groupCall.participants.forEach((participantId) => {
        if (participantId !== userId) {
          emitToUser(participantId, 'group-call:participant-joined', {
            callId,
            participant: participantPayload
          });
        }
      });
    });

    socket.on('group-call:reject', (payload: any) => {
      const userId = socketToUser.get(socket.id);
      const groupCall = activeGroupCalls.get(String(payload?.callId || ''));
      if (!userId || !groupCall || !groupCall.invitedUserIds.has(userId)) return;
      emitToUser(groupCall.hostUserId, 'group-call:participant-rejected', {
        callId: groupCall.callId,
        userId
      });
    });

    socket.on('group-call:leave', (payload: any) => {
      const userId = socketToUser.get(socket.id);
      const callId = String(payload?.callId || '');
      const groupCall = activeGroupCalls.get(callId);
      if (!userId || !groupCall || !groupCall.participants.has(userId)) return;

      if (groupCall.hostUserId === userId) {
        groupCall.participants.forEach((participantId) => {
          if (participantId !== userId) emitToUser(participantId, 'group-call:ended', { callId, endedBy: userId });
        });
        activeGroupCalls.delete(callId);
        return;
      }

      groupCall.participants.delete(userId);
      groupCall.participants.forEach((participantId) => emitToUser(participantId, 'group-call:participant-left', { callId, userId }));
      if (groupCall.participants.size === 0) activeGroupCalls.delete(callId);
    });

    socket.on('group-call:end', (payload: any) => {
      const userId = socketToUser.get(socket.id);
      const callId = String(payload?.callId || '');
      const groupCall = activeGroupCalls.get(callId);
      if (!userId || !groupCall || groupCall.hostUserId !== userId) return;
      groupCall.participants.forEach((participantId) => {
        if (participantId !== userId) emitToUser(participantId, 'group-call:ended', { callId, endedBy: userId });
      });
      activeGroupCalls.delete(callId);
    });

    socket.on('group-call:media-state', (payload: any) => {
      const userId = socketToUser.get(socket.id);
      const callId = String(payload?.callId || '');
      const groupCall = activeGroupCalls.get(callId);
      if (!userId || !groupCall || !groupCall.participants.has(userId)) return;
      groupCall.participants.forEach((participantId) => {
        if (participantId !== userId) {
          emitToUser(participantId, 'group-call:media-state', {
            callId,
            fromUserId: userId,
            isMuted: Boolean(payload?.isMuted),
            isVideoOff: Boolean(payload?.isVideoOff)
          });
        }
      });
    });

    socket.on('group-webrtc:signal', (payload: any) => {
      const fromUserId = socketToUser.get(socket.id);
      const callId = String(payload?.callId || '');
      const targetUserId = String(payload?.targetUserId || '');
      const groupCall = activeGroupCalls.get(callId);
      if (!fromUserId || !groupCall || !targetUserId || fromUserId === targetUserId || !groupCall.participants.has(fromUserId) || !groupCall.participants.has(targetUserId)) return;
      emitToUser(targetUserId, 'group-webrtc:signal', {
        callId,
        fromUserId,
        targetUserId,
        kind: payload?.kind,
        signal: payload?.signal
      });
    });

    socket.on('disconnect', () => {
      detachSocketUser(socket.id);
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  // REST API Endpoints
  // Authentication
  app.post('/api/auth/register', (req, res) => {
    const { name, bunnyId, email, password, avatar, bio } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập tên hiển thị của bạn!' });
    }
    const cleanBunnyId = (bunnyId || '').toLowerCase().trim().replace(/^@/, '');
    if (!cleanBunnyId) {
      return res.status(400).json({ error: 'Vui lòng nhập Bunny ID của bạn!' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 4 ký tự!' });
    }

    const existing = db.users.find((u: any) => u.bunnyId?.toLowerCase() === cleanBunnyId);
    if (existing) {
      return res.status(400).json({ error: `Bunny ID "@${cleanBunnyId}" đã có người sử dụng rồi nè!` });
    }

    const newUser = {
      id: `user_${Date.now()}`,
      bunnyId: cleanBunnyId,
      name: name.trim(),
      email: email?.trim() || `${cleanBunnyId}@hustmess.pink`,
      avatar: avatar || '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
      bio: bio?.trim() || 'Chào mọi người, mình là thành viên mới của Pinkmess! 🐰💕',
      status: 'online' as const,
      statusMessage: 'Vừa mới gia nhập thế giới thỏ 🌸',
      themePreference: 'light-pink',
      chatWallpaper: 'pattern-bunny',
      favoriteStickers: ['p1_stk_1', 'p_ribbon_1'],
      installedPacks: ['pack_01', 'pack_ribbon_bunny', 'pack_bunny_emotes'],
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser as any);
    const session = createSession(newUser.id);

    saveDb();
    setSessionCookie(req, res, session.id);
    io.emit('user:registered', toPublicUser(newUser));
    res.json({ success: true, user: toPublicUser(newUser) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập Bunny ID hoặc Email!' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập mật khẩu!' });
    }
    const q = identifier.toLowerCase().trim().replace(/^@/, '');
    const user = db.users.find(
      (u: any) =>
        u.bunnyId?.toLowerCase() === q ||
        u.email?.toLowerCase() === q ||
        u.id === q ||
        u.name?.toLowerCase() === q
    );

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản với tên, Bunny ID hoặc Email này!' });
    }

    // Migrate accounts created before passwordHash was introduced on their first successful login.
    if (user.passwordHash && !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Mật khẩu chưa đúng, bạn thử lại nhé!' });
    }
    if (!user.passwordHash) {
      user.passwordHash = hashPassword(password);
    }

    user.status = 'online';
    const session = createSession(user.id);
    saveDb();
    setSessionCookie(req, res, session.id);
    io.emit('presence:update', { userId: user.id, status: 'online', timestamp: new Date().toISOString() });
    res.json({ success: true, user: toPublicUser(user) });
  });

  app.get('/api/auth/session', (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn.' });

    user.status = 'online';
    res.json({ success: true, user: toPublicUser(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    const sessionId = readCookie(req, SESSION_COOKIE);
    if (sessionId) {
      db.sessions = (db.sessions || []).filter((session) => session.id !== sessionId);
      saveDb();
    }
    clearSessionCookie(req, res);
    res.json({ success: true });
  });

  app.get('/api/auth/google/start', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const missing = [
      !clientId ? 'GOOGLE_CLIENT_ID' : '',
      !clientSecret ? 'GOOGLE_CLIENT_SECRET' : '',
    ].filter(Boolean);
    if (!clientId || !clientSecret) {
      return res.status(503).send(`Google OAuth chưa được cấu hình trên máy chủ. Thiếu: ${missing.join(', ')}`);
    }

    const state = createGoogleOAuthState(clientSecret);
    googleAuthStates.set(state, Date.now());
    res.setHeader(
      'Set-Cookie',
      `pinkmess_oauth_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    );
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getGoogleRedirectUri(req),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
      state
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    const { code, state, error } = req.query;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
    const clearOAuthCookie = () => {
      res.setHeader('Set-Cookie', 'pinkmess_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    };
    if (error) {
      clearOAuthCookie();
      return res.redirect('/?google_error=cancelled');
    }
    const stateCookie = typeof state === 'string' ? readCookie(req, 'pinkmess_oauth_state') : '';
    const validState =
      typeof state === 'string' &&
      Boolean(clientSecret) &&
      verifyGoogleOAuthState(state, clientSecret) &&
      (googleAuthStates.has(state) || stateCookie === state);
    if (typeof code !== 'string' || !validState) {
      clearOAuthCookie();
      return res.status(400).send('Liên kết Google không hợp lệ hoặc đã hết hạn.');
    }

    googleAuthStates.delete(state);
    clearOAuthCookie();
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: getGoogleRedirectUri(req),
          grant_type: 'authorization_code'
        })
      });
      if (!tokenResponse.ok) throw new Error('Google token exchange failed');
      const tokenData = (await tokenResponse.json()) as { access_token?: string };
      if (!tokenData.access_token) throw new Error('Google không cấp access token.');

      const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (!profileResponse.ok) throw new Error('Không lấy được hồ sơ Google.');
      const profile = (await profileResponse.json()) as { sub?: string; email?: string; name?: string; picture?: string };
      const user = createGoogleUser(profile);
      const session = createSession(user.id);
      saveDb();
      setSessionCookie(req, res, session.id);
      io.emit('user:registered', toPublicUser(user));
      io.emit('presence:update', { userId: user.id, status: 'online', timestamp: new Date().toISOString() });

      const sessionCode = randomBytes(32).toString('hex');
      googleAuthResults.set(sessionCode, { user: toPublicUser(user), createdAt: Date.now() });
      res.redirect(`/?google_code=${encodeURIComponent(sessionCode)}`);
    } catch (oauthError) {
      console.error('[Google OAuth]', oauthError);
      res.redirect('/?google_error=failed');
    }
  });

  app.get('/api/auth/google/session', (req, res) => {
    const code = String(req.query.code || '');
    const result = googleAuthResults.get(code);
    googleAuthResults.delete(code);
    if (!result || Date.now() - result.createdAt > 120000) {
      return res.status(401).json({ error: 'Phiên đăng nhập Google đã hết hạn.' });
    }
    res.json({ success: true, user: result.user });
  });

  app.get('/api/push/public-key', (_req, res) => {
    if (!webPushEnabled) return res.status(503).json({ enabled: false });
    res.json({ enabled: true, publicKey: vapidPublicKey });
  });

  app.get('/api/turn/ice-servers', async (req, res) => {
    if (!cloudflareTurnEnabled) {
      return res.status(503).json({ enabled: false, error: 'Cloudflare TURN chưa được cấu hình.' });
    }

    const userId = String(req.query.userId || '').trim();
    if (!userId || !db.users.some((user) => user.id === userId)) {
      return res.status(401).json({ error: 'Tài khoản không hợp lệ.' });
    }

    try {
      const response = await fetch(
        `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(turnKeyId)}/credentials/generate-ice-servers`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${turnKeyApiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ttl: cloudflareTurnCredentialTtl })
        }
      );
      const payload = (await response.json()) as { iceServers?: RTCIceServer[]; error?: string };
      if (!response.ok || !Array.isArray(payload.iceServers)) {
        console.error('[TURN] Cloudflare credential request failed:', response.status, payload.error || 'invalid response');
        return res.status(502).json({ error: 'Không lấy được credential Cloudflare TURN.' });
      }

      // Cloudflare may return an alternate port 53. Browsers commonly block
      // it, so remove it to avoid needless ICE timeout on mobile networks.
      const iceServers = payload.iceServers
        .map((server) => ({
          ...server,
          urls: Array.isArray(server.urls)
            ? server.urls.filter((url) => !/:53(?:\?|$)/.test(url))
            : typeof server.urls === 'string' && !/:53(?:\?|$)/.test(server.urls)
            ? server.urls
            : undefined
        }))
        .filter((server) => server.urls && (Array.isArray(server.urls) ? server.urls.length > 0 : true));

      res.setHeader('Cache-Control', 'no-store');
      return res.json({ enabled: true, iceServers, expiresIn: cloudflareTurnCredentialTtl });
    } catch (error) {
      console.error('[TURN] Cloudflare request error:', error);
      return res.status(502).json({ error: 'Cloudflare TURN đang tạm thời không phản hồi.' });
    }
  });

  app.post('/api/push/subscribe', (req, res) => {
    if (!webPushEnabled) return res.status(503).json({ error: 'Push notifications chưa được cấu hình trên máy chủ.' });
    const { userId, subscription } = req.body || {};
    if (!db.users.some((user) => user.id === userId)) return res.status(401).json({ error: 'Tài khoản không hợp lệ.' });
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ error: 'Push subscription không hợp lệ.' });
    }

    db.pushSubscriptions = db.pushSubscriptions.filter(
      (record) => record.subscription?.endpoint !== subscription.endpoint && record.userId !== userId
    );
    db.pushSubscriptions.push({ userId, subscription, updatedAt: new Date().toISOString() });
    saveDb();
    res.json({ success: true });
  });

  app.post('/api/push/unsubscribe', (req, res) => {
    const { userId, endpoint } = req.body || {};
    if (userId && endpoint) {
      db.pushSubscriptions = db.pushSubscriptions.filter(
        (record) => !(record.userId === userId && record.subscription?.endpoint === endpoint)
      );
      saveDb();
    }
    res.json({ success: true });
  });

  // Offline calls are stored so the recipient can see them and call back
  // even when Web Push permission was not granted on their device.
  app.get('/api/calls/missed', (req, res) => {
    const userId = String(req.query.userId || '');
    if (!userId || !db.users.some((user) => user.id === userId)) {
      return res.status(401).json({ error: 'Tài khoản không hợp lệ.' });
    }

    const requests = db.callRequests
      .filter((request) => request.targetUserId === userId && request.status === 'pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50)
      .map((request) => {
        const caller = db.users.find((user) => user.id === request.fromUserId);
        return {
          ...request,
          fromUser: caller ? toPublicUser(caller) : null
        };
      })
      .filter((request) => request.fromUser);

    res.json(requests);
  });

  app.post('/api/calls/missed/:requestId/read', (req, res) => {
    const userId = String(req.body?.userId || '');
    const request = db.callRequests.find(
      (candidate) => candidate.id === req.params.requestId && candidate.targetUserId === userId
    );
    if (!request) return res.status(404).json({ error: 'Không tìm thấy cuộc gọi nhỡ.' });

    request.status = 'read';
    saveDb();
    res.json({ success: true });
  });

  // Users
  app.get('/api/users/search', (req, res) => {
    const q = String(req.query.q || '').toLowerCase().trim().replace(/^@/, '');
    if (!q) return res.json([]);

    const matches = db.users
      .filter((user: any) =>
        user.name?.toLowerCase().includes(q) ||
        user.bunnyId?.toLowerCase().includes(q) ||
        user.id?.toLowerCase().includes(q)
      )
      .slice(0, 50)
      .map(toPublicUser);

    res.json(matches);
  });

  app.get('/api/users', (req, res) => {
    res.json(db.users.map(toPublicUser));
  });

  app.post('/api/users/update', (req, res) => {
    const { userId, ...updates } = req.body;
    const user = db.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    Object.assign(user, updates);
    saveDb();
    io.emit('user:profile-updated', user);
    res.json(user);
  });

  // Conversations
  app.get('/api/conversations', (req, res) => {
    const userId = String(req.query.userId || '');
    if (!db.users.some((user) => user.id === userId)) return res.status(401).json({ error: 'Tài khoản không hợp lệ.' });
    res.json(
      db.conversations
        .filter((conversation) => conversation.participants.includes(userId))
        .map((conversation) => toPublicConversation(conversation, userId))
    );
  });

  app.post('/api/conversations', (req, res) => {
    const { type, name, avatar, participants, wallpaper, userId } = req.body;
    const requestedParticipants = Array.isArray(participants) ? participants.filter((id: unknown) => typeof id === 'string') : [];
    if (!userId || !db.users.some((user) => user.id === userId) || !requestedParticipants.includes(userId)) {
      return res.status(401).json({ error: 'Bạn cần đăng nhập để tạo cuộc trò chuyện.' });
    }
    const validParticipants = [...new Set(requestedParticipants)].filter((id) => db.users.some((user) => user.id === id));
    if (validParticipants.length < 2) return res.status(400).json({ error: 'Hãy chọn ít nhất một người dùng khác.' });
    if (type === 'direct' && validParticipants.length === 2) {
      const existing = db.conversations.find(
        (conversation) =>
          conversation.type === 'direct' &&
          conversation.participants.length === 2 &&
          validParticipants.every((id) => conversation.participants.includes(id))
      );
      if (existing) return res.json(existing);
    }
    const newConv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: type || 'direct',
      name: name || 'Trò chuyện mới 🐰',
      avatar: avatar || '/src/assets/images/bunny_mascot_hero_1791670247958.jpg',
      participants: validParticipants,
      isPinned: false,
      isMuted: false,
      wallpaper: wallpaper || 'pattern-bunny',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.conversations.unshift(newConv);
    saveDb();
    emitToConversation(newConv.id, 'conversation:new', newConv);
    res.json(toPublicConversation(newConv, userId));
  });

  app.put('/api/conversations/:id', (req, res) => {
    const conv = db.conversations.find((c) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    const userId = String(req.body.userId || '');
    if (!conv.participants.includes(userId)) return res.status(403).json({ error: 'Bạn không thuộc cuộc trò chuyện này.' });
    const updates = { ...(req.body || {}) };
    delete updates.userId;
    if (typeof updates.wallpaper === 'string') updates.wallpaper = updates.wallpaper.slice(0, 5500000);
    Object.assign(conv, updates);
    saveDb();
    emitToConversation(conv.id, 'conversation:updated', conv);
    res.json(toPublicConversation(conv, userId));
  });

  // Messages
  app.get('/api/conversations/:id/messages', (req, res) => {
    const userId = String(req.query.userId || '');
    if (!isConversationMember(req.params.id, userId)) return res.status(403).json({ error: 'Bạn không thuộc cuộc trò chuyện này.' });
    const msgs = db.messages.filter((m) => m.conversationId === req.params.id);
    res.json(msgs);
  });

  // Custom Sticker Upload API
  app.post('/api/stickers/custom', (req, res) => {
    const { name, description, author, stickers } = req.body;
    const packId = `custom_pack_${Date.now()}`;
    const normalizedStickers = (Array.isArray(stickers) ? stickers : []).map((sticker: any, index: number) => ({
      ...sticker,
      id: sticker.id || `${packId}_sticker_${index + 1}`,
      packId,
      sortOrder: index + 1
    }));
    const newPack = {
      id: packId,
      name: name || 'Gói Sticker Của Bạn',
      slug: `custom-${packId}`,
      description: description || 'Bộ sưu tập sticker tự tạo dễ thương',
      author: author || 'Bạn',
      coverSvg: normalizedStickers[0]?.svgContent || '',
      coverImage: normalizedStickers[0]?.imageUrl || '',
      category: 'Tự Tạo',
      stickersCount: normalizedStickers.length,
      isOfficial: false,
      isAnimated: false,
      createdAt: new Date().toISOString(),
      stickers: normalizedStickers
    };
    db.customPacks.push(newPack);
    saveDb();
    res.json(newPack);
  });

  app.get('/api/stickers/custom', (req, res) => {
    res.json(db.customPacks);
  });

  // File Upload API (Data URL / media storage)
  app.post('/api/upload', (req, res) => {
    const { name, data, type } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });
    // In dev / single process, return stable asset URL or payload
    const assetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    res.json({
      id: assetId,
      url: data,
      name: name || 'file',
      type: type || 'application/octet-stream',
      size: data.length
    });
  });

  // Reset database endpoint if needed
  app.post('/api/admin/reset-demo', (req, res) => {
    db.conversations = [];
    db.messages = [];
    db.customPacks = [];
    saveDb();
    io.emit('system:reset');
    res.json({ success: true, message: 'Đã xoá dữ liệu trò chuyện mẫu.' });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    const durableDatabase = Boolean(databasePool && databaseReady);
    const healthy = process.env.NODE_ENV !== 'production' || durableDatabase;
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'ok' : 'degraded',
      app: 'Pinkmess — Bunny Chat',
      persistence: durableDatabase ? 'postgresql' : 'filesystem-development-only',
      time: new Date().toISOString()
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Presence, messages and calls persist to this JSON file. Watching it
        // makes Vite trigger a full-page reload after every socket update,
        // which can look like a blank screen while changing tabs in dev.
        watch: { ignored: [DB_FILE] }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const shutdown = async (signal: string) => {
    console.log(`[Server] ${signal} received; flushing Pinkmess data.`);
    try {
      await flushDatabase();
    } catch (error) {
      console.error('[DB] Could not flush PostgreSQL before shutdown:', error);
    }
    if (databasePool) await databasePool.end().catch(() => undefined);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🐰 Pinkmess — Bunny Chat dev server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
