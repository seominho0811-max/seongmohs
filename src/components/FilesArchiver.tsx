/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, FileRecord } from '../types';
import { SchoolStorage } from '../lib/schoolStorage';
import { 
  FolderPlus, 
  Upload, 
  Search, 
  Star, 
  ChevronRight, 
  Folder, 
  FileText, 
  FileCode,
  Download, 
  Eye, 
  Trash2, 
  Info,
  ArrowLeft,
  Settings
} from 'lucide-react';

interface FilesArchiverProps {
  currentUser: User;
  parentFolderId?: string | null; // Deep-linked folder from dashboard
}

export const FilesArchiver: React.FC<FilesArchiverProps> = ({ currentUser, parentFolderId = null }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(parentFolderId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    const raw = SchoolStorage.getFiles();
    setFiles(raw);
  };

  const formatBytes = (bytes: number, decimals = 1): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: FileRecord = {
      id: `fd_${Date.now()}`,
      name: newFolderName,
      type: 'folder',
      parentFolderId: currentFolderId,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      version: 1,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    SchoolStorage.addFile(newFolder);
    setNewFolderName('');
    setShowFolderModal(false);
    loadFiles();
  };

  const handleRealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    
    processFiles(uploadedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const currentFiles = SchoolStorage.getFiles();
    
    Array.from(fileList).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType: 'xlsx' | 'docx' | 'pdf' | 'hwp' | 'pptx' | 'jpg' | 'png' | undefined = undefined;
      if (['xlsx', 'xls', 'csv'].includes(ext)) fileType = 'xlsx';
      else if (['docx', 'doc', 'txt'].includes(ext)) fileType = 'docx';
      else if (ext === 'pdf') fileType = 'pdf';
      else if (ext === 'hwp') fileType = 'hwp';
      else if (['pptx', 'ppt'].includes(ext)) fileType = 'pptx';
      else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
        fileType = ext === 'png' ? 'png' : 'jpg';
      }

      const sizeStr = formatBytes(file.size);

      // Check if filename already exists to handle Versioning (+1)
      const existing = currentFiles.find(f => f.name === file.name && f.parentFolderId === currentFolderId);
      if (existing) {
        const updated: FileRecord = {
          ...existing,
          version: existing.version + 1,
          size: sizeStr,
          updatedAt: new Date().toISOString(),
          ownerId: currentUser.id,
          ownerName: currentUser.name,
        };
        SchoolStorage.updateFile(updated);
        alert(`"${file.name}" 파일의 v${updated.version} 새 버전이 업로드되었습니다! (기존 파일 덮어쓰기 완료)`);
      } else {
        const newFile: FileRecord = {
          id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: 'file',
          parentFolderId: currentFolderId,
          fileType: fileType,
          size: sizeStr,
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          version: 1,
          downloadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        SchoolStorage.addFile(newFile);
      }
    });

    loadFiles();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleStar = (file: FileRecord) => {
    const updated = { ...file, isStarred: !file.isStarred };
    SchoolStorage.updateFile(updated);
    
    // updates selection if opened in side preview
    if (selectedFile?.id === file.id) {
      setSelectedFile(updated);
    }
    loadFiles();
  };

  const handleDeleteFile = (id: string) => {
    if (confirm('이 항목(및 내부 자료)을 영구 삭제하시겠습니까?')) {
      SchoolStorage.deleteFile(id);
      setSelectedFile(null);
      loadFiles();
    }
  };

  const handleDownload = (file: FileRecord) => {
    const updated = { ...file, downloadCount: file.downloadCount + 1 };
    SchoolStorage.updateFile(updated);
    
    if (selectedFile?.id === file.id) {
      setSelectedFile(updated);
    }
    loadFiles();

    // Trigger dummy download notification
    alert(`"${file.name}" 다운로드가 개시되었습니다. (버전: v${file.version})`);
  };

  // Compute Breadcrumb
  const getBreadcrumbs = () => {
    const crumbs = [];
    let currentId = currentFolderId;
    while (currentId) {
      const parentFolder = files.find(f => f.id === currentId);
      if (parentFolder) {
        crumbs.unshift(parentFolder);
        currentId = parentFolder.parentFolderId;
      } else {
        break;
      }
    }
    return crumbs;
  };

  // Filters logic
  const currentLevelItems = files.filter(f => f.parentFolderId === currentFolderId);
  const filteredItems = currentLevelItems.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStar = !onlyStarred || f.isStarred;
    return matchesSearch && matchesStar;
  });

  const folders = filteredItems.filter(f => f.type === 'folder');
  const fileItems = filteredItems.filter(f => f.type === 'file');

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'xlsx': return <span className="text-emerald-600 font-bold">📊</span>;
      case 'docx': return <span className="text-blue-600 font-bold">📄</span>;
      case 'pdf': return <span className="text-red-500 font-bold">📕</span>;
      case 'hwp': return <span className="text-sky-500 font-bold">📘</span>;
      case 'pptx': return <span className="text-orange-500 font-bold">📙</span>;
      case 'jpg':
      case 'png': return <span className="text-purple-500 font-bold">🖼️</span>;
      default: return <span className="text-slate-400 font-bold">📁</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header controls section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap justify-between items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">학교 보관용 자료실</h2>
          <p className="text-[11px] text-slate-400">학내 주요 업무 규정집, 수능 지침교안, 예비 문항 이원표 및 서식공유</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${onlyStarred ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
          >
            <Star className="w-3.5 h-3.5" />
            중요 파일만
          </button>
          
          <button 
            onClick={() => setShowFolderModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            새 폴더
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleRealUpload} 
            multiple 
            className="hidden" 
          />

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            문서 업로드
          </button>
        </div>
      </div>

      {/* 2. Directory Navigation bar */}
      <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 text-xs overflow-x-auto">
        <button 
          onClick={() => { setCurrentFolderId(null); setSelectedFile(null); }}
          className="text-slate-500 hover:text-blue-600 font-bold"
        >
          교무실 최상위
        </button>
        {getBreadcrumbs().map((crumb) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            <button 
              onClick={() => { setCurrentFolderId(crumb.id); setSelectedFile(null); }}
              className="text-slate-500 hover:text-blue-600 font-bold truncate max-w-[120px]"
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}

        <div className="relative ml-auto w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="현재 폴더 내 자료 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 rounded-lg pl-8 pr-3 py-1.5 outline-none text-xs text-slate-700"
          />
        </div>
      </div>

      {/* 3. Folder/File display grid split with right detail panel */}
      <div className="flex gap-4 items-start">
        
        {/* Main files grid canvas */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 bg-white rounded-2xl shadow-sm border p-6 space-y-6 transition-all relative ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/20 ring-4 ring-blue-500/10' 
              : 'border-slate-100'
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-blue-500 z-10 pointer-events-none">
              <Upload className="w-12 h-12 text-blue-600 animate-bounce mb-2" />
              <p className="text-sm font-bold text-blue-700">이곳에 놓으면 바로 파일이 업로드됩니다</p>
              <p className="text-xs text-blue-500 mt-1">학년교안, 수업계획서 등 관련 문서를 자유롭게 저장합니다.</p>
            </div>
          )}
          
          {/* Back button if nested */}
          {currentFolderId && (
            <button 
              onClick={() => {
                const crumbs = getBreadcrumbs();
                const parent = crumbs.length > 1 ? crumbs[crumbs.length - 2].id : null;
                setCurrentFolderId(parent);
                setSelectedFile(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> 상위 폴더로 이동
            </button>
          )}

          {/* FOLDERS GRID SECTION */}
          {folders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider">부서 및 성격별 폴더 ({folders.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {folders.map(folder => (
                  <div 
                    key={folder.id}
                    onDoubleClick={() => { setCurrentFolderId(folder.id); setSelectedFile(null); }}
                    onClick={() => setSelectedFile(folder)}
                    className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-blue-50/30/50 border border-slate-100 hover:border-blue-200 cursor-pointer rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Folder className="w-5 h-5 text-blue-500 fill-blue-50 shrink-0 group-hover:scale-105 transition-transform" />
                      <span className="text-xs font-bold text-slate-700 truncate">{folder.name}</span>
                    </div>

                    <Trash2 
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(folder.id); }}
                      className="w-4 h-4 text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all shrink-0" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILES LIST SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider">공유 문서 목록 ({fileItems.length})</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">중요</th>
                    <th className="py-2.5">문서 형식 및 자료명</th>
                    <th className="py-2.5">버전</th>
                    <th className="py-2.5">용량</th>
                    <th className="py-2.5">등록교사</th>
                    <th className="py-2.5">다운수</th>
                    <th className="py-2.5 text-right px-3">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fileItems.map(file => (
                    <tr 
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${selectedFile?.id === file.id ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleStar(file); }}
                          className="text-slate-300 hover:text-amber-500"
                        >
                          <Star className={`w-4 h-4 ${file.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.fileType)}
                          <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-md">
                          v{file.version}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono font-medium">{file.size}</td>
                      <td className="py-3 font-semibold text-slate-500">{file.ownerName}</td>
                      <td className="py-3 font-mono text-slate-400 font-medium">{file.downloadCount}회</td>
                      <td className="py-3 text-right px-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                            className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg"
                            title="다운로드"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                            className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {fileItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 font-medium text-slate-400 text-center italic">이 위치엔 직접 업로드한 보존 파일이 현재 비어 있습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Selected file detail side panel preview */}
        {selectedFile && (
          <div className="w-72 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 shrink-0 block text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Info className="w-4 h-4 text-slate-400" /> 상세 정보 및 연혁
              </h3>
              <button 
                onClick={() => setSelectedFile(null)} 
                className="text-[10px] text-slate-400 hover:text-slate-600 underline"
              >
                접기
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-100">
                <span className="text-4xl block mb-2">
                  {selectedFile.type === 'folder' ? '📂' : getFileIcon(selectedFile.fileType)}
                </span>
                <p className="text-xs font-bold text-slate-800 break-all px-2">{selectedFile.name}</p>
                {selectedFile.type === 'file' && (
                  <p className="text-[10px] text-slate-400 font-mono mt-1 font-semibold">{selectedFile.size}</p>
                )}
              </div>

              <div className="space-y-2 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>소속 분류:</span>
                  <span className="font-semibold text-slate-800">{selectedFile.type === 'folder' ? '가상 디렉토리' : '공문 문서'}</span>
                </div>
                <div className="flex justify-between">
                  <span>작성/업로더:</span>
                  <span className="font-semibold text-slate-800">{selectedFile.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>개정 차수:</span>
                  <span className="font-semibold text-slate-800">v{selectedFile.version} (이력 관리)</span>
                </div>
                <div className="flex justify-between">
                  <span>누적 반출량:</span>
                  <span className="font-semibold text-slate-800">{selectedFile.downloadCount}회 다운로드</span>
                </div>
                <button 
                  onClick={() => handleToggleStar(selectedFile)}
                  className={`w-full py-2 bg-slate-50 hover:bg-slate-100 border text-center rounded-lg font-bold flex justify-center items-center gap-1.5 transition-colors ${selectedFile.isStarred ? 'text-amber-600 bg-amber-50 hover:bg-amber-100/60 border-amber-200' : 'text-slate-600 border-slate-100'}`}
                >
                  <Star className="w-3.5 h-3.5" />
                  {selectedFile.isStarred ? '중요자료 해제' : '중요자료 마크'}
                </button>
              </div>

              {selectedFile.type === 'file' && (
                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100/50 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 block">✨ AI 파일 진단 (Preview)</span>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium">본 자료는 {selectedFile.fileType?.toUpperCase()} 규격을 충족하며, 결재가 완료된 안전한 공식 행정 예문입니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* New folder creation modal dialog */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleCreateFolder} 
            className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-800">새 업무 가상폴더 생성</h3>
              <button 
                type="button" 
                onClick={() => setShowFolderModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">폴더명 입력</label>
              <input 
                type="text" 
                placeholder="예: 수업자료, 학년운영, 연수안"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:border-blue-300 transition-all"
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setShowFolderModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                취소
              </button>
              <button 
                type="submit" 
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                생성
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
