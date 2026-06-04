/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, CalendarEvent, FileRecord, ChatMessage, ChatRoom } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  ChevronRight,
  Send
} from 'lucide-react';
import { CalendarModule } from './CalendarModule';

const getWeatherInfo = (code: number) => {
  if (code === 0) return { label: '맑음', icon: '☀️' };
  if ([1, 2, 3].includes(code)) return { label: '흐림', icon: '⛅' };
  if ([45, 48].includes(code)) return { label: '안개', icon: '🌫️' };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { label: '비', icon: '🌧️' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: '눈', icon: '❄️' };
  if ([95, 96, 99].includes(code)) return { label: '뇌우', icon: '⚡' };
  return { label: '맑음', icon: '☀️' };
};

interface HomeDashboardProps {
  currentUser: User;
  onNavigate: (tab: string, arg?: any) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ currentUser, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<{ temp: number; label: string; icon: string } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    const msgs = SchoolStorage.getMessages('room_all');
    setMessages(msgs);
  };

  const loadUsers = () => {
    const allUsers = SchoolStorage.getUsers();
    setUsers(allUsers);
  };

  useEffect(() => {
    loadMessages();
    loadUsers();

    // Listen to local storage updates to sync messages in real-time
    const handleStorageUpdate = () => {
      loadMessages();
      loadUsers();
    };

    window.addEventListener('storage', handleStorageUpdate);

    // Dynamic digital clock (Simple formatting: YYYY. MM. DD. (요일) HH:mm)
    const updateTime = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const day = dayNames[now.getDay()];
      
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      
      setCurrentTime(`${yyyy}. ${mm}. ${dd}. (${day}) ${hh}:${min}`);
    };
    updateTime();
    const intervalRef = setInterval(updateTime, 10000);

    // Fetch live Daejeon weather from Open-Meteo
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=36.3504&longitude=127.3845&current=temperature_2m,weather_code');
        if (res.ok) {
          const data = await res.json();
          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          const { label, icon } = getWeatherInfo(code);
          setWeather({ temp, label, icon });
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        // Clean fallback
        setWeather({ temp: 22, label: '맑음', icon: '☀️' });
      }
    };
    fetchWeather();

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      clearInterval(intervalRef);
    };
  }, [currentUser]);

  // Scroll to bottom of chat automatically on load or new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      roomId: 'room_all',
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: newMessage,
      createdAt: new Date().toISOString(),
      readBy: [currentUser.id]
    };

    SchoolStorage.addMessage(msg);
    setNewMessage('');
    loadMessages();
  };

  const getUserDetails = (userId: string) => {
    return users.find(u => u.id === userId);
  };



  return (
    <div className="space-y-6">
      {/* Top Banner Widget */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-2xl py-4 px-6 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_120%,rgba(120,119,198,0.2),transparent_50%)]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {currentUser.name} {currentUser.role === 'admin' ? '관리자' : currentUser.role === 'dept_manager' ? '부장' : '선생님'}, 반갑습니다!
            </h1>
            <p className="text-blue-100 text-xs max-w-xl">
              소속: <span className="font-semibold text-white">{currentUser.department}</span> • 담당 업무: <span className="font-semibold text-white">{currentUser.task}</span> • 교무실 번호: <span className="font-semibold text-white">#{currentUser.extension}</span>
            </p>
          </div>
          <div className="text-left md:text-right flex flex-col md:items-end gap-1 shrink-0">
            <div className="space-y-0.5">
              <p className="text-sm font-medium font-mono tracking-tight text-white">{currentTime || "Loading..."}</p>
            </div>
            {weather && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-lg text-xs font-medium text-blue-50 transition-colors mt-0.5">
                <span className="text-sm">{weather.icon}</span>
                <span>대전 {weather.label}</span>
                <span className="font-mono text-white">{weather.temp}°C</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Academic Calendar */}
        <div className="xl:col-span-8">
          <CalendarModule currentUser={currentUser} />
        </div>

        {/* Right Column: Live Chat Room */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col h-[520px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  전체 교직원 공지 소통방
                </h2>
              </div>
              <button 
                onClick={() => onNavigate('chat')} 
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 transition-colors"
                title="전체 대화방으로 이동"
              >
                소통참여 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat List Stream */}
            <div className="flex-1 overflow-y-auto py-3.5 space-y-3.5 pr-1 min-h-0 text-xs text-left">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const senderDetails = getUserDetails(msg.senderId);
                const dept = senderDetails?.department || "교무실";
                const task = senderDetails?.task && senderDetails.task !== '-' ? senderDetails.task : "";

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-800">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-medium">
                        {dept} {task && `• ${task}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`max-w-[90%] rounded-2xl px-3.5 py-2 whitespace-pre-wrap leading-relaxed shadow-sm transition-all ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100/80 rounded-tl-none border border-slate-100'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-1">
                  <MessageSquare className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                  <p className="text-center font-medium">소통방에 대화 내용이 없습니다.</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Micro chat sender input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-50 shrink-0 flex gap-2">
              <input 
                type="text" 
                placeholder="전체 소통방에 메시지 전송..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 min-w-0 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-100 focus:border-blue-500 outline-none text-xs rounded-xl px-3.5 py-2.5 text-slate-700 transition-all placeholder:text-slate-400"
              />
              <button 
                type="submit" 
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-200 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
