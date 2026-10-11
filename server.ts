import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'hustmess_db.json');

const LEGACY_DEMO_USER_IDS = new Set(['user_bunny', 'user_linh', 'user_hoa', 'user_nam']);
const LEGACY_DEMO_CONVERSATION_IDS = new Set(['conv_bunny_linh', 'conv_group_cute', 'conv_bunny_nam']);

type GoogleAuthResult = { user: any; createdAt: number };
const googleAuthStates = new Map<string, number>();
const googleAuthResults = new Map<string, GoogleAuthResult>();

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
  audioDuration?: number;
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

interface Database {
  users: Array<(typeof initialUsers)[number] & { passwordHash?: string }>;
  conversations: ServerConversation[];
  messages: ServerMessage[];
  customPacks: any[];
}

let db: Database = {
  users: [],
  conversations: [],
  messages: [],
  customPacks: []
};

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
    customPacks: Array.isArray(raw.customPacks) ? raw.customPacks : []
  };
}

if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = removeLegacyDemoData(JSON.parse(raw));
    // Ensure all users have bunnyId
    db.users.forEach((u: any) => {
      if (!u.bunnyId) {
        if (u.id === 'user_bunny') u.bunnyId = 'bunny_cute';
        else if (u.id === 'user_linh') u.bunnyId = 'linh_meo';
        else if (u.id === 'user_hoa') u.bunnyId = 'mochi_hoa';
        else if (u.id === 'user_nam') u.bunnyId = 'nam_dev';
        else u.bunnyId = u.email ? u.email.split('@')[0] : u.id;
      }
    });
    saveDb();
    console.log('[DB] Loaded persistent data successfully.');
  } catch (err) {
    console.error('[DB] Failed to parse db file, re-initializing.', err);
    saveDb();
  }
} else {
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving data:', err);
  }
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
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
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

  const emitToUser = (userId: string | undefined, event: string, payload: any) => {
    if (!userId) return;
    const socketIds = userToSockets.get(userId);
    if (!socketIds || socketIds.size === 0) return;
    socketIds.forEach((socketId) => io.to(socketId).emit(event, payload));
  };

  const getConversation = (conversationId: string) =>
    db.conversations.find((conversation) => conversation.id === conversationId);

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
          io.to(socketId).emit(event, payload);
        }
      });
    });
  };

  const isConversationMember = (conversationId: string, userId: string | undefined) => {
    const conversation = getConversation(conversationId);
    return Boolean(userId && conversation?.participants.includes(userId));
  };

  const detachSocketUser = (socketId: string, announce = true) => {
    const userId = socketToUser.get(socketId);
    if (!userId) return;
    socketToUser.delete(socketId);
    const sockets = userToSockets.get(userId);
    sockets?.delete(socketId);
    if (sockets && sockets.size > 0) return;
    userToSockets.delete(userId);
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
        audioDuration: messagePayload.audioDuration,
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
      socket.emit('conversation:updated', conv);
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

    // WebRTC Calling Signaling
    socket.on('call:invite', (payload: any) => {
      const fromUserId = socketToUser.get(socket.id);
      const targetUserId = payload.targetUserId;
      if (!fromUserId || !targetUserId || fromUserId === targetUserId) return;

      activeCalls.set(payload.callId, { fromUserId, targetUserId });
      console.log(`[Call] Invite from ${fromUserId} to ${targetUserId}`);
      if (!userToSockets.has(targetUserId)) {
        emitToUser(fromUserId, 'call:unavailable', { callId: payload.callId, targetUserId });
        activeCalls.delete(payload.callId);
        return;
      }
      const caller = db.users.find((user) => user.id === fromUserId);
      emitToUser(targetUserId, 'call:incoming', {
        callId: payload.callId,
        type: payload.type,
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

    // Group call signaling
    socket.on('group-call:join', ({ roomId, user }: any) => {
      socket.join(roomId);
      socket.to(roomId).emit('group-call:user-joined', { socketId: socket.id, user });
    });

    socket.on('group-call:leave', ({ roomId, userId }: any) => {
      socket.leave(roomId);
      socket.to(roomId).emit('group-call:user-left', { socketId: socket.id, userId });
    });

    socket.on('group-call:signal', ({ targetSocketId, signal, senderUser }: any) => {
      io.to(targetSocketId).emit('group-call:signal', {
        senderSocketId: socket.id,
        signal,
        senderUser
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

    saveDb();
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
    saveDb();
    io.emit('presence:update', { userId: user.id, status: 'online', timestamp: new Date().toISOString() });
    res.json({ success: true, user: toPublicUser(user) });
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

    const state = randomBytes(24).toString('hex');
    googleAuthStates.set(state, Date.now());
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
    if (error) return res.redirect('/?google_error=cancelled');
    if (typeof code !== 'string' || typeof state !== 'string' || !googleAuthStates.has(state)) {
      return res.status(400).send('Liên kết Google không hợp lệ hoặc đã hết hạn.');
    }

    googleAuthStates.delete(state);
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
      saveDb();
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
    res.json(db.conversations.filter((conversation) => conversation.participants.includes(userId)));
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
    res.json(newConv);
  });

  app.put('/api/conversations/:id', (req, res) => {
    const conv = db.conversations.find((c) => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    const userId = String(req.body.userId || '');
    if (!conv.participants.includes(userId)) return res.status(403).json({ error: 'Bạn không thuộc cuộc trò chuyện này.' });
    delete req.body.userId;
    Object.assign(conv, req.body);
    saveDb();
    emitToConversation(conv.id, 'conversation:updated', conv);
    res.json(conv);
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
    res.json({ status: 'ok', app: 'Pinkmess — Bunny Chat', time: new Date().toISOString() });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🐰 Pinkmess — Bunny Chat dev server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
