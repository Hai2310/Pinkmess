export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'FILE'
  | 'STICKER'
  | 'GIF'
  | 'SYSTEM';

export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface User {
  id: string;
  bunnyId: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  status: UserStatus;
  statusMessage?: string;
  coverImage?: string;
  themePreference?: 'light-pink' | 'midnight-bunny' | 'lavender-dream' | 'minimal-pink';
  chatWallpaper?: string;
  favoriteStickers?: string[];
  installedPacks?: string[];
  createdAt: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: MessageType;
  content: string;
  stickerId?: string;
  stickerUrl?: string;
  stickerPackId?: string;
  stickerName?: string;
  isAnimatedSticker?: boolean;
  audioDuration?: number;
  attachments?: Attachment[];
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  replyToId?: string;
  replyToMessage?: {
    id: string;
    senderName: string;
    content: string;
    type: MessageType;
  };
  isPinned?: boolean;
  isEdited?: boolean;
  createdAt: string;
  readBy?: string[];
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  participants: string[]; // userIds
  lastMessage?: {
    text: string;
    type: MessageType;
    senderName: string;
    timestamp: string;
  };
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  wallpaper?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sticker {
  id: string;
  packId: string;
  name: string;
  keywords: string[];
  emotion: string;
  svgContent: string;
  imageUrl?: string;
  isAnimated?: boolean;
  animationType?: string;
  sortOrder: number;
}

export interface StickerPack {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverSvg: string;
  coverImage?: string;
  category: string;
  author: string;
  stickersCount: number;
  isOfficial: boolean;
  isAnimated: boolean;
  stickers: Sticker[];
  createdAt: string;
}

export interface CallState {
  active: boolean;
  callId: string | null;
  targetUser: User | null;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'connected';
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  duration: number;
  roomId?: string;
}
