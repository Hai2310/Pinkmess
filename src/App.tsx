import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LeftSidebar } from './components/navigation/LeftSidebar';
import { ChatListPanel } from './components/chat/ChatListPanel';
import { ChatWindow } from './components/chat/ChatWindow';
import { StickerStore } from './components/stickers/StickerStore';
import { ContactsView } from './components/contacts/ContactsView';
import { CallsView } from './components/calls/CallsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { CallManager } from './components/calls/CallManager';
import { NewChatModal } from './components/chat/NewChatModal';
import { CustomStickerModal } from './components/stickers/CustomStickerModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { User, Conversation, Message, CallState, StickerPack, UserStatus } from './types';
import { getSocket } from './lib/socket';
import { getStickerCatalog } from './lib/stickersData';
import { loadImportedStickerPacks } from './lib/importedStickers';
import { bunnyAudio } from './lib/sounds';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('messages');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('hustmess_logged_in'));
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>(getStickerCatalog());
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Modals state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
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

  const typingTimeoutRef = useRef<number | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersRes, convsRes, customPacksRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/conversations'),
          fetch('/api/stickers/custom')
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
          const savedUserId = localStorage.getItem('hustmess_user_id');
          const matched = usersData.find((u: any) => u.id === savedUserId);
          if (matched) {
            setCurrentUser(matched);
            setIsLoggedIn(true);
          } else if (usersData.length > 0 && localStorage.getItem('hustmess_logged_in')) {
            setCurrentUser(usersData[0]);
            setIsLoggedIn(true);
          }
        }

        if (convsRes.ok) {
          const convsData = await convsRes.json();
          setConversations(convsData);
          if (convsData.length > 0 && !activeConversationId) {
            setActiveConversationId(convsData[0].id);
          }
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
      }
    };

    fetchInitialData();
  }, []);

  // 2. Fetch Messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    fetch(`/api/conversations/${activeConversationId}/messages`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMessages(data))
      .catch((err) => console.error('Error fetching messages:', err));
  }, [activeConversationId]);

  // 3. Socket.IO Listeners
  useEffect(() => {
    const socket = getSocket();

    if (currentUser) {
      socket.emit('user:join', currentUser.id);
    }

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

    // Presence update
    const handlePresenceUpdate = ({ userId, status, statusMessage }: any) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status, statusMessage: statusMessage || u.statusMessage } : u))
      );
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

    socket.on('message:new', handleNewMessage);
    socket.on('message:reaction-updated', handleReactionUpdated);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('typing:status', handleTypingStatus);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:reaction-updated', handleReactionUpdated);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('typing:status', handleTypingStatus);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:ended', handleCallEnded);
    };
  }, [activeConversationId, currentUser, callState.callId]);

  // Switch Active User (for testing multi-user interactions)
  const handleSwitchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setCurrentUser(target);
    localStorage.setItem('hustmess_user_id', target.id);
    const socket = getSocket();
    socket.emit('user:join', target.id);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('hustmess_logged_in', 'true');
    localStorage.setItem('hustmess_user_id', user.id);
    setUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
    const socket = getSocket();
    socket.emit('user:join', user.id);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsMobileChatOpen(false);
    localStorage.removeItem('hustmess_logged_in');
    localStorage.removeItem('hustmess_user_id');
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

  // Start Call
  const handleStartCall = (type: 'audio' | 'video', targetUserParam?: User) => {
    if (!currentUser) return;

    let target = targetUserParam;
    if (!target) {
      const activeConv = conversations.find((c) => c.id === activeConversationId);
      const otherId = activeConv?.participants.find((p) => p !== currentUser.id);
      target = users.find((u) => u.id === otherId) || users.find((u) => u.id !== currentUser.id);
    }

    if (!target || target.id === currentUser.id) {
      target = users.find((u) => u.id !== currentUser.id) || users[0];
    }

    if (!target) return;

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
        participants: [currentUser.id, targetUser.id]
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
        participants
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
      body: JSON.stringify({ wallpaper })
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
        allUsers={users}
        onSwitchUser={handleSwitchUser}
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
                onNewChat={() => setShowNewChatModal(true)}
                users={users}
                currentUserId={currentUser.id}
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
          />
        )}
      </div>

      {/* WebRTC Audio / Video Call Manager */}
      <CallManager
        callState={callState}
        currentUser={currentUser}
        onAcceptCall={handleAcceptCall}
        onRejectCall={handleRejectCall}
        onEndCall={handleEndCall}
        onToggleMute={() => setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }))}
        onToggleVideo={() => setCallState((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }))}
        onToggleScreenShare={() =>
          setCallState((prev) => ({ ...prev, isScreenSharing: !prev.isScreenSharing }))
        }
      />

      {/* Modals */}
      {showNewChatModal && (
        <NewChatModal
          users={users}
          currentUserId={currentUser.id}
          onClose={() => setShowNewChatModal(false)}
          onCreateConversation={handleCreateConversation}
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
