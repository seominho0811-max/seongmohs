/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Survey, SurveyQuestion, SurveyResponse } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  BarChart, 
  Layers, 
  Users, 
  Clock,
  ChartPie,
  Eye,
  Info
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SurveyModuleProps {
  currentUser: User;
}

export const SurveyModule: React.FC<SurveyModuleProps> = ({ currentUser }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab2] = useState<'details' | 'stats'>('details');

  // New Survey Creation State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  
  // Question Builder State
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'single' | 'multiple' | 'text'>('single');
  const [qOptions, setQOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  // active survey responses state (filling form)
  const [answers, setAnswers] = useState<{ [qId: string]: string | string[] }>({});

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = () => {
    const raw = SchoolStorage.getSurveys();
    setSurveys(raw);
    if (raw.length > 0) {
      setSelectedSurvey(raw[0]);
    }
  };

  const handleAddOptionToBuilder = () => {
    if (!newOption.trim()) return;
    setQOptions(prev => [...prev, newOption]);
    setNewOption('');
  };

  const handleAddQuestionToSurvey = () => {
    if (!qText.trim()) return;
    const newQ: SurveyQuestion = {
      id: `q_${Date.now()}`,
      type: qType,
      questionText: qText,
      options: qType !== 'text' ? qOptions : undefined
    };

    setQuestions(prev => [...prev, newQ]);
    
    // Clear Builder
    setQText('');
    setQType('single');
    setQOptions([]);
  };

  const handleCreateSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) return;

    const newSurvey: Survey = {
      id: `s_${Date.now()}`,
      title,
      description,
      authorId: currentUser.id,
      authorName: currentUser.name,
      isClosed: false,
      isAnonymous,
      questions,
      responses: [],
      createdAt: new Date().toISOString()
    };

    SchoolStorage.addSurvey(newSurvey);
    
    // Reset Form
    setTitle('');
    setDescription('');
    setIsAnonymous(true);
    setQuestions([]);
    setIsCreating(false);

    loadSurveys();
  };

  const handleResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;

    // Build Response Object
    const responseData: SurveyResponse = {
      userId: currentUser.id,
      userName: selectedSurvey.isAnonymous ? undefined : currentUser.name,
      answers,
      createdAt: new Date().toISOString()
    };

    const updatedResponses = [...(selectedSurvey.responses || []), responseData];
    const updatedSurvey = { ...selectedSurvey, responses: updatedResponses };

    SchoolStorage.updateSurvey(updatedSurvey);
    setSelectedSurvey(updatedSurvey);
    setAnswers({});
    loadSurveys();
    alert('설문 투표가 성공적으로 전송되었습니다.');
    setActiveTab2('stats');
  };

  const handleSingleAnswerChange = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleMultipleAnswerChange = (qId: string, value: string, checked: boolean) => {
    const currentAnswers = (answers[qId] as string[]) || [];
    let updated;
    if (checked) {
      updated = [...currentAnswers, value];
    } else {
      updated = currentAnswers.filter(v => v !== value);
    }
    setAnswers(prev => ({ ...prev, [qId]: updated }));
  };

  // Check if current user has already answered this survey
  const hasResponded = selectedSurvey?.responses.some(r => r.userId === currentUser.id);

  // Compute Statistics for a single choice or checklist question
  const computeQuestionStats = (q: SurveyQuestion) => {
    if (!selectedSurvey || !q.options) return [];
    
    const countMap: { [option: string]: number } = {};
    // Init map
    q.options.forEach(opt => {
      countMap[opt] = 0;
    });

    selectedSurvey.responses.forEach(res => {
      const ansVal = res.answers[q.id];
      if (Array.isArray(ansVal)) {
        ansVal.forEach(v => {
          if (countMap[v] !== undefined) countMap[v]++;
        });
      } else if (ansVal) {
        if (countMap[ansVal] !== undefined) countMap[ansVal]++;
      }
    });

    // Translate to recharts readable data
    return q.options.map(opt => ({
      name: opt,
      count: countMap[opt] || 0
    }));
  };

  const getStarredColorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const canCreate = currentUser.role === 'admin' || currentUser.role === 'dept_manager';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex min-h-[660px] overflow-hidden">
      
      {/* LEFT LIST SECTION */}
      <div className={`w-80 border-r border-slate-100 flex flex-col ${selectedSurvey ? 'hidden md:flex' : 'w-full'}`}>
        <div className="p-5 border-b border-slate-50 space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">교직원 설문조사</h2>
            {canCreate && (
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                설문 등록
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">학습동아리 회비 결산, 하반기 연수, 대청소 등의 교직원 합의 수렴</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {surveys.map(survey => {
            const isSelected = selectedSurvey?.id === survey.id;
            const isDone = survey.responses.some(r => r.userId === currentUser.id);
            
            return (
              <div 
                key={survey.id}
                onClick={() => { setSelectedSurvey(survey); setIsCreating(false); }}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors block text-left ${isSelected ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : ''}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      응답자 {survey.responses.length}명
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {isDone ? '참여완료' : '투표필요'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-700 line-clamp-1">{survey.title}</h3>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{survey.description}</p>
                </div>
              </div>
            );
          })}
          {surveys.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-12">현재 수립 완료된 설문 목록이 없습니다.</p>
          )}
        </div>
      </div>

      {/* RIGHT WORKING AREA */}
      <div className="flex-1 flex flex-col bg-slate-50/20">
        
        {isCreating ? (
          /* Survey creation frame */
          <form onSubmit={handleCreateSurveySubmit} className="p-6 h-full overflow-y-auto space-y-5 bg-white text-left">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="text-sm font-bold text-slate-800">새 교직원 설문조사 발기</h3>
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="text-slate-400 text-xs font-bold"
              >
                ✕ 닫기
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">설문 대안안 명칭</label>
                  <input 
                    type="text" 
                    placeholder="예: 2026 하절기 전체회식 장소 선호조사"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white text-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">설문 개요 설명</label>
                  <textarea 
                    rows={3}
                    placeholder="교사 분들의 구체적인 의견 수집 목적을 안내해 주시기 바랍니다."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="anonymous_check"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <label htmlFor="anonymous_check" className="text-xs font-bold text-slate-700 cursor-pointer">익명 응답 보장 (비밀 투표)</label>
                </div>

                {/* Listing added questions */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <span className="text-[11px] font-bold text-slate-400 block">추가된 질문 품목 ({questions.length})</span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {questions.map((q, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Q{idx+1} • {q.type === 'single' ? '객관선택' : q.type === 'multiple' ? '다중선택' : '주관기입'}</span>
                          <p className="text-xs font-semibold text-slate-700 leading-normal">{q.questionText}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setQuestions(prev => prev.filter((_, qI) => qI !== idx))}
                          className="text-rose-500 font-bold text-[10px]"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    {questions.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-100">질문을 아래 툴을 사용하여 최소 1개 추가해야 작성 가능합니다.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Question creator helper container */}
              <div className="bg-slate-50/50 p-4 border border-dashed border-slate-200 rounded-2xl space-y-3 block text-left">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                  질문 추가 빌더
                </h4>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">질문 내용</label>
                  <input 
                    type="text" 
                    placeholder="예: 참여 희망 요일을 정하여 주세요."
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-100 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">답변 형식</label>
                  <select 
                    value={qType}
                    onChange={(e) => setQType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-100 rounded-lg"
                  >
                    <option value="single">단일 객관식 (하나만 선택)</option>
                    <option value="multiple">다중 객관식 (여러개 선택)</option>
                    <option value="text">주관식 서술형</option>
                  </select>
                </div>

                {qType !== 'text' && (
                  <div className="space-y-2 border-t border-white pt-2">
                    <label className="text-[10px] font-bold text-slate-400 block">선택 보기 옵션 추가 ({qOptions.length}개 추가됨)</label>
                    
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        placeholder="예: 수요일 방과후"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-100 rounded-lg outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddOptionToBuilder}
                        className="px-3 bg-slate-900 text-white rounded-lg text-xs font-bold shrink-0"
                      >
                        주가
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {qOptions.map((opt, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] text-slate-600 font-medium">
                          {opt}
                          <button type="button" onClick={() => setQOptions(prev => prev.filter((_, oIdx) => oIdx !== i))} className="text-slate-400 hover:text-black">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleAddQuestionToSurvey}
                  disabled={!qText.trim()}
                  className="w-full py-2 bg-blue-600 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xs rounded-xl"
                >
                  질문 추가 완료
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={questions.length === 0}
              className="w-full py-3 bg-slate-900 disabled:bg-slate-100 text-white disabled:text-slate-400 font-extrabold text-xs tracking-wide rounded-2xl block text-center mt-4 shadow-md transition-colors"
            >
              설문조사 배포 및 공표하기
            </button>
          </form>
        ) : selectedSurvey ? (
          /* Survey submission / statistics viewing */
          <div className="bg-white p-6 h-full overflow-y-auto space-y-6 flex flex-col justify-between text-left">
            
            <div className="space-y-4">
              <div className="space-y-2 pb-3 border-b border-slate-50">
                <div className="flex flex-wrap gap-2 items-center text-[10.5px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="font-mono text-slate-400">등록자: {selectedSurvey.authorName} • {new Date(selectedSurvey.createdAt).toLocaleDateString()}</span>
                  <span className="ml-auto bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full uppercase text-[9px]">
                    {selectedSurvey.isAnonymous ? '익명 투표' : '기명 투표'}
                  </span>
                </div>

                <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                  {selectedSurvey.title}
                </h2>
                {selectedSurvey.description && (
                  <p className="text-xs text-slate-500 italic block">
                    {selectedSurvey.description}
                  </p>
                )}
              </div>

              {/* TABS: Fill Poll Vs View Statistics */}
              <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
                <button 
                  onClick={() => setActiveTab2('details')}
                  className={`w-1/2 py-2 rounded-lg transition-colors ${activeTab === 'details' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  의견 투표 발기 ({hasResponded ? '참여완료' : '투표 작성'})
                </button>
                <button 
                  onClick={() => setActiveTab2('stats')}
                  className={`w-1/2 py-2 rounded-lg transition-colors ${activeTab === 'stats' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  투표 현황 차트 ({selectedSurvey.responses.length}명 참여)
                </button>
              </div>

              {activeTab === 'details' ? (
                /* 1. Poll Answer Form Mode */
                hasResponded ? (
                  <div className="py-12 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                    <CheckCircle className="w-12 h-12 text-emerald-500 stroke-1" />
                    <h4 className="text-sm font-bold text-slate-800">이 설문조사에 이미 참여하셨습니다.</h4>
                    <p className="text-xs text-slate-400">교사님의 소중한 기여에 감사드립니다. 상단 탭에서 실시간 차트를 확인하세요.</p>
                  </div>
                ) : (
                  <form onSubmit={handleResponseSubmit} className="space-y-5">
                    {selectedSurvey.questions.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">문항 {idx+1}</span>
                        <h4 className="text-xs font-extrabold text-slate-800 leading-normal">{q.questionText}</h4>

                        {/* Rendering based on type */}
                        {q.type === 'single' && q.options && (
                          <div className="space-y-2">
                            {q.options.map(opt => (
                              <label key={opt} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200/50 hover:bg-blue-50/10 cursor-pointer text-xs">
                                <input 
                                  type="radio" 
                                  name={`q_${q.id}`} 
                                  checked={answers[q.id] === opt}
                                  onChange={() => handleSingleAnswerChange(q.id, opt)}
                                  className="w-4 h-4 text-blue-600 border-slate-300"
                                  required
                                />
                                <span className="font-semibold text-slate-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === 'multiple' && q.options && (
                          <div className="space-y-2">
                            {q.options.map(opt => {
                              const ansArr = (answers[q.id] as string[]) || [];
                              const isChecked = ansArr.includes(opt);
                              return (
                                <label key={opt} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-[#e2e8f0]/50 hover:bg-blue-50/10 cursor-pointer text-xs">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={(e) => handleMultipleAnswerChange(q.id, opt, e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                  />
                                  <span className="font-semibold text-slate-700">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'text' && (
                          <textarea 
                            rows={3}
                            placeholder="의견을 명확하게 기입해 주세요..."
                            value={(answers[q.id] as string) || ''}
                            onChange={(e) => handleSingleAnswerChange(q.id, e.target.value)}
                            className="w-full text-xs p-3 bg-white border border-slate-100 rounded-xl outline-none"
                            required
                          />
                        )}
                      </div>
                    ))}

                    <button 
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all block text-center"
                    >
                      응답 의견 제출 완료
                    </button>
                  </form>
                )
              ) : (
                /* 2. Poll Statistics Mode */
                <div className="space-y-6">
                  {selectedSurvey.questions.map((q, idx) => {
                    const statsData = computeQuestionStats(q);
                    
                    return (
                      <div key={q.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">분석결과 • 문항 {idx+1}</span>
                        <h4 className="text-xs font-extrabold text-slate-800 leading-normal">{q.questionText}</h4>

                        {q.type !== 'text' ? (
                          <div className="space-y-4">
                            {/* Recharts Bar chart rendering */}
                            <div className="h-44 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart data={statsData} layout="vertical" margin={{ left: 10, right: 20 }}>
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                  <Tooltip />
                                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12}>
                                    {statsData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={getStarredColorPalette[index % getStarredColorPalette.length]} />
                                    ))}
                                  </Bar>
                                </ReBarChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Direct stats breakdown legend */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                              {statsData.map((d, i) => {
                                const total = selectedSurvey.responses.length || 1;
                                const ratio = Math.round((d.count / total) * 100);
                                return (
                                  <div key={i} className="flex justify-between items-center text-xs text-slate-600">
                                    <span className="font-semibold">{d.name}</span>
                                    <span className="font-bold font-mono text-slate-800">{d.count}표 ({ratio}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          /* Text responses log */
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            {selectedSurvey.responses.map((res, rIdx) => {
                              const ansText = res.answers[q.id] as string;
                              if (!ansText) return null;
                              return (
                                <div key={rIdx} className="p-2.5 bg-white rounded-xl border border-slate-200/40 text-xs">
                                  <p className="text-slate-700 leading-relaxed font-semibold">“ {ansText} ”</p>
                                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                                    {selectedSurvey.isAnonymous ? '익명 교사' : res.userName || '교직원'} • {new Date(res.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p>본 설문조사는 교무 정례의안 의결법률에 근거하며, 수집 과정은 모두 암호화되어 기록 보장됩니다.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <FileSpreadsheet className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm">참여하거나 통계를 열람할 의견 설문을 분류에서 마우스로 클릭해 주세요.</p>
          </div>
        )}

      </div>

    </div>
  );
};
