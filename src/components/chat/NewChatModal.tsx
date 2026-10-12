import React, { useState } from 'react';
import { X, Users, MessageSquare, Check, Sparkles } from 'lucide-react';
import { User } from '../../types';

const MAX_GROUP_MEMBERS = 6;

interface NewChatModalProps {
  users: User[];
  currentUserId: string;
  initialChatType?: 'direct' | 'group';
  onClose: () => void;
  onCreateConversation: (type: 'direct' | 'group', name: string, participants: string[]) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  users,
  currentUserId,
  initialChatType = 'direct',
  onClose,
  onCreateConversation
}) => {
  const [chatType, setChatType] = useState<'direct' | 'group'>(initialChatType);
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const otherUsers = users.filter((u) => u.id !== currentUserId);

  const displayedUsers = otherUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      (u.bunnyId && u.bunnyId.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const toggleSelectUser = (id: string) => {
    if (chatType === 'direct') {
      setSelectedUserIds([id]);
    } else {
      if (selectedUserIds.includes(id)) {
        setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
      } else if (selectedUserIds.length >= MAX_GROUP_MEMBERS - 1) {
        window.alert(`Nhóm Pinkmess tối đa ${MAX_GROUP_MEMBERS} người, tính cả bạn nhé 💕`);
      } else {
        setSelectedUserIds([...selectedUserIds, id]);
      }
    }
  };

  const handleCreate = () => {
    if (selectedUserIds.length === 0) return;
    if (chatType === 'direct') {
      const targetUser = otherUsers.find((u) => u.id === selectedUserIds[0]);
      onCreateConversation('direct', targetUser?.name || 'Trò chuyện', [currentUserId, selectedUserIds[0]]);
    } else {
      onCreateConversation(
        'group',
        groupName.trim() || 'Nhóm Chat Bunny 💕',
        [currentUserId, ...selectedUserIds]
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-[#FFD6E5] flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-[#F7DDE8]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐰💬</span>
            <h3 className="font-bold text-lg text-[#4C3441]">Tạo Trò Chuyện Mới</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#FFF0F6] text-[#927D8A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch direct vs group */}
        <div className="flex items-center gap-2 p-1 bg-[#FFF0F6] rounded-2xl my-3">
          <button
            onClick={() => {
              setChatType('direct');
              setSelectedUserIds([]);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              chatType === 'direct' ? 'bg-[#FF82AE] text-white shadow-xs' : 'text-[#927D8A]'
            }`}
          >
            Nhắn tin 1-1
          </button>
          <button
            onClick={() => {
              setChatType('group');
              setSelectedUserIds([]);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              chatType === 'group' ? 'bg-[#FF82AE] text-white shadow-xs' : 'text-[#927D8A]'
            }`}
          >
            Tạo nhóm chat
          </button>
        </div>

        {chatType === 'group' && (
          <div className="mb-3">
            <label className="block text-xs font-bold text-[#4C3441] mb-1">Tên nhóm chat (*):</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="VD: Hội Thỏ Bông & Bạn Bè 🌸"
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none"
            />
          </div>
        )}

        {/* Search input */}
        <div className="mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tên hoặc Bunny ID (VD: linh_meo)..."
            className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#F7DDE8] focus:border-[#FF82AE] focus:outline-none bg-[#FFF0F6]/40"
          />
        </div>

        {/* Select users */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1">
          <label className="block text-xs font-bold text-[#4C3441] mb-1">
            {chatType === 'direct'
              ? 'Chọn người bạn muốn nhắn:'
              : `Chọn thành viên nhóm: ${selectedUserIds.length + 1}/${MAX_GROUP_MEMBERS}`}
          </label>
          {displayedUsers.length === 0 ? (
            <p className="text-xs text-[#927D8A] text-center py-4">Không tìm thấy người dùng phù hợp</p>
          ) : (
            displayedUsers.map((u) => {
              const isSelected = selectedUserIds.includes(u.id);
              return (
                <div
                  key={u.id}
                  onClick={() => toggleSelectUser(u.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FF82AE] bg-[#FFE4F0]'
                      : selectedUserIds.length >= MAX_GROUP_MEMBERS - 1 && chatType === 'group'
                      ? 'border-[#F7DDE8] cursor-not-allowed opacity-50'
                      : 'border-[#F7DDE8] hover:bg-[#FFF0F6]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-[#FFD6E5]" />
                    <div>
                      <div className="text-xs font-bold text-[#4C3441]">{u.name}</div>
                      <div className="text-[10px] text-[#FF4F8B] font-mono">@{u.bunnyId || u.id}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#FF4F8B]" />}
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#F7DDE8] flex items-center justify-end gap-2 mt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-[#927D8A]">
            Huỷ
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedUserIds.length === 0 || (chatType === 'group' && !groupName.trim())}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF82AE] to-[#FF6F9F] text-white text-xs font-bold shadow-md shadow-[#FF82AE]/30 disabled:opacity-50"
          >
            Bắt đầu trò chuyện 💕
          </button>
        </div>
      </div>
    </div>
  );
};
