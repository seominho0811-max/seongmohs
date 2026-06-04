/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from './types';
import { SchoolStorage } from './lib/schoolStorage';
import { HomeDashboard } from './components/HomeDashboard';
import { ChatRoom } from './components/ChatRoom';
import { NoticeBoard } from './components/NoticeBoard';
import { FilesArchiver } from './components/FilesArchiver';
import { CalendarModule } from './components/CalendarModule';
import { SurveyModule } from './components/SurveyModule';
import { ContactsModule } from './components/ContactsModule';
import { AdminPanel } from './components/AdminPanel';
import { SeongmucheopModule } from './components/SeongmucheopModule';

import { 
  Home, 
  MessageSquare, 
  Megaphone, 
  FolderOpen, 
  Calendar, 
  FileSpreadsheet, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Menu, 
  X, 
  LogOut, 
  Moon, 
  Sun, 
  Sparkles,
  Search,
  BellRing,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom deep argument passing
  const [contactsSearchArg, setContactsSearchArg] = useState<{ query?: string } | undefined>(undefined);

  // States for name login and suggestions
  const [allUsersList, setAllUsersList] = useState<User[]>([]);
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showTeacherList, setShowTeacherList] = useState(false);

  const loadFromStorage = () => {
    const users = SchoolStorage.getUsers();
    setAllUsersList(users);

    const cached = localStorage.getItem('school_current_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const exists = users.find(u => u.id === parsed.id || u.name === parsed.name);
        if (exists) {
          setCurrentUser(exists);
        } else {
          localStorage.removeItem('school_current_user');
          setCurrentUser(null);
        }
      } catch (e) {
        localStorage.removeItem('school_current_user');
        setCurrentUser(null);
      }
    }
  };

  // Load initialized storage
  useEffect(() => {
    SchoolStorage.initialize();
    loadFromStorage();

    const handleStorageChange = () => {
      loadFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleDemoLogin = (user: User) => {
    localStorage.setItem('school_current_user', JSON.stringify(user));
    setCurrentUser(user);
    setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('school_current_user');
    setCurrentUser(null);
  };

  const handleGoogleLogin = () => {
    const minho = allUsersList.find(u => u.email === 'seominho0811@gmail.com');
    if (minho) {
      handleDemoLogin(minho);
    } else {
      // Find anyone as fallback
      const principal = allUsersList.find(u => u.role === 'admin');
      if (principal) {
        handleDemoLogin(principal);
      }
    }
  };

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const trimmedName = loginName.trim();
    if (!trimmedName) {
      setLoginError('이름을 입력해 주십시오.');
      return;
    }
    if (!loginPassword) {
      setLoginError('비밀번호를 입력해 주십시오.');
      return;
    }

    const matched = allUsersList.find(u => u.name === trimmedName);
    if (!matched) {
      setLoginError('등록되지 않은 교직원 이름입니다. 성함을 다시 확인해 주세요.');
      return;
    }

    if (loginPassword !== '1234') {
      setLoginError('비밀번호가 일치하지 않습니다. (로그인 비밀번호: 1234)');
      return;
    }

    handleDemoLogin(matched);
  };

  const menuItems = [
    { id: 'home', label: '종합 대시보드', icon: <Home className="w-4 h-4" /> },
    { id: 'notices', label: '공지 및 의사수렴', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'seongmucheop', label: '성모찹 (구글 시트)', icon: <BookOpen className="w-4 h-4 text-emerald-500" /> },
    { id: 'chat', label: '온라인 교무실 (소통)', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'files', label: '학교 행정 자료실', icon: <FolderOpen className="w-4 h-4 text-sky-500 fill-sky-50/10" /> },
    { id: 'calendar', label: '공유 학사일정', icon: <Calendar className="w-4 h-4 text-emerald-500" /> },
    { id: 'surveys', label: '의견 수렴 설문조사', icon: <FileSpreadsheet className="w-4 h-4 text-indigo-500" /> },
    { id: 'contacts', label: '교직원 조직원 주소록', icon: <Users className="w-4 h-4" /> },
  ];

  // Admin tab is conditional
  if (currentUser && currentUser.role === 'admin') {
    menuItems.push({ id: 'admin', label: '시스템 관리실 (통제)', icon: <ShieldCheck className="w-4 h-4 text-rose-500" /> });
  }

  // Handle global search triggering
  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Redirect to contacts search or notice board
    setContactsSearchArg({ query: searchQuery });
    setActiveTab('contacts');
    setSearchQuery('');
  };

  const handleDeepNavigate = (tab: string, arg?: any) => {
    if (arg && tab === 'contacts') {
      setContactsSearchArg(arg);
    }
    setActiveTab(tab);
  };

  const filteredSuggestions = loginName.trim()
    ? allUsersList.filter(u => u.name.includes(loginName.trim()))
    : allUsersList;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-800'} transition-colors flex flex-col font-sans`}>
      
      {/* AUTHENTICATION LOGIN MOCK SCREEN */}
      {!currentUser ? (
        <div className="flex-1 flex items-center justify-center p-4 py-8 relative overflow-hidden">
          {/* Decorative backdrop elements */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none"></div>

          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md w-full max-w-lg p-7 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-5 relative z-10 transition-all max-h-[95vh] overflow-y-auto">
            <div className="space-y-2 block">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-extrabold tracking-wider uppercase mx-auto">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> SMART TEACHERS COLLABORATION
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-relaxed">대전성모여고 온라인 교무실</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal font-semibold">교장 송미령, 교감 이정호 외 49명의 교직원 공동 협업 시스템</p>
            </div>

            {/* DIRECT LOGIN FORM */}
            <form onSubmit={handleDirectLogin} className="space-y-4 text-left p-4.5 bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">인증수단 1: 이름 및 비밀번호 로그인</span>
              
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400">교직원 성명</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="성명을 입력하거나 목록 수단으로 선택 (예시: 송미령)"
                    value={loginName}
                    onChange={(e) => {
                      setLoginName(e.target.value);
                      setShowTeacherList(true);
                      setLoginError('');
                    }}
                    onFocus={() => setShowTeacherList(true)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 shadow-xs"
                  />
                  {loginName && (
                    <button 
                      type="button"
                      onClick={() => { setLoginName(''); setShowTeacherList(false); }}
                      className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      지우기
                    </button>
                  )}
                </div>

                {/* Suggestions list dropdown */}
                {showTeacherList && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-1.5 space-y-0.5">
                    <div className="flex justify-between items-center px-2 py-1 text-[9px] text-slate-400 font-bold border-b border-slate-50 dark:border-slate-800 mb-1">
                      <span>교직원 검색 ({filteredSuggestions.length}명 매칭)</span>
                      <button type="button" onClick={() => setShowTeacherList(false)} className="text-blue-500 hover:underline cursor-pointer">닫기</button>
                    </div>
                    {filteredSuggestions.length === 0 ? (
                      <p className="text-[10px] text-slate-400 p-2 text-center">매칭되는 교직원이 없습니다.</p>
                    ) : (
                      filteredSuggestions.map(u => (
                        <div 
                          key={u.id}
                          onClick={() => {
                            setLoginName(u.name);
                            setShowTeacherList(false);
                          }}
                          className="px-3 py-2 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between items-center transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{u.name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{u.department} • {u.task}</span>
                          </div>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono">내선 {u.extension}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400">로그인 비밀번호</label>
                <input 
                  type="password" 
                  placeholder="비밀번호(1234)를 입력하십시오"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 shadow-xs"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-[11px] font-bold block">
                  ⚠️ {loginError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 cursor-pointer rounded-xl font-bold text-xs text-white tracking-wide shadow-md hover:shadow-lg transition-all"
              >
                본 성명으로 교무실 입장
              </button>
            </form>

            {/* Quick login select shortcuts */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-left space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">원클릭 직무 가상 키 (대표 교사 간편 로그인)</span>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: '송미령', label: '교장실', role: '교장 (관리자)' },
                  { name: '이정호', label: '교감실', role: '교감 (부관리자)' },
                  { name: '서민호', label: '연구개발부', role: '교사 (부장)' }
                ].map(item => {
                  return (
                    <div 
                      key={item.name}
                      onClick={() => {
                        const target = allUsersList.find(u => u.name === item.name);
                        if (target) {
                          setLoginName(item.name);
                          setLoginPassword('1234');
                          handleDemoLogin(target);
                        }
                      }}
                      className="p-3 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/10 dark:hover:bg-slate-800/40 transition-all shadow-2xs group"
                    >
                      <div className="text-[11px] font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600">{item.name}</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{item.role}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Google Identity Providers Mock Button */}
            <div className="space-y-2">
              <div 
                onClick={handleGoogleLogin}
                className="w-full flex items-center gap-3 p-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 cursor-pointer text-white font-extrabold text-xs tracking-wide rounded-2xl justify-center shadow-md transition-all active:scale-98"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google 계정으로 편리한 입장</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIRTUAL TEACHERS OFFICE PRIMARY WORKSPACE ENGINE */
        <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
          
          {/* COLLAPSIBLE SIDEBAR */}
          <div className={`${isSidebarOpen ? 'w-64' : 'w-0 md:w-16'} bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300 overflow-hidden relative z-40`}>
            
            <div className="block">
              {/* Header Title branding */}
              <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-white font-black text-xs">
                    온
                  </div>
                  <div className="space-y-0.5 truncate leading-none">
                    <h1 className="text-xs font-extrabold text-slate-800 dark:text-white tracking-tight">온라인 교무실</h1>
                    <span className="text-[8.5px] text-slate-400 font-mono tracking-widest uppercase font-bold">Teachers' Office</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 md:hidden shrunk-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Collapsed view toggle for desktop */}
              <div className="hidden md:block absolute top-[14px] right-[-12px] transform translate-x-[-12px] z-50">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                  className="w-6 h-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {isSidebarOpen ? '◀' : '▶'}
                </button>
              </div>

              {/* Navigation Items menu list */}
              <nav className="p-3 space-y-1 overflow-y-auto max-h-[70vh]">
                {menuItems.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => handleDeepNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all relative ${isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                    >
                      {item.icon}
                      {isSidebarOpen && <span className="truncate">{item.label}</span>}
                      
                      {/* unread indicators bubble simulations */}
                      {item.id === 'chat' && isSidebarOpen && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Identity Session card & controls footer */}
            {isSidebarOpen && (
              <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-3 shrink-0 bg-slate-50/20 dark:bg-slate-900/30">
                <div className="flex items-center gap-2.5 block text-left">
                  <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-blue-700 dark:text-blue-400 shrink-0 capitalize">
                    {currentUser.name.charAt(0)}
                  </div>
                  
                  <div className="space-y-0.5 min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</span>
                      <span className={`px-1 py-0.2 rounded text-[7px] font-bold ${currentUser.role === 'admin' ? 'bg-rose-50 text-rose-600' : currentUser.role === 'dept_manager' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        {currentUser.role === 'admin' ? '교장' : currentUser.role === 'dept_manager' ? '부장' : '부교'}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 dark:text-slate-500 truncate font-semibold">#{currentUser.extension} • {currentUser.department}</p>
                  </div>
                </div>

                {/* Sub controls button bar */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setIsDark(!isDark)}
                    className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
                    title="테마 전환"
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg flex items-center gap-1.5 text-[11px] font-bold"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    로그아웃
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* MAIN PAGE CANVAS VIEW CONTAINER */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* TOP ACTIONS CONTROL AND GLOBAL HEADER NAVIGATION BAR */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 h-14 shrink-0 flex items-center justify-between px-6 relative z-30">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 block"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-mono">현재 교단 시각: 2026-06-03 14:42 (수요일)</span>
                </div>
              </div>

              {/* Global contacts and Notice search engine */}
              <form onSubmit={handleGlobalSearchSubmit} className="relative w-64 max-w-xs block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="통합 교직원/업무 내선 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 hover:bg-slate-100/50 outline-none text-xs rounded-xl pl-8 pr-3 py-1.5 text-slate-700 dark:text-slate-200"
                />
              </form>
            </header>

            {/* DYNAMIC SCROLLER VIEWS ROUTER */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeTab === 'home' && (
                <HomeDashboard currentUser={currentUser} onNavigate={handleDeepNavigate} />
              )}
              {activeTab === 'notices' && (
                <NoticeBoard currentUser={currentUser} onNavigate={handleDeepNavigate} />
              )}
              {activeTab === 'seongmucheop' && (
                <SeongmucheopModule currentUser={currentUser} />
              )}
              {activeTab === 'chat' && (
                <ChatRoom currentUser={currentUser} />
              )}
              {activeTab === 'files' && (
                <FilesArchiver currentUser={currentUser} />
              )}
              {activeTab === 'calendar' && (
                <CalendarModule currentUser={currentUser} />
              )}
              {activeTab === 'surveys' && (
                <SurveyModule currentUser={currentUser} />
              )}
              {activeTab === 'contacts' && (
                <ContactsModule currentUser={currentUser} onNavigate={handleDeepNavigate} deepQuery={contactsSearchArg} />
              )}
              {activeTab === 'admin' && (
                <AdminPanel currentUser={currentUser} />
              )}
            </main>

          </div>

        </div>
      )}

    </div>
  );
}
