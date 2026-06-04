/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, ChatRoom as RoomType, ChatMessage, Attachment } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon,
  Search, 
  Pin, 
  Star, 
  Users, 
  Smile, 
  ChevronRight,
  MoreVertical,
  Volume2,
  Trash2,
  MessageSquare,
  Plus,
  X,
  Check
} from 'lucide-react';

interface ChatRoomProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ currentUser, onNavigate }) => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [activeRoom, setActiveRoom] = useState<RoomType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState<'all_types' | 'all' | 'dept' | 'grade' | 'project' | 'direct'>('all_types');
  const [messageSearch, setMessageSearch] = useState('');
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [pinnedNotice, setPinnedNotice] = useState<ChatMessage | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [staffList, setStaffList] = useState<User[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<'all' | 'dept' | 'grade' | 'project' | 'direct'>('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUser.id]);
  const [roomToDelete, setRoomToDelete] = useState<RoomType | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      alert('대화방 이름을 입력해 주세요.');
      return;
    }
    
    // Ensure current user is in selectedMembers
    const finalMembers = selectedMembers.includes(currentUser.id) 
      ? selectedMembers 
      : [...selectedMembers, currentUser.id];

    const newRoom: RoomType = {
      id: `room_${Date.now()}`,
      name: newRoomName.trim(),
      type: newRoomType,
      members: finalMembers,
      createdAt: new Date().toISOString()
    };

    SchoolStorage.addChannel(newRoom);
    
    // Reload rooms
    const rawRooms = SchoolStorage.getChannels();
    setRooms(rawRooms);
    
    // Select the new room
    handleSelectRoom(newRoom);
    
    // Reset forms
    setNewRoomName('');
    setNewRoomType('all');
    setSelectedMembers([currentUser.id]);
    setShowCreateModal(false);
  };

  const handleDeleteRoom = (roomId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (targetRoom) {
      setRoomToDelete(targetRoom);
    }
  };

  const confirmDeleteRoom = () => {
    if (!roomToDelete) return;
    const roomId = roomToDelete.id;
    SchoolStorage.deleteChannel(roomId);
    
    const rawRooms = SchoolStorage.getChannels();
    setRooms(rawRooms);
    
    if (rawRooms.length > 0) {
      handleSelectRoom(rawRooms[0]);
    } else {
      setActiveRoom(null);
      setMessages([]);
      setPinnedNotice(null);
    }
    setRoomToDelete(null);
  };

  useEffect(() => {
    // Initial fetch
    const rawRooms = SchoolStorage.getChannels();
    setRooms(rawRooms);
    setStaffList(SchoolStorage.getUsers());

    // Auto select first room
    if (rawRooms.length > 0) {
      handleSelectRoom(rawRooms[0]);
    }
  }, []);

  const handleSelectRoom = (room: RoomType) => {
    setActiveRoom(room);
    
    // Fetch and sync messages for room
    const msgs = SchoolStorage.getMessages(room.id);
    setMessages(msgs);

    // Sync pinned announcement message inside chat Room
    const noticeMsg = msgs.find(m => m.isNotice);
    setPinnedNotice(noticeMsg || null);

    // Mark messages as read by current user
    SchoolStorage.updateMessageRead(room.id, currentUser.id);

    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e?: React.FormEvent, simulatedAttachment?: Attachment) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !simulatedAttachment && !e) return;
    if (!activeRoom) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      roomId: activeRoom.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: inputMessage,
      attachments: simulatedAttachment ? [simulatedAttachment] : undefined,
      readBy: [currentUser.id],
      isNotice: false,
      createdAt: new Date().toISOString()
    };

    const saved = SchoolStorage.addMessage(newMsg);
    setMessages(prev => [...prev, saved]);
    setInputMessage('');

    // Trigger scroll
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Simulating attachment files and images selection
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Build temporary file mock metadata
    const isImg = file.type.startsWith('image/');
    const simulatedAttach: Attachment = {
      name: file.name,
      type: isImg ? 'image' : 'file',
      url: '#', // internal simulated url
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    };

    handleSendMessage(undefined, simulatedAttach);
  };

  // Chatroom internal message pinning/editing controls
  const handlePinMessage = (msg: ChatMessage) => {
    const updatedMessages = messages.map(m => {
      if (m.id === msg.id) {
        return { ...m, isNotice: !m.isNotice };
      }
      return { ...m, isNotice: false }; // Clear other notices in this room
    });

    // Update locally and in localstorage via schoolStorage
    // We update the active message's notice property
    const rawAllMsgs = JSON.parse(localStorage.getItem('school_messages') || '[]');
    const nextMsgs = rawAllMsgs.map((m: ChatMessage) => {
      if (m.roomId === activeRoom?.id) {
        if (m.id === msg.id) return { ...m, isNotice: !msg.isNotice };
        return { ...m, isNotice: false };
      }
      return m;
    });
    localStorage.setItem('school_messages', JSON.stringify(nextMsgs));

    setMessages(updatedMessages.filter(m => m.roomId === activeRoom?.id));
    const nextPin = updatedMessages.find(m => m.isNotice && m.roomId === activeRoom?.id);
    setPinnedNotice(nextPin || null);
  };

  const handleStarMessage = (msg: ChatMessage) => {
    const updated = messages.map(m => {
      if (m.id === msg.id) {
        return { ...m, isStarred: !m.isStarred };
      }
      return m;
    });
    setMessages(updated);
  };

  // Filter list of rooms
  const filteredRooms = rooms.filter(r => {
    if (roomFilter !== 'all_types' && r.type !== roomFilter) return false;
    return r.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter messages based on search query in active room
  const filteredMessages = messages.filter(m => {
    if (!messageSearch) return true;
    return m.text.toLowerCase().includes(messageSearch.toLowerCase());
  });

  const getInitials = (name: string) => name.charAt(0);

  const getRoomIconBadgeColor = (type: string) => {
    switch (type) {
      case 'all': return 'bg-rose-500 text-white';
      case 'dept': return 'bg-blue-500 text-white';
      case 'grade': return 'bg-emerald-500 text-white';
      case 'project': return 'bg-purple-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getRoomLabel = (type: string) => {
    switch (type) {
      case 'all': return '공지';
      case 'dept': return '부서';
      case 'grade': return '학년';
      case 'project': return '연구';
      default: return '개인';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex overflow-hidden min-h-[680px]">
      
      {/* 1. Left panel: School Channels List */}
      <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
        
        {/* Search & Tabs */}
        <div className="p-4 space-y-3 border-b border-slate-50 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">온라인 교무실</h2>
            <button
              onClick={() => {
                setSelectedMembers([currentUser.id]);
                setShowCreateModal(true);
              }}
              className="p-1 px-2.5 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-100 rounded-lg text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="새 대화방 개설"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>방 만들기</span>
            </button>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="채팅방 찾기..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-50/80 outline-none text-xs rounded-xl pl-9 pr-4 py-2.5 transition-colors border border-slate-100"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            <button 
              onClick={() => setRoomFilter('all_types')} 
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${roomFilter === 'all_types' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              전체
            </button>
            <button 
              onClick={() => setRoomFilter('all')} 
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${roomFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              교공지
            </button>
            <button 
              onClick={() => setRoomFilter('dept')} 
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${roomFilter === 'dept' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              부서
            </button>
            <button 
              onClick={() => setRoomFilter('grade')} 
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${roomFilter === 'grade' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              학년
            </button>
            <button 
              onClick={() => setRoomFilter('project')} 
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${roomFilter === 'project' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              프로젝트
            </button>
          </div>
        </div>

        {/* Channels scrollbar */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredRooms.map(room => {
            const isActive = activeRoom?.id === room.id;
            return (
              <div 
                key={room.id}
                onClick={() => handleSelectRoom(room)}
                className={`flex gap-3 items-center p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${isActive ? 'bg-blue-50/50 hover:bg-blue-50/50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${getRoomIconBadgeColor(room.type)}`}>
                  {getInitials(room.name)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-700 truncate">{room.name}</h3>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                      {getRoomLabel(room.type)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Users className="w-3 h-3" />
                    <span>{room.members.length}인 교무인원</span>
                  </p>
                </div>
              </div>
            );
          })}
          {filteredRooms.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">해당 카테고리에 방이 존재하지 않습니다.</p>
          )}
        </div>

        {/* User profile identifier bottom */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center">
            {getInitials(currentUser.name)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">{currentUser.name}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">• 동기화 됨</p>
          </div>
        </div>
      </div>

      {/* 2. Central Active Chat Screen */}
      <div className="flex-1 flex flex-col bg-slate-50/40">
        
        {activeRoom ? (
          <>
            {/* Header section with functions */}
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">{activeRoom.name}</h2>
                  <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {activeRoom.members.length}명 대화중
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  참여 위원: {activeRoom.members.map(mId => staffList.find(s => s.id === mId)?.name || '교직원').join(', ')}
                </p>
              </div>

              {/* Chat action triggers */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setShowMsgSearch(!showMsgSearch)}
                  className={`p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors ${showMsgSearch ? 'bg-slate-100 text-blue-600' : ''}`}
                  title="메시지 검색"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteRoom(activeRoom.id)}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-100 hover:border-rose-100 transition-colors cursor-pointer"
                  title="대화방 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MESSAGE SEARCH SUBBAR */}
            {showMsgSearch && (
              <div className="bg-slate-50 px-6 py-2 border-b border-slate-100 flex items-center gap-3">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="대화 내용 검색..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-slate-700 w-full"
                />
                {messageSearch && (
                  <button onClick={() => setMessageSearch('')} className="text-[10px] text-slate-400 underline font-mono">지우기</button>
                )}
              </div>
            )}

            {/* FIXED TOP CHAT PINNED NOTE */}
            {pinnedNotice && (
              <div className="bg-amber-50/80 border-b border-amber-100 px-6 py-2.5 flex items-start gap-3 relative z-10">
                <Pin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 transform rotate-45" />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-amber-800 mb-0.5 block">[공지사항 고정]</span>
                  <p className="text-slate-700 line-clamp-1">{pinnedNotice.text}</p>
                </div>
                <button 
                  onClick={() => handlePinMessage(pinnedNotice)} 
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline shrink-0"
                >
                  내리기
                </button>
              </div>
            )}

            {/* 3. Messages render area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredMessages.map((msg, index) => {
                const isMe = msg.senderId === currentUser.id;
                // Calculate unread count (mocked based on 50 people active network, representing KakaoTalk's number badges)
                const readListSize = msg.readBy?.length || 1;
                const unreadIndicator = Math.max(0, activeRoom.members.length - readListSize);

                return (
                  <div key={msg.id} className={`flex gap-3 group items-start ${isMe ? 'flex-row-reverse' : ''}`}>
                    
                    {/* Character Ring Avatar */}
                    {!isMe && (
                      <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {getInitials(msg.senderName)}
                      </div>
                    )}

                    <div className={`space-y-1 max-w-[70%]`}>
                      {/* Name header */}
                      {!isMe && (
                        <span className="text-[11px] font-bold text-slate-500 block">{msg.senderName}</span>
                      )}

                      {/* Bubble frame */}
                      <div className={`p-3 rounded-2xl relative ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                      }`}>
                        
                        {/* If text exists */}
                        {msg.text && <p className="text-xs leading-relaxed whitespace-pre-wrap select-all">{msg.text}</p>}

                        {/* Attachments rendering */}
                        {msg.attachments && msg.attachments.map((attach, aIdx) => (
                          <div key={aIdx} className="mt-2 pt-2 border-t border-slate-100/10 text-xs">
                            {attach.type === 'image' ? (
                              <div className="space-y-1">
                                <div className="bg-slate-200 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden group">
                                  <ImageIcon className="w-8 h-8 text-slate-400" />
                                  <span className="absolute bottom-2 left-2 bg-slate-900/60 text-white px-2 py-0.5 rounded text-[10px] font-mono">{attach.size}</span>
                                </div>
                                <span className="block font-medium truncate underline cursor-pointer">{attach.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-slate-950/5 p-2 rounded-lg border border-slate-950/5">
                                <span className="text-xl">📕</span>
                                <div className="min-w-0">
                                  <p className="font-semibold truncate max-w-[150px]">{attach.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{attach.size}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Read count + Time indicators */}
                      <div className={`flex items-center gap-1.5 text-[9px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {unreadIndicator > 0 && (
                          <span className="text-amber-500 font-extrabold font-mono">{unreadIndicator}</span>
                        )}
                        <span className="text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Action menus */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button 
                            onClick={() => handlePinMessage(msg)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-600" 
                            title="대화방 공지 등록"
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* 4. Chat compose Input */}
            <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-slate-100 space-y-2 shrink-0">
              
              <div className="flex items-center justify-between">
                {/* Media attachments triggers */}
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={handleAttachmentClick}
                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                    title="파일 첨부"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleAttachmentClick}
                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                    title="이미지 일지"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">Ctrl + Enter 전송</span>
              </div>

              <div className="flex gap-2">
                {/* Simulated file input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  className="hidden" 
                />
                
                <input 
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white hover:bg-slate-50/80 outline-none text-xs rounded-xl px-4 py-3 border border-slate-100 focus:border-blue-300 transition-all text-slate-800"
                />
                
                <button 
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <MessageSquare className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm">대화방을 구성하거나 소통할 채널을 마우스로 클릭해 주세요.</p>
          </div>
        )}

      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">새 온라인 소통 대화방 개설</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateRoom} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">대화방 이름</label>
                <input 
                  type="text"
                  required
                  placeholder="예: 2학년 기획 협의회, 체육대회 TF..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 outline-none text-xs rounded-xl px-3.5 py-2.5 border border-slate-150 dark:border-slate-850 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">소통 구분 (유형)</label>
                  <select
                    value={newRoomType}
                    onChange={(e: any) => setNewRoomType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 outline-none text-xs rounded-xl px-3.5 py-2.5 border border-slate-150 dark:border-slate-850 focus:border-blue-500 transition-all text-slate-800 dark:text-white"
                  >
                    <option value="all">전체공지방</option>
                    <option value="dept">부서 실무방</option>
                    <option value="grade">학년 소통방</option>
                    <option value="project">연구/프로젝트방</option>
                    <option value="direct">개인 대화방</option>
                  </select>
                </div>
              </div>

              {/* Members Selection Checklist */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    대화 참여 교직원 선택 ({selectedMembers.length}명 선택됨)
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (selectedMembers.length === staffList.length) {
                        setSelectedMembers([currentUser.id]);
                      } else {
                        setSelectedMembers(staffList.map(u => u.id));
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                  >
                    {selectedMembers.length === staffList.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>
                
                <div className="border border-slate-150 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto p-2 bg-slate-50/50 dark:bg-slate-950/30 divide-y divide-slate-100 dark:divide-slate-850">
                  {staffList.map(user => {
                    const isSelected = selectedMembers.includes(user.id);
                    const isMe = user.id === currentUser.id;
                    return (
                      <div 
                        key={user.id}
                        onClick={() => {
                          if (isMe) return; // Cannot unselect self
                          if (isSelected) {
                            setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                          } else {
                            setSelectedMembers([...selectedMembers, user.id]);
                          }
                        }}
                        className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                               {user.name} {isMe && <span className="text-blue-500 text-[10px] font-bold">(나)</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5">
                              {user.department} • {user.task}
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 shadow-xs h-4 rounded border flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  개설 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ROOM CONFIRMATION MODAL */}
      {roomToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold dark:text-white">대화방 삭제</h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              <span className="font-extrabold text-slate-800 dark:text-white">"{roomToDelete.name}"</span> 대화방을 완전히 삭제하시겠습니까? 
              <br />
              이 방의 대화 내용 및 공유되었던 첨부파일 내역이 전체 삭제되며, 복구할 수 없습니다.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setRoomToDelete(null)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                취소
              </button>
              <button 
                type="button"
                onClick={confirmDeleteRoom}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
