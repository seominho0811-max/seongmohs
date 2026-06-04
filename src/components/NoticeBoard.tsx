/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Notice, Comment, NoticeCategory, Attachment } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  Plus, 
  Trash2, 
  Paperclip, 
  Check, 
  Heart, 
  MessageCircle, 
  Eye, 
  Pin, 
  X, 
  FileText,
  Search,
  Filter
} from 'lucide-react';

interface NoticeBoardProps {
  currentUser: User;
  selectedNoticeId?: string; // Deep-linked notice passed from dashboard
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ currentUser, selectedNoticeId }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'전체' | NoticeCategory>('전체');
  const [searchWord, setSearchWord] = useState('');
  
  // Create Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('교무');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  
  // Comment Form State
  const [commentText, setCommentText] = useState('');
  
  const [showReadByModal, setShowReadByModal] = useState(false);
  const [staffList, setStaffList] = useState<User[]>([]);

  useEffect(() => {
    loadNotices();
    setStaffList(SchoolStorage.getUsers());
  }, []);

  useEffect(() => {
    if (selectedNoticeId) {
      const found = SchoolStorage.getNotices().find(n => n.id === selectedNoticeId);
      if (found) {
        handleSelectNotice(found);
      }
    }
  }, [selectedNoticeId, notices]);

  const loadNotices = () => {
    const raw = SchoolStorage.getNotices();
    setNotices(raw);
  };

  const handleSelectNotice = (notice: Notice) => {
    // Increment views on selection by current user
    if (!notice.viewedBy) notice.viewedBy = [];
    
    let isUpdated = false;
    if (!notice.viewedBy.includes(currentUser.id)) {
      notice.viewedBy.push(currentUser.id);
      notice.views += 1;
      isUpdated = true;
    }

    if (isUpdated) {
      SchoolStorage.updateNotice(notice);
      loadNotices();
    }

    setSelectedNotice(notice);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNotice: Notice = {
      id: `n_${Date.now()}`,
      title,
      content,
      category,
      authorId: currentUser.id,
      authorName: currentUser.name,
      isPinned,
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      views: 1,
      viewedBy: [currentUser.id],
      comments: [],
      createdAt: new Date().toISOString()
    };

    SchoolStorage.addNotice(newNotice);
    
    // Reset form
    setTitle('');
    setContent('');
    setCategory('교무');
    setIsPinned(false);
    setUploadedFiles([]);
    setIsCreating(false);

    loadNotices();
    setSelectedNotice(newNotice);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedNotice) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content: commentText,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(selectedNotice.comments || []), newComment];
    const updatedNotice = { ...selectedNotice, comments: updatedComments };

    SchoolStorage.updateNotice(updatedNotice);
    setSelectedNotice(updatedNotice);
    setCommentText('');
    loadNotices();
  };

  const handleDeleteNotice = (id: string) => {
    if (confirm('이 공지사항을 정말 삭제하시겠습니까?')) {
      SchoolStorage.deleteNotice(id);
      setSelectedNotice(null);
      loadNotices();
    }
  };

  const handleSimulatedFileUpload = () => {
    const names = [
      '학부모_통신_안내장.pdf',
      '행사동선_계획_첨부.docx',
      '지출_영수증_서식.xlsx',
      '연수_참고자료_슬라이드.pptx'
    ];
    const types = ['pdf', 'docx', 'xlsx', 'pptx'];
    const idx = Math.floor(Math.random() * names.length);
    const newAttach: Attachment = {
      name: names[idx],
      type: types[idx],
      url: '#',
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
    };

    setUploadedFiles(prev => [...prev, newAttach]);
  };

  const getCategoryTheme = (cat: NoticeCategory) => {
    switch (cat) {
      case '교무': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case '연구': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case '생활교육': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case '행사': return 'bg-purple-50 text-purple-600 border border-purple-100';
      case '연수': return 'bg-rose-50 text-rose-600 border border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  // Filter Notices
  const filteredNotices = notices.filter(n => {
    const matchesCategory = filterCategory === '전체' || n.category === filterCategory;
    const matchesSearch = n.title.toLowerCase().includes(searchWord.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchWord.toLowerCase()) ||
                          n.authorName.toLowerCase().includes(searchWord.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Separate pinned vs standard
  const pinnedNotices = filteredNotices.filter(n => n.isPinned);
  const standardNotices = filteredNotices.filter(n => !n.isPinned);
  const displayedNotices = [...pinnedNotices, ...standardNotices];

  const canCreate = currentUser.role === 'admin' || currentUser.role === 'dept_manager' || currentUser.role === 'teacher';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex min-h-[650px] overflow-hidden">
      
      {/* LEFT BOARD LIST SIDE */}
      <div className={`w-1/2 border-r border-slate-100 flex flex-col ${selectedNotice ? 'hidden md:flex' : 'w-full'}`}>
        
        {/* Search controls */}
        <div className="p-5 border-b border-slate-50 space-y-4 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">학교 공지 게시판</h2>
            {canCreate && (
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                공지작성
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="제목, 내용, 글쓴이 검색..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-50/80 outline-none text-xs rounded-xl pl-9 pr-4 py-2 transition-colors border border-slate-100"
              />
            </div>

            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="text-xs font-semibold bg-slate-50 hover:bg-slate-50/85 text-slate-600 px-3.5 py-2.5 rounded-xl border border-slate-100 text-center outline-none"
            >
              <option value="전체">전체 카테고리</option>
              <option value="교무">교무</option>
              <option value="연구">연구</option>
              <option value="생활교육">생활교육</option>
              <option value="행사">행사</option>
              <option value="연수">연수</option>
              <option value="일반">일반</option>
            </select>
          </div>
        </div>

        {/* Notices items listing scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {displayedNotices.map((notice) => {
            const isSelected = selectedNotice?.id === notice.id;
            return (
              <div 
                key={notice.id}
                onClick={() => handleSelectNotice(notice)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${notice.isPinned ? 'bg-amber-50/20' : ''} ${isSelected ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : ''}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {notice.isPinned && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold rounded-md uppercase">
                        <Pin className="w-2.5 h-2.5 transform rotate-45" />
                        중요고정
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold ${getCategoryTheme(notice.category)}`}>
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium font-mono">{notice.authorName} • {new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors">
                    {notice.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> 조회 {notice.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> 댓글 {notice.comments?.length || 0}
                    </span>
                    {notice.attachments && (
                      <span className="flex items-center gap-1 text-indigo-600">
                        <Paperclip className="w-3 h-3" /> 첨부있음
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {displayedNotices.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-12">등록된 교무 공지사항이 검색되지 않습니다.</p>
          )}
        </div>
      </div>

      {/* RIGHT NOTICE DETAIL CONTAINER */}
      <div className={`w-1/2 flex flex-col bg-slate-50/30 ${!selectedNotice && !isCreating ? 'hidden md:flex flex-1 items-center justify-center p-8 text-slate-400' : 'flex-1'}`}>
        
        {isCreating ? (
          /* Notice writing mode layout */
          <form onSubmit={handleCreateNotice} className="p-6 space-y-4 h-full overflow-y-auto bg-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">공지사항 작성</h3>
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 block">공지 제목</label>
                <input 
                  type="text" 
                  placeholder="제목을 명확하게 기입해 주세요..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white rounded-xl focus:border-blue-300 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">설정 카테고리</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                  >
                    <option value="교무">교무</option>
                    <option value="연구">연구</option>
                    <option value="생활교육">생활교육</option>
                    <option value="행사">행사</option>
                    <option value="연수">연수</option>
                    <option value="일반">일반</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input 
                    type="checkbox" 
                    id="pin_chk"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 text-blue-600 outline-none rounded border-slate-300"
                  />
                  <label htmlFor="pin_chk" className="text-xs font-bold text-slate-700 cursor-pointer">상단 필독목록 고정</label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 block">공지 상세 내용</label>
                <textarea 
                  rows={8}
                  placeholder="학교 교직원들에게 전달할 업무 내용을 상세 안내해 주세요."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-100 focus:bg-white rounded-xl focus:border-blue-300 outline-none transition-all leading-relaxed"
                  required
                />
              </div>

              {/* Uploads attachment simulator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-400">자료 첨부파일 목록</span>
                  <button 
                    type="button" 
                    onClick={handleSimulatedFileUpload}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    + 첨부파일 모의등록
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {uploadedFiles.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200">
                      <FileText className="w-3 h-3 text-slate-400 font-mono" />
                      {f.name} ({f.size})
                    </span>
                  ))}
                  {uploadedFiles.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">첨부된 자료가 없습니다.</span>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors block shrink-0"
            >
              교무 공지 게시하기
            </button>
          </form>
        ) : selectedNotice ? (
          /* Notice detail rendering */
          <div className="flex flex-col h-full bg-white">
            
            {/* Header top controls */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <button 
                onClick={() => setSelectedNotice(null)}
                className="text-xs text-slate-500 hover:text-slate-800 md:hidden"
              >
                뒤로가기
              </button>
              
              <div className="flex items-center gap-2 ml-auto">
                {(currentUser.id === selectedNotice.authorId || 
                  currentUser.role === 'admin' || 
                  currentUser.role === 'dept_manager' || 
                  currentUser.role === 'teacher') && (
                  <button 
                    onClick={() => handleDeleteNotice(selectedNotice.id)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    title="공지 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="font-bold text-[10.5px]">삭제</span>
                  </button>
                )}
                <button 
                  onClick={() => setSelectedNotice(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hidden md:block"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notice information canvas */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getCategoryTheme(selectedNotice.category)}`}>
                    {selectedNotice.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    작성자: {selectedNotice.authorName} • {new Date(selectedNotice.createdAt).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                  {selectedNotice.title}
                </h2>
              </div>

              {/* Text context area */}
              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 border border-dashed border-slate-200/80 rounded-2xl whitespace-pre-line font-medium">
                {selectedNotice.content}
              </div>

              {/* Attachments panel */}
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 block">공지 첨부 자료실 연동</h4>
                  <div className="space-y-1.5">
                    {selectedNotice.attachments.map((attach, idx) => (
                      <div 
                        key={idx}
                        className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-blue-50/20 border border-slate-100 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">📕</span>
                          <span className="text-xs font-bold text-slate-700 truncate">{attach.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{attach.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Read tracker widget */}
              <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-200/40 flex justify-between items-center text-xs transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  <span className="font-bold text-slate-600">교직원 {selectedNotice.viewedBy?.length || 1}명 읽음 확인 완료</span>
                </div>
                <button 
                  onClick={() => setShowReadByModal(!showReadByModal)}
                  className="text-[10px] text-blue-600 hover:underline font-bold"
                >
                  {showReadByModal ? '목록 접기' : '확인 대상자 보기'}
                </button>
              </div>

              {/* Expanded read indicators checklist */}
              {showReadByModal && (
                <div className="p-3.5 bg-amber-50/10 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">조회 확인 교사 목록</span>
                  <div className="grid grid-cols-3 gap-2">
                    {staffList.map(teacher => {
                      const hasRead = selectedNotice.viewedBy?.includes(teacher.id);
                      return (
                        <div key={teacher.id} className="flex items-center gap-1.5 max-w-full">
                          <span className={`w-1.5 h-1.5 rounded-full ${hasRead ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className={`text-[10.5px] truncate font-semibold ${hasRead ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{teacher.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments Board Panel */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800">
                  교직원 댓글 ({selectedNotice.comments?.length || 0})
                </h3>
                
                {/* Add comment submit */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="공지에 대한 피드백이나 댓글을 남기세요..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-slate-50 outline-none text-xs rounded-xl px-3.5 py-2.5 border border-slate-100 focus:bg-white text-slate-700 focus:border-blue-300 transition-all"
                  />
                  <button type="submit" className="px-4.5 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0">
                    등록
                  </button>
                </form>

                <div className="space-y-2 pr-1">
                  {selectedNotice.comments?.map((com) => (
                    <div key={com.id} className="p-2.5 bg-slate-50/50 rounded-xl space-y-1 block text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[10.5px] font-extrabold text-slate-600">{com.authorName}</span>
                        <span className="text-[9px] text-slate-400 font-mono font-semibold">{new Date(com.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-normal font-medium">{com.content}</p>
                    </div>
                  ))}
                  {(!selectedNotice.comments || selectedNotice.comments.length === 0) && (
                    <p className="text-[11px] text-slate-400 italic text-center py-2.5">작성된 답변이나 댓글이 없습니다.</p>
                  )}
                </div>

              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <X className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm">상세 내용을 열람할 공지사항을 선택하세요.</p>
          </div>
        )}

      </div>

    </div>
  );
};
