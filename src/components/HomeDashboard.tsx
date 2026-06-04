/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Notice, CalendarEvent, FileRecord, ChatMessage, ChatRoom } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  Calendar, 
  Bell, 
  Search, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';

interface HomeDashboardProps {
  currentUser: User;
  onNavigate: (tab: string, arg?: any) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ currentUser, onNavigate }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Load dashboard metrics
    const rawNotices = SchoolStorage.getNotices();
    setNotices(rawNotices.slice(0, 3)); // Top 3

    const rawEvents = SchoolStorage.getEvents();
    // Sort events by date
    const sortedEvents = [...rawEvents].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    setEvents(sortedEvents);

    // Dynamic digital clock
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', month: 'long', day: 'numeric', 
        weekday: 'short', hour: '2-digit', minute: '2-digit' 
      };
      setCurrentTime(now.toLocaleDateString('ko-KR', options));
    };
    updateTime();
    const intervalRef = setInterval(updateTime, 10000);

    return () => clearInterval(intervalRef);
  }, [currentUser]);

  // Handle global dashboard search across notices & files & contacts
  const handleDashboardSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    // Route User based on query type or notify them
    alert(`"${searchTerm}" 검색 결과를 해당 탭에서 탐색합니다.`);
    onNavigate('contacts', { query: searchTerm });
  };

  const getNoticeCategoryColor = (category: string) => {
    switch (category) {
      case '교무': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case '연구': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case '생활교육': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case '행사': return 'bg-purple-50 text-purple-600 border border-purple-100';
      case '연수': return 'bg-rose-50 text-rose-600 border border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };



  return (
    <div className="space-y-6">
      {/* Top Banner Widget */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_120%,rgba(120,119,198,0.2),transparent_50%)]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-xs font-semibold rounded-full text-blue-100">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              스마트 교직 인프라
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {currentUser.name} {currentUser.role === 'admin' ? '관리자' : currentUser.role === 'dept_manager' ? '부장' : '선생님'}, 반갑습니다!
            </h1>
            <p className="text-blue-100 text-sm max-w-xl">
              소속: <span className="font-semibold text-white">{currentUser.department}</span> • 담당 업무: <span className="font-semibold text-white">{currentUser.task}</span> • 교무실 번호: <span className="font-semibold text-white">#{currentUser.extension}</span>
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-indigo-100 text-xs tracking-wider uppercase font-medium">현지 일자 및 시각</p>
            <p className="text-lg font-semibold font-mono tracking-tight text-white">{currentTime || "Loading..."}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              교무실 네트워크 정상 작동 중
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Operations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Search Widget */}
          <form onSubmit={handleDashboardSearch} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="자료실 문서, 연락망 담당자, 학교 소식을 한번에 검색하세요..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm"
            />
            <button type="submit" className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium rounded-lg shrink-0 transition-colors">
              통합검색
            </button>
          </form>

          {/* Core Bento Card: Notices */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-500" />
                최신 학교 공지사항
              </h2>
              <button 
                onClick={() => onNavigate('notices')} 
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
              >
                전체보기 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {notices.map((notice) => (
                <div 
                  key={notice.id} 
                  onClick={() => onNavigate('notices', { selectedNoticeId: notice.id })}
                  className="py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50/50 cursor-pointer rounded-lg px-2 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.isPinned && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 rounded-md">
                          중요고정
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${getNoticeCategoryColor(notice.category)}`}>
                        {notice.category}
                      </span>
                      <span className="text-[11px] text-slate-400">{notice.authorName}•{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1">
                      {notice.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                    조회 {notice.views}
                  </span>
                </div>
              ))}
            </div>
          </div>



        </div>

        {/* Right 1 Col: Notification Sidebar */}
        <div className="space-y-6">
          
          {/* Calendar Agenda widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                다가오는 교육 일정
              </h2>
              <button 
                onClick={() => onNavigate('calendar')} 
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                달력보기
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {events.slice(0, 5).map(event => (
                <div key={event.id} className="flex gap-3 text-xs group">
                  <div className="w-1 rounded bg-blue-500 shrink-0" style={{ backgroundColor: event.color }}></div>
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold text-slate-700 truncate">{event.title}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <span>{event.startDate}</span>
                      {event.startDate !== event.endDate && (
                        <>
                          <span>~</span>
                          <span>{event.endDate}</span>
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{event.description}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">등록된 일정이 없습니다.</p>
              )}
            </div>
          </div>



        </div>

      </div>
    </div>
  );
};
