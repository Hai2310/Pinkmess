import React, { useMemo, useState } from 'react';
import { Check, Search, Users, X } from 'lucide-react';
import { User } from '../../types';

const MAX_GROUP_MEMBERS = 6;

interface AddGroupMembersModalProps {
  users: User[];
  currentUserId: string;
  existingMemberIds: string[];
  onClose: () => void;
  onAddMembers: (userIds: string[]) => void;
}

export const AddGroupMembersModal: React.FC<AddGroupMembersModalProps> = ({
  users,
  currentUserId,
  existingMemberIds,
  onClose,
  onAddMembers
}) => {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const slotsLeft = Math.max(0, MAX_GROUP_MEMBERS - existingMemberIds.length);
  const existingSet = useMemo(() => new Set(existingMemberIds), [existingMemberIds]);
  const availableUsers = users.filter((user) => {
    if (user.id === currentUserId || existingSet.has(user.id)) return false;
    const normalized = query.trim().toLowerCase().replace(/^@/, '');
    if (!normalized) return true;
    return user.name.toLowerCase().includes(normalized)
      || user.bunnyId.toLowerCase().includes(normalized)
      || user.email.toLowerCase().includes(normalized);
  });

  const toggleUser = (userId: string) => {
    if (selectedIds.includes(userId)) {
      setSelectedIds((previous) => previous.filter((id) => id !== userId));
      return;
    }
    if (selectedIds.length >= slotsLeft) {
      window.alert(`Nhóm đã có ${existingMemberIds.length} người, chỉ còn ${slotsLeft} chỗ trống nhé 💕`);
      return;
    }
    setSelectedIds((previous) => [...previous, userId]);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#4C3441]/35 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border-2 border-[#FFD6E5] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F7DDE8] bg-gradient-to-r from-[#FFF0F6] to-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF82AE] text-white shadow-sm"><Users className="h-5 w-5" /></span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-[#4C3441]">Thêm thành viên nhóm</h3>
              <p className="text-[11px] text-[#927D8A]">Tối đa {MAX_GROUP_MEMBERS} người · còn {slotsLeft} chỗ</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#927D8A] hover:bg-[#FFF0F6] hover:text-[#FF4F8B]" aria-label="Đóng"><X className="h-5 w-5" /></button>
        </div>

        <div className="border-b border-[#F7DDE8] p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[#F7DDE8] bg-[#FFF8FB] px-3 py-2.5 focus-within:border-[#FF82AE]">
            <Search className="h-4 w-4 text-[#FF82AE]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, Bunny ID hoặc email..." className="min-w-0 flex-1 bg-transparent text-xs text-[#4C3441] outline-none" autoFocus />
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {slotsLeft === 0 ? (
            <div className="rounded-2xl bg-[#FFF0F6] px-4 py-5 text-center text-xs font-semibold text-[#FF4F8B]">Nhóm đã đủ 6 thành viên rồi nè 🐰</div>
          ) : availableUsers.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#927D8A]">Không tìm thấy người dùng phù hợp.</p>
          ) : availableUsers.map((user) => {
            const selected = selectedIds.includes(user.id);
            const disabled = !selected && selectedIds.length >= slotsLeft;
            return (
              <button
                type="button"
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-2.5 text-left transition-all ${selected ? 'border-[#FF82AE] bg-[#FFE4F0]' : disabled ? 'cursor-not-allowed border-[#F7DDE8] opacity-50' : 'border-[#F7DDE8] hover:bg-[#FFF0F6]'}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 shrink-0 rounded-full border border-[#FFD6E5] object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-[#4C3441]">{user.name}</span>
                    <span className="block truncate text-[10px] font-mono text-[#FF4F8B]">@{user.bunnyId}</span>
                  </span>
                </span>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[#FF4F8B] bg-[#FF4F8B] text-white' : 'border-[#FFD6E5] text-transparent'}`}><Check className="h-3.5 w-3.5" /></span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#F7DDE8] p-4">
          <span className="text-[11px] font-semibold text-[#927D8A]">Đã chọn {selectedIds.length} người</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="rounded-2xl px-4 py-2.5 text-xs font-bold text-[#927D8A] hover:bg-[#FFF0F6]">Hủy</button>
            <button type="button" disabled={selectedIds.length === 0} onClick={() => onAddMembers(selectedIds)} className="rounded-2xl bg-gradient-to-r from-[#FF82AE] to-[#FF4F8B] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF82AE]/25 disabled:opacity-50">Thêm vào nhóm 💗</button>
          </div>
        </div>
      </div>
    </div>
  );
};
