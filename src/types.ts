/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'dept_manager' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  task: string;          // 담당 업무 (e.g., 기획, 평가, 정보보호)
  extension: string;     // 내선번호 (e.g., 201, 205)
  phone?: string;        // 휴대전화 번호
  approved: boolean;     // 승인 상태
  status: 'online' | 'offline' | 'busy';
  createdAt?: string;
}

export type ChatRoomType = 'all' | 'dept' | 'grade' | 'project' | 'direct';

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  members: string[]; // User IDs
  createdAt?: string;
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
  size?: number | string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachments?: Attachment[];
  readBy?: string[]; // user IDs who have read this message
  isNotice?: boolean; // Pinned as a chat room notice
  isStarred?: boolean; // If starred in local view
  createdAt: string; // ISO string or timestamp string
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export type NoticeCategory = '교무' | '연구' | '생활교육' | '행사' | '연수' | '일반';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  authorId: string;
  authorName: string;
  isPinned: boolean; // 중요 공지 고정
  attachments?: Attachment[];
  views: number;
  viewedBy?: string[]; // IDs of users who viewed
  comments?: Comment[];
  createdAt: string;
}

export type FileRecordType = 'folder' | 'file';

export interface FileRecord {
  id: string;
  name: string;
  type: FileRecordType;
  parentFolderId: string | null; // null represents root
  fileType?: 'pdf' | 'hwp' | 'pptx' | 'docx' | 'xlsx' | 'jpg' | 'png' | 'folder'; // for rendering icons
  size?: string; // string size like "1.2 MB"
  ownerId: string;
  ownerName: string;
  version: number;
  downloadCount: number;
  isStarred?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory = 'school' | 'dept' | 'personal';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  category: EventCategory;
  department?: string; // applicable if dept category
  ownerId: string;
  ownerName: string;
  color: string; // Hex color or tailwind name
  createdAt: string;
}

export interface SurveyQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text';
  questionText: string;
  options?: string[]; // For single/multiple selection
}

export interface SurveyResponse {
  userId: string;
  userName?: string;
  answers: { [questionId: string]: string | string[] }; // Answer value
  createdAt: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  isClosed: boolean;
  isAnonymous: boolean;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  createdAt: string;
}

export type MeetingType = 'staff' | 'heads' | 'grade' | 'learning'; // 교직원 회의, 부장 회의, 학년 협의회, 전문적 학습공동체

export interface MeetingRoom {
  id: string;
  title: string;
  type: MeetingType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  agenda: string;
  attachments?: Attachment[];
  minutes?: string; // Markdown or plain text meeting minutes
  attendance?: { [userId: string]: 'present' | 'absent' | 'late' | 'excused' };
  recorderId: string;
  recorderName: string;
  createdAt: string;
}

export interface SeongmuSheet {
  id: string;
  title: string;
  description: string;
  category: '학사/업무' | '성적/평가' | '연수/복지' | '기타';
  originalUrl: string;
  embedUrl: string;
  ownerId: string;
  ownerName: string;
  comments?: Comment[];
  createdAt: string;
}

