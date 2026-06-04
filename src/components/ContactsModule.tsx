/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ChatRoom } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Building, 
  Briefcase, 
  MessageSquare, 
  Star,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ContactsModuleProps {
  currentUser: User;
  onNavigate: (tab: string, arg?: any) => void;
  deepQuery?: { query?: string }; // Deep search query passed from outside
}

export const ContactsModule: React.FC<ContactsModuleProps> = ({ currentUser, onNavigate, deepQuery }) => {
  const [staff, setStaff] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<'전체' | string>('전체');
  const [hoveredTeacher, setHoveredTeacher] = useState<User | null>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editTask, setEditTask] = useState('');
  const [editExtension, setEditExtension] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    // Load staff
    const rawStaff = SchoolStorage.getUsers();
    setStaff(rawStaff);

    if (deepQuery && deepQuery.query) {
      setSearchTerm(deepQuery.query);
    }
  }, [deepQuery]);

  useEffect(() => {
    if (hoveredTeacher) {
      setEditName(hoveredTeacher.name || '');
      setEditDept(hoveredTeacher.department || '');
      setEditTask(hoveredTeacher.task || '');
      setEditExtension(hoveredTeacher.extension || '');
      setEditPhone(hoveredTeacher.phone || '');
      setEditEmail(hoveredTeacher.email || '');
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  }, [hoveredTeacher]);

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      alert("이름을 입력해 주십시오.");
      return;
    }
    if (!editDept) {
      alert("부서를 선택해 주십시오.");
      return;
    }

    const updatedTeacher: User = {
      ...hoveredTeacher!,
      name: editName.trim(),
      department: editDept,
      task: editTask.trim(),
      extension: editExtension.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim()
    };

    // Update in local database
    SchoolStorage.updateUser(updatedTeacher);

    // Update local state so UI updates instantly
    const updatedStaff = SchoolStorage.getUsers();
    setStaff(updatedStaff);
    
    // Also update current active hovered teacher so selection is preserved
    setHoveredTeacher(updatedTeacher);
    setIsEditing(false);

    // If the edited user is the current logged-in user, we should also update the local storage for current user
    if (updatedTeacher.id === currentUser.id) {
      localStorage.setItem('school_current_user', JSON.stringify(updatedTeacher));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Handle opening or finding a 1:1 direct chat session
  const handleOpenDirectChat = (teacher: User) => {
    if (teacher.id === currentUser.id) {
      alert("자기 자신과는 1:1 대화를 나눌 수 없습니다.");
      return;
    }

    const currentRooms = SchoolStorage.getChannels();
    // Search if target 1:1 room already exists
    let extantRoom = currentRooms.find(r => 
      r.type === 'direct' && 
      r.members.includes(currentUser.id) && 
      r.members.includes(teacher.id)
    );

    if (!extantRoom) {
      // Create new 1:1 direct Room
      const newRoom: ChatRoom = {
        id: `room_dir_${Date.now()}`,
        name: `${teacher.name} / ${currentUser.name} 1:1 대화방`,
        type: 'direct',
        members: [currentUser.id, teacher.id],
        createdAt: new Date().toISOString()
      };
      extantRoom = SchoolStorage.addChannel(newRoom);
    }

    // Redirect to Chatroom tab
    onNavigate('chat');
  };

  const getOnlineBadgeColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-400';
      case 'busy': return 'bg-amber-400';
      default: return 'bg-slate-300';
    }
  };

  const getOnlineText = (status: string) => {
    switch (status) {
      case 'online': return '업무중';
      case 'busy': return '수업중/바쁨';
      default: return '오프라인';
    }
  };

  const departmentsList = [
    '전체', '교장실', '교감실', '교무운영부', '교육과정부', '교육연구부', '교육평가부', '진로진학상담부', '교육정보부', '학생생활안전부', '창의인성환경부', '종교부', '보건툭수교육부', '1학년부', '2학년부', '3학년부', '행정실'
  ];

  // Filtering contact records
  const filteredStaff = staff.filter(s => {
    const matchesDept = selectedDept === '전체' || s.department === selectedDept;
    const matchesQuery = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.task.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.extension.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.phone && s.phone.includes(searchTerm));
    return matchesDept && matchesQuery;
  });

  return (
    <div className="space-y-4">
      
      {/* Search Header panel with statistics */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap justify-between items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">교직원 조직도 연락망</h2>
          <p className="text-[11px] text-slate-400">교직원 통합 디렉토리 조회 및 다이렉트 메신저 채널 연동기능</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="이름, 담당업무, 내선번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 outline-none text-xs rounded-xl pl-9 pr-4 py-2 transition-colors text-slate-800 font-semibold"
            />
          </div>
          
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold shrink-0 transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Directory division buttons */}
      <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 flex gap-1.5 overflow-x-auto">
        {departmentsList.map((dept) => {
          const isSelected = selectedDept === dept;
          return (
            <button 
              key={dept} 
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
            >
              {dept}
            </button>
          );
        })}
      </div>

      {/* Layout workspace grid */}
      <div className="flex gap-4 items-start flex-col lg:flex-row">
        
        {/* Contacts Cards collection listing */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 w-full">
          {filteredStaff.map(teacher => {
            const isMe = teacher.id === currentUser.id;
            return (
              <div 
                key={teacher.id} 
                onClick={() => setHoveredTeacher(teacher)}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-blue-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between h-44 group relative overflow-hidden"
              >
                {/* Visual decoration overlay */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50/20 to-transparent rounded-full pointer-events-none"></div>

                <div className="space-y-3 relative z-10 block text-left font-semibold">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Round placeholder ring initials */}
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold flex items-center justify-center relative shrink-0 text-xs">
                        {teacher.name.charAt(0)}
                        <span className={`w-2 h-2 rounded-full border border-white absolute bottom-0 right-0 ${getOnlineBadgeColor(teacher.status)}`} title={getOnlineText(teacher.status)}></span>
                      </div>
                      
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="text-[11px] font-extrabold text-slate-800 truncate">{teacher.name}</h3>
                          {isMe && (
                            <span className="px-0.5 py-0.2 bg-slate-100 border border-slate-200 text-slate-500 text-[7px] font-bold rounded shrink-0">나</span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                          <Building className="w-3 h-3 text-slate-300 shrink-0" />
                          <span className="truncate">{teacher.department}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[8.5px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase shrink-0 font-bold font-mono">
                      #{teacher.extension}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed flex items-start gap-1 min-h-[30px] font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                    <span>업무: {teacher.task}</span>
                  </p>
                </div>

                {/* Direct interaction footer */}
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 relative z-10 shrink-0">
                  <span className="text-[9.5px] text-slate-400 truncate flex items-center gap-1 font-mono max-w-[100px]" title={teacher.email}>
                    <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                    {teacher.email}
                  </span>

                  {!isMe && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenDirectChat(teacher); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 px-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded text-[10px] font-bold flex items-center gap-0.5"
                      title="1:1 메시지 전송"
                    >
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span>대화</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
          {filteredStaff.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-12 col-span-3 font-medium">검색 기준에 부합하는 교직원이 없습니다.</p>
          )}
        </div>

        {/* Selected / Hovered single teacher profile details */}
        {hoveredTeacher && (
          <div className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 shrink-0 block text-left transition-card">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-500" /> 교직원 프로파일 요약
              </h3>
              <button 
                onClick={() => setHoveredTeacher(null)} 
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
              >
                닫기
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block">이름</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block">소속 부서</label>
                  <select 
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-2 py-2 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {departmentsList.filter(d => d !== '전체').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block">담당 업무</label>
                  <input 
                    type="text"
                    value={editTask}
                    onChange={(e) => setEditTask(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block">내선 번호</label>
                  <input 
                    type="text"
                    placeholder="예: 810"
                    value={editExtension}
                    onChange={(e) => setEditExtension(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block">휴대폰 번호</label>
                  <input 
                    type="text"
                    placeholder="예: 010-1234-5678"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block">이메일 주소</label>
                  <input 
                    type="text"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    저장하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-5 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border border-slate-200/50">
                  <div className="w-14 h-14 bg-white shadow-xs rounded-full border border-slate-100 flex items-center justify-center font-bold text-lg text-slate-800 mx-auto relative mb-2">
                    {hoveredTeacher.name.charAt(0)}
                    <span className={`w-3 h-3 rounded-full border border-white absolute bottom-1 right-1 ${getOnlineBadgeColor(hoveredTeacher.status)}`}></span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">{hoveredTeacher.name}</h4>
                  <p className="text-[10.5px] text-slate-400 font-mono font-medium">{hoveredTeacher.department} • {hoveredTeacher.role === 'admin' ? '관리자' : hoveredTeacher.role === 'dept_manager' ? '부서장' : '일반교사'}</p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-500 font-semibold">
                  <div className="flex justify-between">
                    <span>내선번호:</span>
                    <span className="font-extrabold text-slate-800 font-mono">#{hoveredTeacher.extension}</span>
                  </div>
                  {hoveredTeacher.phone && (
                    <div className="flex justify-between">
                      <span>휴대폰:</span>
                      <span className="font-extrabold text-slate-800 font-mono">{hoveredTeacher.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>소속부서:</span>
                    <span className="text-slate-800">{hoveredTeacher.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>담당업무:</span>
                    <span className="text-slate-700 font-bold break-all max-w-[150px] text-right">{hoveredTeacher.task}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>메일주소:</span>
                    <span className="font-mono text-slate-800 truncate border-b max-w-[140px] text-right">{hoveredTeacher.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>온라인 유무:</span>
                    <span className={`font-bold ${hoveredTeacher.status === 'online' ? 'text-emerald-600' : hoveredTeacher.status === 'busy' ? 'text-amber-500' : 'text-slate-400'}`}>
                      {getOnlineText(hoveredTeacher.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    정보 수정하기
                  </button>

                  {hoveredTeacher.id !== currentUser.id && (
                    <button 
                      onClick={() => handleOpenDirectChat(hoveredTeacher)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      1:1 다이렉트 소통하기
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
