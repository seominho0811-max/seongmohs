/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, CalendarEvent, EventCategory } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  SlidersHorizontal,
  BellRing,
  Info
} from 'lucide-react';

interface CalendarModuleProps {
  currentUser: User;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed, so 5 = June
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewType, setViewType] = useState<'month' | 'week'>('month');

  // Reset deleting state when active event selection changes
  useEffect(() => {
    setIsDeleting(false);
  }, [selectedEvent]);

  // Filter keys
  const [filterSchool, setFilterSchool] = useState(true);
  const [filterDept, setFilterDept] = useState(true);
  const [filterPersonal, setFilterPersonal] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-06-03');
  const [endDate, setEndDate] = useState('2026-06-03');
  const [category, setCategory] = useState<EventCategory>('school');
  const [eventColor, setEventColor] = useState('#ef4444');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    setEvents(SchoolStorage.getEvents());
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    const newEvent: CalendarEvent = {
      id: `e_${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      category,
      department: category === 'dept' ? currentUser.department : undefined,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      color: eventColor,
      createdAt: new Date().toISOString()
    };

    SchoolStorage.addEvent(newEvent);
    setTitle('');
    setDescription('');
    setStartDate('2026-06-03');
    setEndDate('2026-06-03');
    setShowAddModal(false);
    loadEvents();
  };

  const handleDeleteEvent = (id: string) => {
    SchoolStorage.deleteEvent(id);
    setSelectedEvent(null);
    setIsDeleting(false);
    loadEvents();
  };

  const getMonthDaysCount = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getMonthFirstDayWeekday = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday ...
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedEvent(null);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedEvent(null);
  };

  // Category Theme Mapper
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'school': return { text: '학교 행사', bg: 'bg-red-50 text-red-600 border-red-100' };
      case 'dept': return { text: '부서 일정', bg: 'bg-blue-50 text-blue-600 border-blue-100' };
      default: return { text: '개인 일정', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    }
  };

  // Filtering Events
  const filteredEvents = events.filter(e => {
    if (e.category === 'school' && !filterSchool) return false;
    if (e.category === 'dept' && !filterDept) return false;
    if (e.category === 'personal' && !filterPersonal) return false;
    return true;
  });

  // Calendar Construction logic
  const daysInMonth = getMonthDaysCount(currentYear, currentMonth);
  const firstDayIndex = getMonthFirstDayWeekday(currentYear, currentMonth);
  const calendarCells = [];

  // Blank prefix squares
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }

  // Days list
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Helper to extract events taking place on a particular day (YYYY-MM-DD format parsed)
  const getEventsForDay = (day: number) => {
    const formattedDay = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(e => {
      const eStart = new Date(e.startDate).getTime();
      const eEnd = new Date(e.endDate).getTime();
      const current = new Date(formattedDay).getTime();
      return current >= eStart && current <= eEnd;
    });
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <div className="space-y-4">
      
      {/* Top Banner Control Panel */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">공유 학사 캘린더</h2>
            <p className="text-[11px] text-slate-400">교직원 간 업무 혼선 방지를 위한 실시간 행정 연간 일정표</p>
          </div>
        </div>

        {/* Filters and View Adjustments */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl text-xs font-bold gap-1 shrink-0">
            <button 
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewType === 'month' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              월간 보기
            </button>
            <button 
              onClick={() => { setViewType('week'); alert('주간 보기는 현재 기획 단계이며 임시로 월간 레이아웃을 참조합니다.'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewType === 'week' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              주간 보기
            </button>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            일정 등록
          </button>
        </div>
      </div>

      {/* Primary Calendar Body Workspace */}
      <div className="flex gap-4 items-start flex-col xl:flex-row">
        
        {/* Left Area: Main monthly Grid */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-50">
            {/* Legend checklist */}
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filterSchool} 
                  onChange={(e) => setFilterSchool(e.target.checked)}
                  className="rounded text-red-500 bg-red-100"
                />
                <span className="w-2.5 h-2.5 bg-[#ef4444] rounded-full"></span> 학교 행사
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filterDept} 
                  onChange={(e) => setFilterDept(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full"></span> 부서 일정
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filterPersonal} 
                  onChange={(e) => setFilterPersonal(e.target.checked)}
                  className="rounded text-green-500"
                />
                <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></span> 개인 일정
              </label>
            </div>

            {/* Date Swapping buttons */}
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg shrink-0">
                <ChevronLeft className="w-5 h-5 text-slate-500" />
              </button>
              <h3 className="text-sm font-extrabold text-slate-800 font-mono tracking-tight shrink-0">
                {currentYear}년 {monthNames[currentMonth]}
              </h3>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg shrink-0">
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Grid Layout structure */}
          <div className="space-y-1">
            
            {/* Week Headers */}
            <div className="grid grid-cols-7 text-center font-bold text-[11px] text-slate-400 uppercase py-2">
              <div className="text-red-500">일 (Sun)</div>
              <div>월 (Mon)</div>
              <div>화 (Tue)</div>
              <div>수 (Wed)</div>
              <div>목 (Thu)</div>
              <div>금 (Fri)</div>
              <div className="text-blue-500">토 (Sat)</div>
            </div>

            {/* Days grid slots */}
            <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-2xl overflow-hidden shadow-xs">
              {calendarCells.map((day, idx) => {
                const bgType = day === null ? 'bg-slate-100/30' : 'bg-white hover:bg-slate-50/50';
                const dayEvents = day !== null ? getEventsForDay(day) : [];
                const isSunday = idx % 7 === 0;
                const isSaturday = idx % 7 === 6;

                return (
                  <div 
                    key={idx}
                    className={`border-b border-r border-slate-100 calendar-grid-cell p-2 flex flex-col justify-between transition-colors ${bgType}`}
                  >
                    {day !== null ? (
                      <>
                        <div className="flex justify-between items-center pb-1">
                          <span className={`text-[11px] font-extrabold font-mono ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-slate-600'}`}>
                            {day}
                          </span>
                        </div>
                        {/* Event blocks listing */}
                        <div className="space-y-1 overflow-y-auto max-h-[75px] shrink-0">
                          {dayEvents.map(ev => (
                            <div 
                              key={ev.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                              className="px-1.5 py-0.5 text-[9.5px] font-bold text-white rounded-md cursor-pointer truncate shadow-xs transition-scale active:scale-95 hover:brightness-95 block text-center"
                              style={{ backgroundColor: ev.color }}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Area: Selected Agenda detail widget */}
        <div className="w-full xl:w-80 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-50 text-xs font-bold text-slate-800">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>일정 상세안 정보</span>
          </div>

          {selectedEvent ? (
            <div className="space-y-4 block text-left">
              <div 
                className="p-5 rounded-2xl text-white block"
                style={{ backgroundColor: selectedEvent.color }}
              >
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold mb-1.5 inline-block text-white">
                  {getCategoryTheme(selectedEvent.category).text}
                </span>
                <h3 className="text-xs font-bold break-all leading-relaxed">{selectedEvent.title}</h3>
              </div>

              <div className="space-y-2.5 text-xs text-slate-500">
                {selectedEvent.description && (
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-dashed text-[11px] leading-relaxed text-slate-600 font-medium">
                    {selectedEvent.description}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <span>시작 기간:</span>
                  <span className="font-extrabold text-slate-800 font-mono">{selectedEvent.startDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>종료 기간:</span>
                  <span className="font-extrabold text-slate-800 font-mono">{selectedEvent.endDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>등록자:</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.ownerName} 선생님</span>
                </div>
                
                {selectedEvent.department && (
                  <div className="flex justify-between items-center">
                    <span>관련 부서:</span>
                    <span className="font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px]">{selectedEvent.department}</span>
                  </div>
                )}
              </div>

              {/* Delete button for all logged-in teachers */}
              {true && (
                isDeleting ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2 text-left">
                    <p className="text-[11px] text-rose-700 font-bold block">정말 이 일정을 삭제하시겠습니까?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDeleting(false)}
                        className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsDeleting(true)}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    일정 영구 삭제
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-1.5">
              <Calendar className="w-10 h-10 stroke-1" />
              <p>캘린더 전표 내 특정 행사를 클릭하시면 세부적인 계획 이력을 확인할 수 있습니다.</p>
            </div>
          )}

          {/* Tips of notice */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p>학교 전체행사는 전직원에게 공통 적용되며, 부서행사는 소속 멤버 위주로 상호 공유됩니다.</p>
          </div>
        </div>

      </div>

      {/* Add Agenda Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleCreateEvent} 
            className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-800">새 교무학사 일정 등록</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">일정 타이틀</label>
                <input 
                  type="text" 
                  placeholder="예: 3학년 모의고사 평가일정"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-300 transition-all font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">시작일자</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">종료일자</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                  <span>목적 분류</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => { setCategory('school'); setEventColor('#ef4444'); }}
                    className={`py-2 text-[11px] font-bold rounded-xl border text-center transition-colors ${category === 'school' ? 'bg-red-50 text-red-600 border-red-300' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100'}`}
                  >
                    학교 공행사
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setCategory('dept'); setEventColor('#3b82f6'); }}
                    className={`py-2 text-[11px] font-bold rounded-xl border text-center transition-colors ${category === 'dept' ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100'}`}
                  >
                    부서 행사
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setCategory('personal'); setEventColor('#10b981'); }}
                    className={`py-2 text-[11px] font-bold rounded-xl border text-center transition-colors ${category === 'personal' ? 'bg-emerald-50 text-emerald-600 border-emerald-300' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100'}`}
                  >
                    개인 일정
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">일정 세부 계획정보</label>
                <textarea 
                  rows={3}
                  placeholder="추가적인 대피 동선, 장소, 준비물 요건 기입..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                취소
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                일정등록
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
