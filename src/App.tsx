import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LeftSidebar } from './components/navigation/LeftSidebar';
import { ChatListPanel } from './components/chat/ChatListPanel';
import { ChatWindow } from './components/chat/ChatWindow';
import { StickerStore } from './components/stickers/StickerStore';
import { ContactsView } from './components/contacts/ContactsView';
import { CallsView } from './components/calls/CallsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { CallManager } from './components/calls/CallManager';
import { GroupCallManager, GroupWebRTCSignal } from './components/calls/GroupCallManager';
import { NewChatModal } from './components/chat/NewChatModal';
import { AddGroupMembersModal } from './components/chat/AddGroupMembersModal';
import { CustomStickerModal } from './components/stickers/CustomStickerModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { User, Conversation, Message, CallState, GroupCallParticipant, GroupCallState, StickerPack, UserStatus, MissedCallRequest, LocationSession } from './types';
import { getSocket } from './lib/socket';
import { getStickerCatalog } from './lib/stickersData';
import { loadImportedStickerPacks } from './lib/importedStickers';
import { bunnyAudio } from './lib/sounds';
import {
  getNotificationPermission,
  requestPinkmessNotifications,
  showPinkmessNotification,
  syncPinkmessPushSubscription
} from './lib/notifications';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('messages');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('pinkmess_logged_in') === 'true';
  });
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>(getStickerCatalog());
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [missedCalls, setMissedCalls] = useState<MissedCallRequest[]>([]);
  const [locationSession, setLocationSession] = useState<LocationSession | null>(null);

  // Modals state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showAddGroupMembersModal, setShowAddGroupMembersModal] = useState(false);
  const [newChatInitialType, setNewChatInitialType] = useState<'direct' | 'group'>('direct');
  const [showCustomStickerModal, setShowCustomStickerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Call state
  const [callState, setCallState] = useState<CallState>({
    active: false,
    callId: null,
    targetUser: null,
    type: 'audio',
    direction: 'outgoing',
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    duration: 0
  });
  const [groupCallState, setGroupCallState] = useState<GroupCallState>({
    active: false,
    callId: null,
    conversationId: null,
    type: 'audio',
    direction: 'connected',
    hostUserId: null,
    participants: [],
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    duration: 0
  });
  const [groupCallSignal, setGroupCallSignal] = useState<GroupWebRTCSignal | null>(null);

  const typingTimeoutRef = useRef<number | null>(null);
  const locationWatchersRef = useRef<Map<string, number>>(new Map());

  const loadMissedCalls = useCallback(async (userId: string) => {
    const response = await fetch(`/api/calls/missed?userId=${encodeURIComponent(userId)}`);
    const data = response.ok ? await response.json() : [];
    setMissedCalls(Array.isArray(data) ? data : []);
  }, []);

  const loadUserConversations = useCallback(async (userId: string) => {
    const response = await fetch(`/api/conversations?userId=${encodeURIComponent(userId)}`);
    const data = response.ok ? await response.json() : [];
    setConversations(Array.isArray(data) ? data : []);
    const requestedConversationId = new URLSearchParams(window.location.search).get('conversation');
    const requestedCallRequestId = new URLSearchParams(window.location.search).get('call_request');
    if (requestedCallRequestId) setCurrentTab('notifications');
    setActiveConversationId((currentId) => {
      if (requestedConversationId && Array.isArray(data) && data.some((conversation: Conversation) => conversation.id === requestedConversationId)) {
        window.history.replaceState({}, document.title, window.location.pathname);
        return requestedConversationId;
      }
      if (requestedCallRequestId) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (currentId && Array.isArray(data) && data.some((conversation: Conversation) => conversation.id === currentId)) {
        return currentId;
      }
      return data[0]?.id || null;
    });
    if (!Array.isArray(data) || data.length === 0) setMessages([]);
  }, []);

  // 1. Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersRes, customPacksRes, sessionRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/stickers/custom'),
          fetch('/api/auth/session', { credentials: 'same-origin' })
        ]);

        const usersData: User[] = usersRes.ok ? await usersRes.json() : [];
        if (usersRes.ok) setUsers(usersData);

        const googleCode = new URLSearchParams(window.location.search).get('google_code');
        const googleError = new URLSearchParams(window.location.search).get('google_error');
        let authenticatedUser: User | null = null;

        if (googleCode) {
          const googleSession = await fetch(`/api/auth/google/session?code=${encodeURIComponent(googleCode)}`);
          if (googleSession.ok) {
            const sessionData = await googleSession.json();
            authenticatedUser = sessionData.user || null;
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (!authenticatedUser && sessionRes.ok) {
          const sessionData = await sessionRes.json();
          authenticatedUser = sessionData.user || null;
        }

        if (!authenticatedUser && usersRes.ok) {
          const savedUserId = localStorage.getItem('pinkmess_user_id') || localStorage.getItem('hustmess_user_id');
          const matched = usersData.find((u: User) => u.id === savedUserId);
          if (
            matched &&
            (localStorage.getItem('pinkmess_logged_in') === 'true' ||
              localStorage.getItem('hustmess_logged_in') === 'true')
          ) {
            authenticatedUser = matched;
          }
        }

        if (authenticatedUser) {
          setCurrentUser(authenticatedUser);
          setIsLoggedIn(true);
          localStorage.setItem('pinkmess_logged_in', 'true');
          localStorage.setItem('pinkmess_user_id', authenticatedUser.id);
          localStorage.removeItem('hustmess_logged_in');
          localStorage.removeItem('hustmess_user_id');
          await loadUserConversations(authenticatedUser.id);
        } else if (usersRes.ok && sessionRes.status === 401) {
          // Only an explicit logout removes the local markers. Keeping them
          // avoids forcing a user to re-login during a short Render wake-up or
          // a transient API/database retry.
          setCurrentUser(null);
          setIsLoggedIn(false);
          setConversations([]);
          setActiveConversationId(null);
          if (googleError) console.warn('Google OAuth failed:', googleError);
        }

        if (customPacksRes.ok) {
          const customPacks = await customPacksRes.json();
          if (Array.isArray(customPacks) && customPacks.length > 0) {
            setStickerPacks((prev) => [...prev, ...customPacks]);
          }
        }

        try {
          const importedPacks = await loadImportedStickerPacks();
          setStickerPacks((prev) => [...prev, ...importedPacks]);
        } catch (err) {
          console.warn('Không thể tải kho sticker từ ZIP:', err);
        }
      } catch (err) {
        console.warn('Error fetching initial data:', err);
      } finally {
        setIsAuthResolved(true);
      }
    };

    fetchInitialData();
  }, [loadUserConversations]);

  useEffect(() => {
    if (!currentUser) return;
    void syncPinkmessPushSubscription(currentUser.id).catch((error) => {
      console.warn('Không thể đồng bộ thông báo Pinkmess:', error);
    });
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) {
      setMissedCalls([]);
      return;
    }
    void loadMissedCalls(currentUser.id).catch((error) => {
      console.warn('Không thể tải cuộc gọi nhỡ:', error);
    });
  }, [currentUser?.id, loadMissedCalls]);

  // 2. Fetch Messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    if (!currentUser) return;

    fetch(`/api/conversations/${activeConversationId}/messages?userId=${encodeURIComponent(currentUser.id)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMessages(data))
      .catch((err) => console.error('Error fetching messages:', err));
  }, [activeConversationId, currentUser]);

  const stopLocationWatcher = useCallback((sessionId: string) => {
    const watchId = locationWatchersRef.current.get(sessionId);
    if (watchId === undefined || !navigator.geolocation) return;
    navigator.geolocation.clearWatch(watchId);
    locationWatchersRef.current.delete(sessionId);
  }, []);

  const startLocationWatcher = useCallback((session: LocationSession) => {
    if (!currentUser || locationWatchersRef.current.has(session.sessionId)) return;
    if (!navigator.geolocation) {
      window.alert('Thiết bị này chưa hỗ trợ định vị. Bạn thử mở Pinkmess bằng Safari hoặc Chrome nhé.');
      return;
    }

    setLocationSession((previous) =>
      previous?.sessionId === session.sessionId
        ? { ...previous, locations: { ...session.locations, ...previous.locations } }
        : session
    );

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        getSocket().emit('location:update', {
          sessionId: session.sessionId,
          conversationId: session.conversationId,
          latitude,
          longitude,
          accuracy
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          window.alert('Bạn đã tắt quyền vị trí cho Pinkmess. Hãy bật Location trong cài đặt trình duyệt để tiếp tục chia sẻ nhé.');
        } else {
          window.alert('Pinkmess tạm thời chưa lấy được vị trí mới. Bạn kiểm tra GPS hoặc kết nối mạng nhé.');
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
    locationWatchersRef.current.set(session.sessionId, watchId);
  }, [currentUser]);

  const stopLocationSharing = useCallback(() => {
    if (!locationSession) return;
    getSocket().emit('location:stop', { sessionId: locationSession.sessionId });
  }, [locationSession]);

  // 3. Socket.IO Listeners
  useEffect(() => {
    const socket = getSocket();

    if (currentUser) {
      socket.emit('user:join', currentUser.id);
    }

    const handleSocketConnect = () => {
      if (currentUser) socket.emit('user:join', currentUser.id);
    };

    // New incoming message
    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Play chime if message is from another user
      if (currentUser && newMsg.senderId !== currentUser.id) {
        bunnyAudio.playReceiveSound();
        if (document.visibilityState === 'visible' && newMsg.conversationId !== activeConversationId) {
          void showPinkmessNotification(
            `${newMsg.senderName} đang nhắn nè 💌`,
            newMsg.type === 'IMAGE'
              ? '🖼️ Gửi bạn một tấm ảnh dễ thương'
              : newMsg.type === 'LOCATION'
              ? '📍 Đã chia sẻ vị trí Google Maps'
              : newMsg.type === 'STICKER' || newMsg.type === 'GIF'
              ? '🐰 Gửi bạn một sticker đáng yêu'
              : newMsg.content || 'Có tin nhắn mới cho bạn 🌸',
            { conversationId: newMsg.conversationId }
          );
        }
      }

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === newMsg.conversationId
            ? {
                ...c,
                updatedAt: newMsg.createdAt,
                lastMessage: {
                  text:
                    newMsg.type === 'STICKER'
                      ? '🐰 [Sticker]'
                      : newMsg.type === 'IMAGE'
                      ? '🖼️ [Ảnh]'
                      : newMsg.type === 'FILE'
                      ? `📎 ${newMsg.attachments?.[0]?.name || 'Tệp đính kèm'}`
                      : newMsg.type === 'LOCATION'
                      ? '📍 Đã chia sẻ vị trí'
                      : newMsg.type === 'SYSTEM' && newMsg.callId
                      ? '📞 Đang có cuộc gọi nhóm — chạm để tham gia'
                      : newMsg.content,
                  type: newMsg.type,
                  senderName: newMsg.senderName,
                  timestamp: newMsg.createdAt
                }
              }
            : c
        )
      );
    };

    const handleConversationNew = (conversation: Conversation) => {
      if (!currentUser || !conversation.participants.includes(currentUser.id)) return;
      setConversations((prev) => (prev.some((item) => item.id === conversation.id) ? prev : [conversation, ...prev]));
    };

    const handleConversationUpdated = (conversation: Conversation) => {
      if (!currentUser || !conversation.participants.includes(currentUser.id)) return;
      setConversations((prev) => {
        if (!prev.some((item) => item.id === conversation.id)) return [conversation, ...prev];
        return prev.map((item) => (item.id === conversation.id ? conversation : item));
      });
    };

    // Reaction update
    const handleReactionUpdated = ({ messageId, reactions, conversationId }: any) => {
      if (conversationId === activeConversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
        );
      }
    };

    // Message update (edit or pin)
    const handleMessageUpdated = (updatedMsg: Message) => {
      if (updatedMsg.conversationId === activeConversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
        );
      }
    };

    // Message delete
    const handleMessageDeleted = ({ messageId, conversationId }: any) => {
      if (conversationId === activeConversationId) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    };

    // Typing status
    const handleTypingStatus = ({ conversationId, userName, isTyping }: any) => {
      if (conversationId === activeConversationId) {
        if (isTyping) {
          setTypingUser(userName);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = window.setTimeout(() => setTypingUser(null), 3000);
        } else {
          setTypingUser(null);
        }
      }
    };

    const handleLocationRequestSent = () => {
      window.alert('Đã gửi yêu cầu chia sẻ vị trí trực tiếp. Chờ người kia đồng ý nhé 💗');
    };

    const handleIncomingLocationRequest = (payload: any) => {
      if (!currentUser || !payload?.requestId || !payload?.requester) return;
      const accepted = window.confirm(
        `${payload.requester.name} muốn chia sẻ vị trí trực tiếp với bạn. Nếu đồng ý, cả hai sẽ thấy vị trí cập nhật liên tục cho đến khi một bên dừng. Bạn đồng ý chứ?`
      );
      socket.emit('location:respond', { requestId: payload.requestId, accepted });
    };

    const handleLocationSessionStarted = (payload: any) => {
      if (!currentUser || !payload?.sessionId || !payload?.conversationId) return;
      const session: LocationSession = {
        sessionId: payload.sessionId,
        conversationId: payload.conversationId,
        requesterId: payload.requesterId,
        targetUserId: payload.targetUserId,
        startedAt: payload.startedAt || new Date().toISOString(),
        locations: payload.locations || {}
      };
      startLocationWatcher(session);
    };

    const handleLocationUpdated = (payload: any) => {
      if (!payload?.sessionId || !payload?.userId) return;
      setLocationSession((previous) => {
        if (!previous || previous.sessionId !== payload.sessionId) return previous;
        return {
          ...previous,
          locations: {
            ...previous.locations,
            [payload.userId]: {
              latitude: Number(payload.latitude),
              longitude: Number(payload.longitude),
              accuracy: Number.isFinite(Number(payload.accuracy)) ? Number(payload.accuracy) : undefined,
              updatedAt: payload.updatedAt || new Date().toISOString(),
              mapUrl: payload.mapUrl
            }
          }
        };
      });
    };

    const handleLocationSessionStopped = (payload: any) => {
      if (!payload?.sessionId) return;
      stopLocationWatcher(payload.sessionId);
      setLocationSession((previous) => previous?.sessionId === payload.sessionId ? null : previous);
    };

    const handleLocationConsentDeclined = () => {
      window.alert('Người kia chưa đồng ý chia sẻ vị trí lần này nhé.');
    };

    const handleLocationRequestUnavailable = (payload: any) => {
      window.alert(payload?.message || 'Người kia cần online để xác nhận chia sẻ vị trí.');
    };

    // Presence update
    const handlePresenceUpdate = ({ userId, status, statusMessage }: any) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status, statusMessage: statusMessage || u.statusMessage } : u))
      );
    };

    const handleProfileUpdated = (updatedUser: User) => {
      setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      setCurrentUser((prev) => (prev?.id === updatedUser.id ? { ...prev, ...updatedUser } : prev));
    };

    // WebRTC Calls
    const handleIncomingCall = (payload: any) => {
      if (currentUser && payload.targetUserId === currentUser.id) {
        setCallState({
          active: true,
          callId: payload.callId,
          targetUser: payload.fromUser,
          type: payload.type,
          direction: 'incoming',
          isInitiator: false,
          isMuted: false,
          isVideoOff: false,
          remoteIsMuted: false,
          remoteIsVideoOff: false,
          isScreenSharing: false,
          duration: 0
        });
      }
    };

    const handleCallAccepted = (payload: any) => {
      if (callState.callId === payload.callId) {
        setCallState((prev) => ({ ...prev, direction: 'connected' }));
      }
    };

    const handleCallRejected = () => {
      setCallState((prev) => ({ ...prev, active: false }));
    };

    const handleCallEnded = () => {
      setCallState((prev) => ({ ...prev, active: false }));
    };

    const handleCallUnavailable = (payload: any) => {
      setCallState((prev) => ({ ...prev, active: false }));
      if (payload?.offline) {
        void (currentUser ? loadMissedCalls(currentUser.id) : Promise.resolve());
        window.alert(
          payload.notifyQueued
            ? 'Người ấy đang offline. Pinkmess đã gửi thông báo cuộc gọi tới thiết bị của họ rồi nè 💌'
            : 'Người ấy đang offline. Pinkmess đã lưu cuộc gọi nhỡ để họ thấy và gọi lại khi mở app nhé 💗'
        );
        return;
      }
      window.alert('Người này hiện chưa thể nhận cuộc gọi, bạn thử lại sau nhé.');
    };

    const handleCallMediaState = (payload: any) => {
      setCallState((prev) =>
        prev.callId === payload.callId
          ? { ...prev, remoteIsMuted: Boolean(payload.isMuted), remoteIsVideoOff: Boolean(payload.isVideoOff) }
          : prev
      );
    };

    const asGroupParticipant = (rawUser: User | null | undefined, joined: boolean): GroupCallParticipant | null => {
      if (!rawUser?.id) return null;
      return { user: rawUser, isMuted: false, isVideoOff: false, joined };
    };

    const handleIncomingGroupCall = (payload: any) => {
      if (!currentUser || !payload?.callId || !payload?.conversationId) return;
      const rawParticipants = Array.isArray(payload.participants) ? payload.participants : [];
      const participants = rawParticipants
        .map((user: User) => asGroupParticipant(user, user.id === payload.hostUserId))
        .filter(Boolean) as GroupCallParticipant[];
      if (!participants.some((participant) => participant.user.id === currentUser.id)) {
        const self = asGroupParticipant(currentUser, false);
        if (self) participants.push(self);
      }
      setGroupCallState({
        active: true,
        callId: payload.callId,
        conversationId: payload.conversationId,
        type: payload.type === 'video' ? 'video' : 'audio',
        direction: 'incoming',
        hostUserId: payload.hostUserId || payload.fromUser?.id || null,
        participants,
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
        duration: 0
      });
    };

    const handleGroupCallStarted = (payload: any) => {
      if (!currentUser || !payload?.callId) return;
      const participants = (Array.isArray(payload.participants) ? payload.participants : [])
        .map((user: User) => asGroupParticipant(user, user.id === currentUser.id))
        .filter(Boolean) as GroupCallParticipant[];
      setGroupCallState((previous) => previous.callId === payload.callId
        ? { ...previous, participants: participants.length ? participants : previous.participants }
        : previous);
    };

    const handleGroupCallJoined = (payload: any) => {
      if (!currentUser || !payload?.callId) return;
      const participants = (Array.isArray(payload.participants) ? payload.participants : [])
        .map((user: User) => asGroupParticipant(user, true))
        .filter(Boolean) as GroupCallParticipant[];
      if (!participants.some((participant) => participant.user.id === currentUser.id)) {
        const self = asGroupParticipant(currentUser, true);
        if (self) participants.push(self);
      }
      setGroupCallState((previous) => previous.callId === payload.callId ? {
        ...previous,
        active: true,
        direction: 'connected',
        participants,
        hostUserId: payload.hostUserId || previous.hostUserId
      } : previous);
    };

    const handleGroupParticipantJoined = (payload: any) => {
      if (!payload?.callId || !payload?.participant) return;
      setGroupCallState((previous) => {
        if (previous.callId !== payload.callId) return previous;
        const next = asGroupParticipant(payload.participant as User, true);
        if (!next) return previous;
        const exists = previous.participants.some((participant) => participant.user.id === next.user.id);
        return {
          ...previous,
          participants: exists
            ? previous.participants.map((participant) => participant.user.id === next.user.id ? { ...participant, user: next.user, joined: true } : participant)
            : [...previous.participants, next]
        };
      });
    };

    const handleGroupParticipantLeft = (payload: any) => {
      if (!payload?.callId || !payload?.userId) return;
      setGroupCallState((previous) => previous.callId === payload.callId
        ? { ...previous, participants: previous.participants.map((participant) => participant.user.id === payload.userId ? { ...participant, joined: false } : participant) }
        : previous);
    };

    const handleGroupCallMediaState = (payload: any) => {
      if (!payload?.callId || !payload?.fromUserId) return;
      setGroupCallState((previous) => previous.callId === payload.callId
        ? {
            ...previous,
            participants: previous.participants.map((participant) => participant.user.id === payload.fromUserId
              ? { ...participant, isMuted: Boolean(payload.isMuted), isVideoOff: Boolean(payload.isVideoOff) }
              : participant)
          }
        : previous);
    };

    const handleGroupCallEnded = (payload: any) => {
      if (!payload?.callId) return;
      setGroupCallState((previous) => previous.callId === payload.callId ? { ...previous, active: false } : previous);
      setGroupCallSignal(null);
    };

    const handleGroupCallUnavailable = (payload: any) => {
      if (!payload?.callId) return;
      setGroupCallState((previous) => previous.callId === payload.callId ? { ...previous, active: false } : previous);
      window.alert(payload.message || 'Không thể mở cuộc gọi nhóm lúc này.');
    };

    const handleGroupWebRTCSignal = (payload: GroupWebRTCSignal) => {
      if (!payload?.callId || payload.targetUserId !== currentUser?.id) return;
      setGroupCallSignal(payload);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('connect', handleSocketConnect);
    socket.on('conversation:new', handleConversationNew);
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('message:reaction-updated', handleReactionUpdated);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('typing:status', handleTypingStatus);
    socket.on('location:request-sent', handleLocationRequestSent);
    socket.on('location:incoming-request', handleIncomingLocationRequest);
    socket.on('location:session-started', handleLocationSessionStarted);
    socket.on('location:updated', handleLocationUpdated);
    socket.on('location:session-stopped', handleLocationSessionStopped);
    socket.on('location:consent-declined', handleLocationConsentDeclined);
    socket.on('location:request-unavailable', handleLocationRequestUnavailable);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('user:profile-updated', handleProfileUpdated);
    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);
    socket.on('call:unavailable', handleCallUnavailable);
    socket.on('call:media-state', handleCallMediaState);
    socket.on('group-call:incoming', handleIncomingGroupCall);
    socket.on('group-call:started', handleGroupCallStarted);
    socket.on('group-call:joined', handleGroupCallJoined);
    socket.on('group-call:participant-joined', handleGroupParticipantJoined);
    socket.on('group-call:participant-left', handleGroupParticipantLeft);
    socket.on('group-call:media-state', handleGroupCallMediaState);
    socket.on('group-call:ended', handleGroupCallEnded);
    socket.on('group-call:unavailable', handleGroupCallUnavailable);
    socket.on('group-webrtc:signal', handleGroupWebRTCSignal);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('connect', handleSocketConnect);
      socket.off('conversation:new', handleConversationNew);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('message:reaction-updated', handleReactionUpdated);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('typing:status', handleTypingStatus);
      socket.off('location:request-sent', handleLocationRequestSent);
      socket.off('location:incoming-request', handleIncomingLocationRequest);
      socket.off('location:session-started', handleLocationSessionStarted);
      socket.off('location:updated', handleLocationUpdated);
      socket.off('location:session-stopped', handleLocationSessionStopped);
      socket.off('location:consent-declined', handleLocationConsentDeclined);
      socket.off('location:request-unavailable', handleLocationRequestUnavailable);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('user:profile-updated', handleProfileUpdated);
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:ended', handleCallEnded);
      socket.off('call:unavailable', handleCallUnavailable);
      socket.off('call:media-state', handleCallMediaState);
      socket.off('group-call:incoming', handleIncomingGroupCall);
      socket.off('group-call:started', handleGroupCallStarted);
      socket.off('group-call:joined', handleGroupCallJoined);
      socket.off('group-call:participant-joined', handleGroupParticipantJoined);
      socket.off('group-call:participant-left', handleGroupParticipantLeft);
      socket.off('group-call:media-state', handleGroupCallMediaState);
      socket.off('group-call:ended', handleGroupCallEnded);
      socket.off('group-call:unavailable', handleGroupCallUnavailable);
      socket.off('group-webrtc:signal', handleGroupWebRTCSignal);
    };
  }, [activeConversationId, currentUser, callState.callId, loadMissedCalls, startLocationWatcher, stopLocationWatcher]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('pinkmess_logged_in', 'true');
    localStorage.setItem('pinkmess_user_id', user.id);
    localStorage.removeItem('hustmess_logged_in');
    localStorage.removeItem('hustmess_user_id');
    setUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
    setConversations([]);
    setActiveConversationId(null);
    setMessages([]);
    void loadUserConversations(user.id);
    const socket = getSocket();
    socket.emit('user:join', user.id);
  };

  const handleLogout = () => {
    locationWatchersRef.current.forEach((watchId) => navigator.geolocation?.clearWatch(watchId));
    locationWatchersRef.current.clear();
    setLocationSession(null);
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsMobileChatOpen(false);
    setConversations([]);
    setActiveConversationId(null);
    setMessages([]);
    localStorage.removeItem('pinkmess_logged_in');
    localStorage.removeItem('pinkmess_user_id');
    localStorage.removeItem('hustmess_logged_in');
    localStorage.removeItem('hustmess_user_id');
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined);
    getSocket().emit('user:leave');
  };

  // Update Status
  const handleUpdateStatus = (status: UserStatus) => {
    if (!currentUser) return;
    const socket = getSocket();
    socket.emit('presence:set', { userId: currentUser.id, status });
    setCurrentUser((prev) => (prev ? { ...prev, status } : prev));
  };

  // Send Message
  const handleSendMessage = useCallback(
    (payload: any) => {
      if (!currentUser || !activeConversationId) return;

      const messagePayload = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        conversationId: activeConversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        ...payload
      };

      // Confetti burst for love reactions or romantic stickers
      if (payload.type === 'STICKER' && payload.stickerPackId === 'pack_01') {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#FF82AE', '#FF6F9F', '#FFD6E5']
        });
      }

      const socket = getSocket();
      socket.emit('message:send', messagePayload);
    },
    [currentUser, activeConversationId]
  );

  // Edit Message
  const handleEditMessage = (messageId: string, newContent: string) => {
    const socket = getSocket();
    socket.emit('message:edit', { messageId, newContent });
  };

  // Delete Message
  const handleDeleteMessage = (messageId: string) => {
    const socket = getSocket();
    socket.emit('message:delete', { messageId });
  };

  // Pin Message
  const handlePinMessage = (messageId: string) => {
    const socket = getSocket();
    socket.emit('message:pin', { messageId });
  };

  // React Message
  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const socket = getSocket();
    socket.emit('message:react', { messageId, emoji, userId: currentUser.id });
  };

  // Typing emitter
  const handleTyping = () => {
    if (!currentUser || !activeConversationId) return;
    const socket = getSocket();
    socket.emit('typing:start', {
      conversationId: activeConversationId,
      userId: currentUser.id,
      userName: currentUser.name
    });
  };

  const handleRequestLocation = () => {
    if (!currentUser || !activeConversationId) return;
    const conversation = conversations.find((item) => item.id === activeConversationId);
    if (!conversation || conversation.type !== 'direct') {
      window.alert('Chia sẻ vị trí hiện chỉ hỗ trợ cuộc trò chuyện riêng tư 1-1 nhé.');
      return;
    }

    if (locationSession?.conversationId === activeConversationId) {
      window.alert('Hai bạn đang chia sẻ vị trí trực tiếp rồi nè. Bạn có thể dừng ở bảng vị trí trong chat nhé.');
      return;
    }

    getSocket().emit('location:request', { conversationId: activeConversationId });
  };

  // Start Call
  const handleStartGroupCall = (type: 'audio' | 'video') => {
    if (!currentUser || !activeConversationId) return;
    const conversation = conversations.find((item) => item.id === activeConversationId);
    if (!conversation || conversation.type !== 'group') return;

    const participants = conversation.participants
      .map((userId) => users.find((user) => user.id === userId) || (userId === currentUser.id ? currentUser : null))
      .filter(Boolean) as User[];
    if (participants.length < 2) {
      window.alert('Nhóm cần ít nhất 2 thành viên để bắt đầu cuộc gọi nhé.');
      return;
    }
    if (participants.length > 6) {
      window.alert('Cuộc gọi nhóm Pinkmess hỗ trợ tối đa 6 người để giữ latency thấp và hình tiếng mượt nhất.');
      return;
    }

    const callId = `group_call_${Date.now()}`;
    setGroupCallState({
      active: true,
      callId,
      conversationId: conversation.id,
      type,
      direction: 'connected',
      hostUserId: currentUser.id,
      participants: participants.map((user) => ({ user, isMuted: false, isVideoOff: false, joined: user.id === currentUser.id })),
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      duration: 0
    });
    getSocket().emit('group-call:invite', {
      callId,
      conversationId: conversation.id,
      type,
      participantIds: participants.map((user) => user.id)
    });
  };

  const handleStartCall = (type: 'audio' | 'video', targetUserParam?: User) => {
    if (!currentUser) return;

    const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
    if (activeConversation?.type === 'group' && !targetUserParam) {
      handleStartGroupCall(type);
      return;
    }

    let target = targetUserParam;
    if (!target) {
      const activeConv = conversations.find((c) => c.id === activeConversationId);
      const otherId = activeConv?.participants.find((p) => p !== currentUser.id);
      target = users.find((u) => u.id === otherId);
    }

    if (!target || target.id === currentUser.id) return;

    const callId = `call_${Date.now()}`;
    setCallState({
      active: true,
      callId,
      targetUser: target,
      type,
      direction: 'outgoing',
      isInitiator: true,
      isMuted: false,
      isVideoOff: false,
      remoteIsMuted: false,
      remoteIsVideoOff: false,
      isScreenSharing: false,
      duration: 0
    });

    const socket = getSocket();
    socket.emit('call:invite', {
      callId,
      type,
      fromUser: currentUser,
      targetUserId: target.id
    });
  };

  const markMissedCallAsRead = async (request: MissedCallRequest) => {
    if (!currentUser) return;
    setMissedCalls((prev) => prev.filter((item) => item.id !== request.id));
    await fetch(`/api/calls/missed/${encodeURIComponent(request.id)}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    }).catch(() => undefined);
  };

  const handleCallBackFromNotification = (request: MissedCallRequest) => {
    void markMissedCallAsRead(request);
    if (request.fromUser) handleStartCall(request.type, request.fromUser);
  };

  const handleToggleCallMute = () => {
    setCallState((prev) => {
      const isMuted = !prev.isMuted;
      if (prev.callId) {
        getSocket().emit('call:media-state', { callId: prev.callId, isMuted, isVideoOff: prev.isVideoOff });
      }
      return { ...prev, isMuted };
    });
  };

  const handleToggleCallVideo = () => {
    setCallState((prev) => {
      const isVideoOff = !prev.isVideoOff;
      if (prev.callId) {
        getSocket().emit('call:media-state', { callId: prev.callId, isMuted: prev.isMuted, isVideoOff });
      }
      return { ...prev, isVideoOff };
    });
  };

  const handleEnableNotifications = async () => {
    if (!currentUser) return;
    const enabled = await requestPinkmessNotifications(currentUser.id);
    if (!enabled && getNotificationPermission() !== 'granted') {
      window.alert('Hãy cho phép thông báo Pinkmess trong phần Cài đặt của trình duyệt nhé 💌');
    }
  };

  const handleAcceptCall = () => {
    if (!callState.callId) return;
    const socket = getSocket();
    socket.emit('call:accept', {
      callId: callState.callId,
      acceptedBy: currentUser?.id,
      targetUserId: callState.targetUser?.id
    });
    setCallState((prev) => ({ ...prev, direction: 'connected' }));
  };

  const handleRejectCall = () => {
    if (!callState.callId) return;
    const socket = getSocket();
    socket.emit('call:reject', { callId: callState.callId });
    setCallState((prev) => ({ ...prev, active: false }));
  };

  const handleEndCall = () => {
    if (!callState.callId) return;
    const socket = getSocket();
    socket.emit('call:end', { callId: callState.callId });
    setCallState((prev) => ({ ...prev, active: false }));
  };

  const handleAcceptGroupCall = () => {
    if (!groupCallState.callId || !groupCallState.conversationId) return;
    setGroupCallState((previous) => ({ ...previous, direction: 'joining' }));
    getSocket().emit('group-call:join', {
      callId: groupCallState.callId,
      conversationId: groupCallState.conversationId
    });
  };

  const handleJoinGroupCallFromMessage = (message: Message) => {
    if (!currentUser || !message.callId || !message.conversationId) return;
    if (groupCallState.active && groupCallState.callId !== message.callId) {
      window.alert('Bạn đang ở một cuộc gọi nhóm khác. Hãy rời cuộc gọi hiện tại trước nhé.');
      return;
    }

    const conversation = conversations.find((item) => item.id === message.conversationId);
    const participantIds = message.callParticipantIds?.length
      ? message.callParticipantIds
      : conversation?.participants || [];
    const participants = participantIds
      .map((userId) => users.find((user) => user.id === userId) || (userId === currentUser.id ? currentUser : null))
      .filter(Boolean) as User[];
    if (!participants.some((user) => user.id === currentUser.id)) participants.push(currentUser);

    setGroupCallState({
      active: true,
      callId: message.callId,
      conversationId: message.conversationId,
      type: message.callType === 'video' ? 'video' : 'audio',
      direction: 'joining',
      hostUserId: message.callHostUserId || message.senderId,
      participants: participants.map((user) => ({
        user,
        isMuted: false,
        isVideoOff: false,
        joined: user.id === (message.callHostUserId || message.senderId)
      })),
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      duration: 0
    });
    getSocket().emit('group-call:join', {
      callId: message.callId,
      conversationId: message.conversationId
    });
  };

  const handleRejectGroupCall = () => {
    if (groupCallState.callId) getSocket().emit('group-call:reject', { callId: groupCallState.callId });
    setGroupCallState((previous) => ({ ...previous, active: false }));
    setGroupCallSignal(null);
  };

  const handleEndGroupCall = () => {
    if (groupCallState.callId) {
      getSocket().emit('group-call:leave', {
        callId: groupCallState.callId,
        conversationId: groupCallState.conversationId
      });
    }
    setGroupCallState((previous) => ({ ...previous, active: false }));
    setGroupCallSignal(null);
  };

  const handleToggleGroupMute = () => {
    setGroupCallState((previous) => {
      const isMuted = !previous.isMuted;
      if (previous.callId) {
        getSocket().emit('group-call:media-state', {
          callId: previous.callId,
          isMuted,
          isVideoOff: previous.isVideoOff
        });
      }
      return { ...previous, isMuted };
    });
  };

  const handleToggleGroupVideo = () => {
    setGroupCallState((previous) => {
      const isVideoOff = !previous.isVideoOff;
      if (previous.callId) {
        getSocket().emit('group-call:media-state', {
          callId: previous.callId,
          isMuted: previous.isMuted,
          isVideoOff
        });
      }
      return { ...previous, isVideoOff };
    });
  };

  // Open a conversation from the global user search.
  const handleOpenUserChat = async (targetUser: User) => {
    if (!currentUser || targetUser.id === currentUser.id) return;

    const existingConversation = conversations.find(
      (conversation) =>
        conversation.type === 'direct' &&
        conversation.participants.includes(currentUser.id) &&
        conversation.participants.includes(targetUser.id)
    );

    if (existingConversation) {
      setActiveConversationId(existingConversation.id);
      setIsMobileChatOpen(true);
      setCurrentTab('messages');
      return;
    }

    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'direct',
        name: targetUser.name,
        avatar: targetUser.avatar,
        participants: [currentUser.id, targetUser.id],
        userId: currentUser.id
      })
    });

    if (!res.ok) return;
    const newConversation = await res.json();
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setIsMobileChatOpen(true);
    setCurrentTab('messages');
  };

  // Create Conversation
  const handleCreateConversation = async (
    type: 'direct' | 'group',
    name: string,
    participants: string[]
  ) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        name,
        avatar:
          type === 'group'
            ? '/src/assets/images/bunny_mascot_hero_1791670247958.jpg'
            : users.find((u) => u.id === participants.find((p) => p !== currentUser?.id))?.avatar,
        participants,
        userId: currentUser?.id
      })
    });
    if (res.ok) {
      const newConv = await res.json();
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setCurrentTab('messages');
    }
  };

  // Change Wallpaper
  const handleChangeWallpaper = async (wallpaper: string) => {
    if (!activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, wallpaper } : c))
    );
    await fetch(`/api/conversations/${activeConversationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallpaper, userId: currentUser?.id })
    });
  };

  const handleUpdateConversation = async (updates: Partial<Conversation>) => {
    if (!currentUser || !activeConversationId) return;
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeConversationId ? { ...conversation, ...updates } : conversation
      )
    );
    await fetch(`/api/conversations/${activeConversationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, ...updates })
    }).catch((error) => console.warn('Could not update conversation settings:', error));
  };

  const handleAddGroupMembers = async (userIds: string[]) => {
    if (!currentUser || !activeConversationId) return;
    const conversation = conversations.find((item) => item.id === activeConversationId);
    if (!conversation || conversation.type !== 'group') return;
    const participants = [...new Set([...conversation.participants, ...userIds])];
    if (participants.length > 6) {
      window.alert('Nhóm Pinkmess tối đa 6 thành viên để chat và gọi mượt nhất nhé.');
      return;
    }
    const response = await fetch(`/api/conversations/${conversation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, participants })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error || 'Chưa thể thêm thành viên vào nhóm lúc này.');
      return;
    }
    const updatedConversation = await response.json();
    setConversations((previous) => previous.map((item) => item.id === updatedConversation.id ? updatedConversation : item));
    setShowAddGroupMembersModal(false);
  };

  const handleForwardMessage = (message: Message, targetConversationId: string) => {
    if (!currentUser || message.type === 'LOCATION') return;
    getSocket().emit('message:send', {
      id: `msg_forward_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversationId: targetConversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: message.type,
      content: message.content,
      stickerId: message.stickerId,
      stickerUrl: message.stickerUrl,
      stickerPackId: message.stickerPackId,
      stickerName: message.stickerName,
      isAnimatedSticker: message.isAnimatedSticker,
      fontFamily: message.fontFamily,
      audioDuration: message.audioDuration,
      audioMimeType: message.audioMimeType,
      attachments: message.attachments
    });
  };

  // Toggle Favorite Sticker
  const handleToggleFavoriteSticker = (stickerId: string) => {
    if (!currentUser) return;
    const currentFavs = currentUser.favoriteStickers || [];
    const newFavs = currentFavs.includes(stickerId)
      ? currentFavs.filter((id) => id !== stickerId)
      : [...currentFavs, stickerId];

    setCurrentUser({ ...currentUser, favoriteStickers: newFavs });
    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, favoriteStickers: newFavs })
    });
  };

  // Toggle Install Sticker Pack
  const handleToggleInstallPack = (packId: string) => {
    if (!currentUser) return;
    const currentInstalled = currentUser.installedPacks || [];
    const newInstalled = currentInstalled.includes(packId)
      ? currentInstalled.filter((id) => id !== packId)
      : [...currentInstalled, packId];

    setCurrentUser({ ...currentUser, installedPacks: newInstalled });
    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, installedPacks: newInstalled })
    });
  };

  // Save Custom Sticker Pack
  const handleSaveCustomPack = async (packData: any) => {
    const res = await fetch('/api/stickers/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packData)
    });
    if (res.ok) {
      const newPack = await res.json();
      setStickerPacks((prev) => [...prev, newPack]);
      if (currentUser) {
        handleToggleInstallPack(newPack.id);
      }
    }
  };

  // Reset Demo
  const handleResetDemo = async () => {
    await fetch('/api/admin/reset-demo', { method: 'POST' });
    window.location.reload();
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  if (!isAuthResolved) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FFF7FB] text-[#FF4F8B] font-bold">
        Đang khôi phục phiên Pinkmess… 🐰
      </div>
    );
  }

  if (!currentUser || !isLoggedIn) {
    return (
      <AuthModal
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="pinkmess-app-bg h-[100dvh] w-screen overflow-hidden flex flex-col md:flex-row">
      {/* Left Navigation Bar */}
      <LeftSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenSettings={() => setShowSettingsModal(true)}
        onUpdateStatus={handleUpdateStatus}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden order-1 md:order-none">
        {currentTab === 'messages' && (
          <>
            <div className={`${isMobileChatOpen ? 'hidden md:flex' : 'flex'} min-w-0 w-full md:w-auto`}>
              <ChatListPanel
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={(id) => {
                  setActiveConversationId(id);
                  setIsMobileChatOpen(true);
                }}
                onNewChat={() => {
                  setNewChatInitialType('direct');
                  setShowNewChatModal(true);
                }}
                users={users}
                currentUserId={currentUser.id}
                notificationPermission={getNotificationPermission()}
                onEnableNotifications={handleEnableNotifications}
              />
            </div>
            <div className={`${isMobileChatOpen ? 'flex' : 'hidden md:flex'} min-w-0 flex-1`}>
              <ChatWindow
                conversation={activeConversation}
                messages={messages}
                currentUser={currentUser}
                allUsers={users}
                onBackToList={() => setIsMobileChatOpen(false)}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onPinMessage={handlePinMessage}
                onReactMessage={handleReactMessage}
                onStartCall={(type, targetUser) => handleStartCall(type, targetUser)}
                typingUser={typingUser}
                onTyping={handleTyping}
                stickerPacks={stickerPacks}
                favoriteStickers={currentUser.favoriteStickers || []}
                recentStickers={['p1_stk_1', 'p1_stk_2', 'panim1_stk_1', 'p2_stk_1']}
                onToggleFavoriteSticker={handleToggleFavoriteSticker}
                onChangeWallpaper={handleChangeWallpaper}
                onRequestLocation={handleRequestLocation}
                locationSession={locationSession?.conversationId === activeConversationId ? locationSession : null}
                onStopLocationSharing={stopLocationSharing}
                availableConversations={conversations}
                onUpdateConversation={handleUpdateConversation}
                onCreateGroupChat={() => {
                  setNewChatInitialType('group');
                  setShowNewChatModal(true);
                }}
                onAddGroupMembers={() => setShowAddGroupMembersModal(true)}
                onJoinGroupCall={handleJoinGroupCallFromMessage}
                onForwardMessage={handleForwardMessage}
              />
            </div>
          </>
        )}

        {currentTab === 'stickers' && (
          <StickerStore
            packs={stickerPacks}
            installedPackIds={currentUser.installedPacks || []}
            onToggleInstallPack={handleToggleInstallPack}
            onOpenCreateCustom={() => setShowCustomStickerModal(true)}
          />
        )}

        {currentTab === 'contacts' && (
          <ContactsView
            users={users}
            currentUser={currentUser}
            onStartChat={handleOpenUserChat}
            onStartCall={(targetUser, type) => handleStartCall(type, targetUser)}
          />
        )}

        {currentTab === 'groups' && (
          <div className="flex-1 flex flex-col h-full bg-[#FFFDFB] p-8 overflow-y-auto">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#4C3441]">Nhóm Chat Của Bạn 💗</h1>
                  <p className="text-xs text-[#927D8A] mt-1">Trò chuyện và gọi nhóm cùng hội bạn bè</p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white text-xs font-bold shadow-md shadow-[#FF82AE]/30"
                >
                  + Tạo nhóm mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conversations
                  .filter((c) => c.type === 'group')
                  .map((grp) => (
                    <div
                      key={grp.id}
                      className="bg-white p-5 rounded-3xl border border-[#F7DDE8] shadow-xs hover:border-[#FF82AE] transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img src={grp.avatar} alt={grp.name} className="w-12 h-12 rounded-2xl object-cover border border-[#FFD6E5]" />
                        <div>
                          <h3 className="font-bold text-sm text-[#4C3441]">{grp.name}</h3>
                          <p className="text-xs text-[#927D8A]">{grp.participants.length} thành viên</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveConversationId(grp.id);
                          setCurrentTab('messages');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#FFF0F6] text-[#FF4F8B] text-xs font-bold hover:bg-[#FFE4F0]"
                      >
                        Vào chat
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'calls' && (
          <CallsView
            users={users}
            currentUser={currentUser}
            onStartCall={(targetUser, type) => handleStartCall(type, targetUser)}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsView
            onOpenStickerStore={() => setCurrentTab('stickers')}
            onOpenMessages={() => setCurrentTab('messages')}
            missedCalls={missedCalls}
            onCallBack={handleCallBackFromNotification}
            onDismissCall={(request) => void markMissedCallAsRead(request)}
          />
        )}
      </div>

      {/* WebRTC Audio / Video Call Manager */}
      <GroupCallManager
        callState={groupCallState}
        currentUser={currentUser}
        signal={groupCallSignal}
        onAcceptCall={handleAcceptGroupCall}
        onRejectCall={handleRejectGroupCall}
        onEndCall={handleEndGroupCall}
        onToggleMute={handleToggleGroupMute}
        onToggleVideo={handleToggleGroupVideo}
      />

      <CallManager
        callState={callState}
        currentUser={currentUser}
        onAcceptCall={handleAcceptCall}
        onRejectCall={handleRejectCall}
        onEndCall={handleEndCall}
        onToggleMute={handleToggleCallMute}
        onToggleVideo={handleToggleCallVideo}
        onToggleScreenShare={() =>
          setCallState((prev) => ({ ...prev, isScreenSharing: !prev.isScreenSharing }))
        }
      />

      {/* Modals */}
      {showNewChatModal && (
        <NewChatModal
          users={users}
          currentUserId={currentUser.id}
          initialChatType={newChatInitialType}
          onClose={() => setShowNewChatModal(false)}
          onCreateConversation={handleCreateConversation}
        />
      )}

      {showAddGroupMembersModal && activeConversation?.type === 'group' && (
        <AddGroupMembersModal
          users={users}
          currentUserId={currentUser.id}
          existingMemberIds={activeConversation.participants}
          onClose={() => setShowAddGroupMembersModal(false)}
          onAddMembers={handleAddGroupMembers}
        />
      )}

      {showCustomStickerModal && (
        <CustomStickerModal
          onClose={() => setShowCustomStickerModal(false)}
          onSavePack={handleSaveCustomPack}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          currentUser={currentUser}
          onClose={() => setShowSettingsModal(false)}
          onUpdateUser={(updates) => {
            setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
            fetch('/api/users/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id, ...updates })
            });
          }}
          onResetDemo={handleResetDemo}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
