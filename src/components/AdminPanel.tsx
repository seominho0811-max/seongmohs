/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  ShieldCheck, 
  UserPlus, 
  UserCog, 
  Trash2, 
  Building, 
  Check, 
  X, 
  Sparkles,
  RefreshCw,
  Info 
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [staff, setStaff] = useState<User[]>([]);
  const [pendingApplicants, setPendingApplicants] = useState<User[]>([
    { id: 'pending_1', name: '박태민', email: 'taemin@school.edu', department: '행정실', role: 'teacher', task: '급여 및 예결산 행정보조', extension: '298', approved: false, status: 'offline' },
    { id: 'pending_2', name: '윤아름', email: 'areum@school.edu', department: '2학년부', role: 'teacher', task: '2학년 한문교과 협의회', extension: '219', approved: false, status: 'offline' }
  ]);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    setStaff(SchoolStorage.getUsers());
  };

  const handleApproveApplicant = (applicant: User) => {
    const approvedUser = { ...applicant, approved: true };
    SchoolStorage.updateUser(approvedUser);
    
    // Remove from applicant list
    setPendingApplicants(prev => prev.filter(p => p.id !== applicant.id));
    loadStaff();
    alert(`"${applicant.name}" 선생님의 가입 인가가 성공적으로 완료되었습니다.`);
  };

  const handleRejectApplicant = (id: string, name: string) => {
    if (confirm(`"${name}" 선생님의 가입 인가를 거절하시겠습니까?`)) {
      setPendingApplicants(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    const teacher = staff.find(s => s.id === userId);
    if (!teacher) return;

    const updated = { ...teacher, role: newRole };
    SchoolStorage.updateUser(updated);
    loadStaff();
    alert(`"${teacher.name}" 선생님의 직급 권한이 "${newRole === 'admin' ? '최고 관리자' : newRole === 'dept_manager' ? '부서장' : '교직원'}"(으)로 업데이트 되었습니다.`);
  };

  const handleChangeDepartment = (userId: string, dept: string) => {
    const teacher = staff.find(s => s.id === userId);
    if (!teacher) return;

    const updated = { ...teacher, department: dept };
    SchoolStorage.updateUser(updated);
    loadStaff();
  };

  const departmentsList = [
    '교장실', '교감실', '교무운영부', '교육과정부', '교육연구부', '교육평가부', '진로진학상담부', '교육정보부', '학생생활안전부', '창의인성환경부', '종교부', '보건툭수교육부', '1학년부', '2학년부', '3학년부', '행정실'
  ];

  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto space-y-4 my-12">
        <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto" />
        <h3 className="text-base font-extrabold text-slate-800">액세스 제한 구역</h3>
        <p className="text-xs text-slate-400">관리자 전용 설정 구역입니다. 이 페이지는 교장, 교감, 시스템 총괄직 주관 하에서만 제어가 허가됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Dynamic welcome header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">교무실 중앙 통제실 (Admin)</h2>
            <p className="text-[11px] text-slate-400">교직원 승인 대청소, 부서 발동령 승급제어 및 시스템 메타데이터 환경구축</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Operations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Pending Approvals checklists */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-500" />
              신규 교직원 임용 가입승인 요청 ({pendingApplicants.length}건)
            </h3>

            <div className="space-y-2">
              {pendingApplicants.map(applicant => (
                <div 
                  key={applicant.id} 
                  className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1 block text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-800">{applicant.name} 선생님</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold font-mono">#{applicant.extension}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {applicant.email} • 지망부서: <strong className="text-slate-600">{applicant.department}</strong>
                    </p>
                    <p className="text-xs text-slate-500 font-medium leading-normal">
                      담당: {applicant.task}
                    </p>
                  </div>

                  <div className="flex gap-1.5 shrink-0 w-full sm:w-auto">
                    <button 
                      onClick={() => handleApproveApplicant(applicant)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> 승인
                    </button>
                    <button 
                      onClick={() => handleRejectApplicant(applicant.id, applicant.name)}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 border border-slate-200"
                    >
                      <X className="w-3.5 h-3.5" /> 거절
                    </button>
                  </div>
                </div>
              ))}
              {pendingApplicants.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-100 font-medium">대기중인 신임 교사 가입 신청서가 존재하지 않습니다.</p>
              )}
            </div>
          </div>

          {/* 2. Authority upgrade control */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <UserCog className="w-4 h-4 text-indigo-500" />
              부서 구성원 직무 및 인사 권한 통제
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">부서명</th>
                    <th className="py-2.5">이름</th>
                    <th className="py-2.5">내선번호</th>
                    <th className="py-2.5">담당 업무 요체</th>
                    <th className="py-2.5">인사직급 부여</th>
                    <th className="py-2.5 text-right px-3">소속변경</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {staff.slice(0, 15).map(teacher => (
                    <tr key={teacher.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] truncate max-w-[80px] inline-block">
                          {teacher.department}
                        </span>
                      </td>
                      <td className="py-3 text-slate-800 font-extrabold">{teacher.name}</td>
                      <td className="py-3 font-mono text-slate-400 font-medium font-bold">#{teacher.extension}</td>
                      <td className="py-3 text-[10.5px] text-slate-400 truncate max-w-[120px] font-medium" title={teacher.task}>
                        {teacher.task}
                      </td>
                      <td className="py-3">
                        <select 
                          value={teacher.role}
                          onChange={(e) => handleChangeRole(teacher.id, e.target.value as UserRole)}
                          className="bg-transparent border border-slate-200 hover:border-slate-300 rounded font-bold px-1.5 py-0.5 text-[10px] outline-none text-slate-600"
                        >
                          <option value="teacher">일반 교사</option>
                          <option value="dept_manager">부서장</option>
                          <option value="admin">관도자</option>
                        </select>
                      </td>
                      <td className="py-3 text-right px-3">
                        <select
                          value={teacher.department}
                          onChange={(e) => handleChangeDepartment(teacher.id, e.target.value)}
                          className="bg-transparent border border-slate-200 hover:border-slate-300 rounded font-bold px-1.5 py-0.5 text-[10px] outline-none text-blue-600 max-w-[90px]"
                        >
                          {departmentsList.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={6} className="py-3 text-center text-slate-400 text-[10.5px]">
                      교사 명부가 총 {staff.length}명 조회됩니다. (테스트용 상단 15인 데이터 요약)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Meta Configuration */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4 block text-left">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-widest">
              💼 기관 내부 메타통계
            </h3>

            <div className="space-y-3.5 text-xs text-slate-500 font-semibold">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span>총 승인 교직원 수:</span>
                <span className="font-extrabold text-blue-600 font-mono">{staff.length}명</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span>임시 비인가 대기 수:</span>
                <span className="font-extrabold text-amber-500 font-mono">{pendingApplicants.length}명</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span>활동 중인 채팅방:</span>
                <span className="font-extrabold text-indigo-600 font-mono">9개 채널</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400">행정 서명 인증상태</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-bold">256-bit AES 결재망 작동중</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-400 leading-relaxed font-semibold">
            <div className="flex gap-2 items-start">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p>인사정보 및 소속 부서 조정 시, 전체 채팅 및 드라이브 소유 권한이 실시간 동기화되어 즉각 이전 적용됩니다.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
