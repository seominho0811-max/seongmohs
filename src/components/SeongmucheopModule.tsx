import React, { useState, useEffect } from 'react';
import { User, SeongmuSheet, Comment } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  Calendar,
  X,
  HelpCircle,
  Eye,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SeongmucheopModuleProps {
  currentUser: User;
}

export const SeongmucheopModule: React.FC<SeongmucheopModuleProps> = ({ currentUser }) => {
  const [sheets, setSheets] = useState<SeongmuSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<SeongmuSheet | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'전체' | '학사/업무' | '성적/평가' | '연수/복지' | '기타'>('전체');
  
  // Modals & States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [embedViewType, setEmbedViewType] = useState<'view' | 'edit'>('view'); // 'view' for htmlembed, 'edit' for inline editing

  // New Sheet Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'학사/업무' | '성적/평가' | '연수/복지' | '기타'>('학사/업무');
  const [newUrl, setNewUrl] = useState('');

  // Edit Sheet Form
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<'학사/업무' | '성적/평가' | '연수/복지' | '기타'>('학사/업무');
  const [editUrl, setEditUrl] = useState('');

  // Comment input
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = () => {
    const data = SchoolStorage.getSeongmuSheets();
    setSheets(data);
    
    // Maintain active sheet reference if selected
    if (selectedSheet) {
      const updated = data.find(s => s.id === selectedSheet.id);
      if (updated) {
        setSelectedSheet(updated);
      } else {
        setSelectedSheet(null);
      }
    }
  };

  // Extract Sheet ID and build proper embed URLs
  const parseGoogleSheetUrl = (url: string) => {
    const trimmed = url.trim();
    // Match Google Sheets ID
    const sheetIdReg = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = trimmed.match(sheetIdReg);
    
    if (match && match[1]) {
      const sheetId = match[1];
      return {
        id: sheetId,
        viewEmbed: `https://docs.google.com/spreadsheets/d/${sheetId}/htmlembed?widget=true&headers=false`,
        editEmbed: `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&widget=true&headers=false`
      };
    }
    
    // Fallback if not a standard Google Sheet link
    return {
      id: null,
      viewEmbed: trimmed,
      editEmbed: trimmed
    };
  };

  const handleAddSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('성모찹(시트) 제목을 입력해 주십시오.');
      return;
    }
    if (!newUrl.trim()) {
      alert('구글 시트 링크 또는 웹주소를 입력해 주십시오.');
      return;
    }

    const { viewEmbed, editEmbed } = parseGoogleSheetUrl(newUrl);

    const newSheet: SeongmuSheet = {
      id: `sheet_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || '추가 설명이 등록되지 않았습니다.',
      category: newCategory,
      originalUrl: newUrl.trim(),
      embedUrl: viewEmbed, // default view
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      comments: [],
      createdAt: new Date().toISOString()
    };

    SchoolStorage.addSeongmuSheet(newSheet);
    loadSheets();
    
    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewCategory('학사/업무');
    setNewUrl('');
    setShowAddModal(false);
  };

  const handleEditSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSheet) return;
    if (!editTitle.trim()) {
      alert('제목을 입력해 주십시오.');
      return;
    }
    if (!editUrl.trim()) {
      alert('링크를 입력해 주십시오.');
      return;
    }

    const { viewEmbed } = parseGoogleSheetUrl(editUrl);

    const updated: SeongmuSheet = {
      ...selectedSheet,
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory,
      originalUrl: editUrl.trim(),
      embedUrl: viewEmbed,
      updatedAt: new Date().toISOString()
    };

    SchoolStorage.updateSeongmuSheet(updated);
    setSelectedSheet(updated);
    loadSheets();
    setShowEditModal(false);
  };

  const handleDeleteSheet = (id: string) => {
    SchoolStorage.deleteSeongmuSheet(id);
    setSelectedSheet(null);
    setIsDeleting(false);
    loadSheets();
  };

  const openEditModal = () => {
    if (!selectedSheet) return;
    setEditTitle(selectedSheet.title);
    setEditDesc(selectedSheet.description);
    setEditCategory(selectedSheet.category);
    setEditUrl(selectedSheet.originalUrl);
    setShowEditModal(true);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSheet || !commentText.trim()) return;

    const newComment: Comment = {
      id: `sc_c_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedSheet = {
      ...selectedSheet,
      comments: [...(selectedSheet.comments || []), newComment]
    };

    SchoolStorage.updateSeongmuSheet(updatedSheet);
    setSelectedSheet(updatedSheet);
    loadSheets();
    setCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedSheet) return;
    const updatedComments = (selectedSheet.comments || []).filter(c => c.id !== commentId);
    
    const updatedSheet = {
      ...selectedSheet,
      comments: updatedComments
    };

    SchoolStorage.updateSeongmuSheet(updatedSheet);
    setSelectedSheet(updatedSheet);
    loadSheets();
  };

  // Convert category string to elegant color code
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case '학사/업무': return 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/80';
      case '성적/평가': return 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/80';
      case '연수/복지': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80';
      default: return 'bg-slate-50 text-slate-700 border-slate-200/50 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800/80';
    }
  };

  // Filter sheets
  const filteredSheets = sheets.filter(sheet => {
    const matchCategory = activeCategory === '전체' || sheet.category === activeCategory;
    const matchSearch = sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        sheet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        sheet.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-5" id="seongmucheop-module-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">성모찹 (공동 구글시트 연동대장)</h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-normal">
            대전성모여고 교직원 및 행정실이 전산 공유하는 주요 구글스프레드시트를 실시간 등록·연동하고 바로 조회/작성 협업하는 공간입니다.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          공유 구글시트 연동 등록
        </button>
      </div>

      {!selectedSheet ? (
        <>
          {/* SEARCH & FILTERS CONTROL BAR */}
          <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 md:flex-1">
              {(['전체', '학사/업무', '성적/평가', '연수/복지', '기타'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    activeCategory === cat 
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100 shadow-xs' 
                      : 'bg-slate-50/50 text-slate-500 border-slate-100/80 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick search */}
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="시트 이름, 설명, 등록자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-slate-400 focus:bg-white dark:focus:bg-slate-900 transition-all font-semibold"
              />
            </div>
          </div>

          {/* SPREADSHEETS LIST GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredSheets.map((sheet, idx) => (
                <motion.div
                  key={sheet.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md flex flex-col justify-between text-left group"
                >
                  <div 
                    className="space-y-3 cursor-pointer"
                    onClick={() => {
                      setSelectedSheet(sheet);
                      setEmbedViewType('view');
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${getCategoryBadgeClass(sheet.category)}`}>
                        {sheet.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {(sheet.comments?.length ?? 0) > 0 && (
                          <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold flex items-center gap-0.5" title="교무메모 수">
                            <MessageSquare className="w-3.5 h-3.5 fill-blue-500/5 text-blue-500" />
                            {sheet.comments?.length}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(sheet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {sheet.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed line-clamp-2">
                        {sheet.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 dark:border-slate-800/80 mt-4 pt-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-[9px] font-black text-slate-700 dark:text-slate-300">
                        {sheet.ownerName.charAt(0)}
                      </div>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-bold">{sheet.ownerName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedSheet(sheet);
                          setEmbedViewType('view');
                        }}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10.5px] font-bold text-slate-600 dark:text-slate-400 border border-slate-150 dark:border-slate-700 rounded-lg transition-all cursor-pointer"
                      >
                        상세/메모
                      </button>
                      <a
                        href={sheet.originalUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-400 text-[10.5px] font-bold text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/50 rounded-lg transition-all flex items-center gap-0.5 cursor-pointer"
                      >
                        시트 열기
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredSheets.length === 0 && (
              <div className="col-span-full py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500">등록 완료된 시트가 존재하지 않거나 검색 링킹 필터에 부합하는 시트가 없습니다.</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold">우측 상단의 "공유 구글시트 연동 등록" 버튼을 클릭하여 새 문서를 온라인 교무실에 추가하십시오.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* DETAILED EMBED VIEW LAYOUT */
        <div className="flex flex-col xl:flex-row gap-5 items-stretch h-[82vh]" id="seongmucheop-detail-browser">
          
          {/* LEFT: LIVE SPREADSHEET IFRAME CONTAINER */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden">
            {/* Control Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 text-left">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedSheet(null)}
                  className="p-1.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-all cursor-pointer"
                  title="이전 목록으로 돌아가기"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    {selectedSheet.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold leading-none mt-1">
                    원래 주소: {selectedSheet.originalUrl.substring(0, 55)}...
                  </p>
                </div>
              </div>

              {/* Toggle view mode inside App */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
                <button
                  onClick={() => setEmbedViewType('view')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    embedViewType === 'view'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-150 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  기본 조회 뷰
                </button>
                <button
                  onClick={() => setEmbedViewType('edit')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    embedViewType === 'edit'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-150 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  실시간 편집 뷰
                </button>
                <a
                  href={selectedSheet.originalUrl}
                  target="_blank"
                  rel="noreferrer referrer"
                  className="px-3 py-1 text-slate-500 hover:text-slate-700 text-[10px] font-bold flex items-center gap-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  새 창 <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Embedded iFrame Frame */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl relative border border-slate-100 dark:border-slate-800">
              <iframe
                id="seongmucheop-embed-iframe"
                src={embedViewType === 'view' ? selectedSheet.embedUrl : parseGoogleSheetUrl(selectedSheet.originalUrl).editEmbed}
                className="w-full h-full border-0 rounded-xl bg-white"
                allowFullScreen
                loading="lazy"
                title={selectedSheet.title}
              />
            </div>
            
            {/* Guide strip at bottom */}
            <div className="mt-2.5 flex items-center gap-1.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 p-2.5 rounded-xl font-bold">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                지침: 편집자 뷰에서 권한 거부 또는 빈 화면이 뜰 경우, 대상 구글 시트의 공유 설정을 "링크가 있는 모든 사용자가 편집 가능" 또는 "보기 가능" 옵션으로 지정해야 완벽한 인앱 임베드 연동이 완성됩니다.
              </span>
            </div>
          </div>

          {/* RIGHT: DETAILS, CRUD CONTROLS & COLLABORATION FEED */}
          <div className="w-full xl:w-[320px] shrink-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-[500px] xl:h-auto">
            
            {/* Tab header */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-150 dark:border-slate-800 text-left shrink-0">
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${getCategoryBadgeClass(selectedSheet.category)} inline-block mb-1.5`}>
                {selectedSheet.category}
              </span>
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug">{selectedSheet.title}</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{selectedSheet.description}</p>
              
              <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-850 pt-2.5 justify-between">
                <div>
                  등록: <span className="text-slate-600 dark:text-slate-300 font-extrabold">{selectedSheet.ownerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(selectedSheet.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* CRUD Controls */}
              <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-850 flex gap-2">
                <button
                  onClick={openEditModal}
                  className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-750 rounded-lg text-[10.5px] text-slate-600 dark:text-slate-450 font-bold transition-all inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  메타 수정
                </button>
                
                {isDeleting ? (
                  <div className="flex-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-1.5 flex flex-col gap-1 items-stretch">
                    <span className="text-[9px] font-black text-rose-700 dark:text-rose-450 text-center">정말 삭제하시겠습니까?</span>
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => setIsDeleting(false)}
                        className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[8.5px] font-bold rounded-md"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleDeleteSheet(selectedSheet.id)}
                        className="px-2 py-0.5 bg-rose-600 text-white text-[8.5px] font-bold rounded-md"
                      >
                        확정
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsDeleting(true)}
                    className="flex-1 py-1.5 bg-rose-550/5 hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[10.5px] font-bold transition-all inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    연동 해제
                  </button>
                )}
              </div>
            </div>

            {/* Comments Thread Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20 dark:bg-slate-950/20">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-left bg-slate-50/50 dark:bg-slate-950/50 shrink-0 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  성모찹 교무메모 및 기록 ({selectedSheet.comments?.length || 0})
                </span>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none text-left">
                {selectedSheet.comments && selectedSheet.comments.length > 0 ? (
                  selectedSheet.comments.map(comment => (
                    <div 
                      key={comment.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl flex flex-col gap-1.5 shadow-2xs group relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">{comment.authorName}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        {comment.authorId === currentUser.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-slate-300 hover:text-rose-500 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="삭제"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed font-medium font-sans whitespace-pre-wrap break-all">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-8 text-center space-y-1.5 opacity-30">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                    <p className="text-[10.5px] font-bold text-slate-400">교직원 업무 메모가 없습니다.</p>
                  </div>
                )}
              </div>

              {/* Comment submit bar */}
              <form onSubmit={handleAddComment} className="p-3 border-t border-slate-100 dark:border-slate-850 shrink-0 bg-white dark:bg-slate-900 flex gap-1.5">
                <input
                  type="text"
                  placeholder="의견이나 전달 메모를 작성하세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-slate-50/70 border border-slate-150 outline-none text-xs rounded-xl px-3.5 py-2 text-slate-800 focus:border-blue-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center.5"
                >
                  등록
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* MODAL 1: ADD SHEET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl text-left"
          >
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">성모찹 공동 구글시트 연동 등록</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSheet} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">구인 시트 제목</label>
                <input
                  type="text"
                  placeholder="예: 2026학년도 방과후학교 수요조사 연동대장"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 font-bold focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">연동 카테고리</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 font-bold focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="학사/업무">학사/업무</option>
                    <option value="성적/평가">성적/평가</option>
                    <option value="연수/복지">연수/복지</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">등록 작성자</label>
                  <input
                    type="text"
                    value={`${currentUser.name} (${currentUser.department})`}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-450 dark:text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">구글시트 공유 링크 주소 (URL)</label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">세부 활용 안내 및 설명</label>
                <textarea
                  placeholder="시트 입력 마감기한이나, 작성 시 유의사항 등을 동료 교지사들에게 공지하세요."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 rounded-2xl p-4 text-[10.5px] text-blue-800 dark:text-blue-300 space-y-1">
                <h5 className="font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  연동 링킹 방법:
                </h5>
                <p className="leading-relaxed font-semibold">
                  구글스프레드시트 내에서 <strong>'공유' {"->"} '링크가 있는 모든 교과에 편집자/조회 권한 허용'</strong> 으로 지정한 시트 주소를 그대로 복사하여 붙여넣으십시오. 시스템 측에서 최적 임베드로 자동 트랜스폼 처리합니다.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-755 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  연동대장 등록
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: EDIT SHEET MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl text-left"
          >
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </span>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">성모찹 시트 정보 대장 수정</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSheet} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">구인 시트 제목</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 font-bold focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">연동 카테고리</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 font-bold focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="학사/업무">학사/업무</option>
                    <option value="성적/평가">성적/평가</option>
                    <option value="연수/복지">연수/복지</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">등록 작성자</label>
                  <input
                    type="text"
                    value={selectedSheet?.ownerName && `${selectedSheet.ownerName}`}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-450 dark:text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">공유 링크 주소 (Google Sheets URL)</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">세부 활용 안내 및 설명</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-755 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  대장내역 저장
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
