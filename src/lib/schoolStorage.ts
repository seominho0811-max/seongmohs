/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, ChatRoom, ChatMessage, Notice, FileRecord, CalendarEvent, Survey, MeetingRoom, SeongmuSheet } from '../types';

// Programmatic generation of teachers using user-provided list
export const TEACHER_NAMES = [
  '송미령', '이정호', '강유신', '강지수', '경성숙', '곽휘호', '권순덕',
  '김경임', '김명희', '김미진', '김미화', '김은정', '김지선', '도은경',
  '명수진', '민다영', '박서현', '박지오', '배영경', '서기원', '서민호',
  '서해정', '신현정', '안민혁', '안혜림', '양선모', '유태경', '유현수',
  '윤희정', '이경은', '이고은', '이동규', '이미라', '이상건', '이종환',
  '이충섭', '이현영', '정선희', '정은애', '조동우', '조옥래', '조한정',
  '조휘빈', '천예현', '최성은', '최신호', '최형진', '하진성', '한영희',
  '황은지'
];

export const MOCK_USERS: User[] = [
  {
    id: 'principal_1',
    name: '송미령',
    email: 'principal@school.edu',
    department: '교장실',
    role: 'admin',
    task: '학교장',
    extension: '810',
    phone: '010-4281-9020',
    approved: true,
    status: 'online'
  },
  {
    id: 'vice_1',
    name: '이정호',
    email: 'vice@school.edu',
    department: '교감실',
    role: 'admin',
    task: '교감',
    extension: '816',
    phone: '010-9403-3996',
    approved: true,
    status: 'online'
  },
  {
    id: 'seominho_tester',
    name: '서민호',
    email: 'seominho0811@gmail.com',
    department: '교육과정부',
    role: 'admin',
    task: '과정부장',
    extension: '824',
    phone: '010-7509-3529',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_강유신',
    name: '강유신',
    email: 'ysgang@school.edu',
    department: '교육정보부',
    role: 'teacher',
    task: '-',
    extension: '819',
    phone: '010-9893-3797',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_강지수',
    name: '강지수',
    email: 'jsgang@school.edu',
    department: '2학년부',
    role: 'dept_manager',
    task: '2학년부장',
    extension: '840',
    phone: '010-5411-0601',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_경성숙',
    name: '경성숙',
    email: 'sskyung@school.edu',
    department: '창의인성환경부',
    role: 'teacher',
    task: '-',
    extension: '862',
    phone: '010-5126-5060',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_곽휘호',
    name: '곽휘호',
    email: 'hhkwak@school.edu',
    department: '1학년부',
    role: 'teacher',
    task: '1-2 담임',
    extension: '831',
    phone: '010-4240-2933',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_권순덕',
    name: '권순덕',
    email: 'sdkwon@school.edu',
    department: '3학년부',
    role: 'teacher',
    task: '3-2 담임',
    extension: '872',
    phone: '010-5530-9417',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_김경임',
    name: '김경임',
    email: 'gikim@school.edu',
    department: '1학년부',
    role: 'teacher',
    task: '1-5 담임',
    extension: '833',
    phone: '010-3417-3147',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_김명희',
    name: '김명희',
    email: 'mhkim@school.edu',
    department: '창의인성환경부',
    role: 'dept_manager',
    task: '환경부장',
    extension: '863',
    phone: '010-5786-1106',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_김미진',
    name: '김미진',
    email: 'mjkim@school.edu',
    department: '1학년부',
    role: 'teacher',
    task: '1-7 담임',
    extension: '834',
    phone: '010-4873-8749',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_김미화',
    name: '김미화',
    email: 'mwkim@school.edu',
    department: '3학년부',
    role: 'teacher',
    task: '3-6 담임',
    extension: '876',
    phone: '010-3404-3558',
    approved: true,
    status: 'offline'
  },
  {
    id: 'teacher_김은정',
    name: '김은정',
    email: 'ejkim@school.edu',
    department: '1학년부',
    role: 'dept_manager',
    task: '1학년부장',
    extension: '830',
    phone: '010-8808-4086',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_김지선',
    name: '김지선',
    email: 'jskim@school.edu',
    department: '3학년부',
    role: 'teacher',
    task: '3-5 담임',
    extension: '875',
    phone: '010-9525-0830',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_도은경',
    name: '도은경',
    email: 'ekdo@school.edu',
    department: '보건툭수교육부',
    role: 'teacher',
    task: '-',
    extension: '825',
    phone: '010-6309-1196',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_명수진',
    name: '명수진',
    email: 'sjmyung@school.edu',
    department: '행정실',
    role: 'teacher',
    task: '-',
    extension: '860',
    phone: '010-3366-2986',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_민다영',
    name: '민다영',
    email: 'dymin@school.edu',
    department: '1학년부',
    role: 'teacher',
    task: '1-4 담임',
    extension: '832',
    phone: '010-2910-5545',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_박서현',
    name: '박서현',
    email: 'shpark@school.edu',
    department: '1학년부',
    role: 'teacher',
    task: '1-3 담임',
    extension: '832',
    phone: '010-2472-1810',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_박지오',
    name: '박지오',
    email: 'jopark@school.edu',
    department: '교육정보부',
    role: 'teacher',
    task: '-',
    extension: '817',
    phone: '010-3857-8842',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_배영경',
    name: '배영경',
    email: 'ykbae@school.edu',
    department: '2학년부',
    role: 'teacher',
    task: '2-1 담임',
    extension: '844',
    phone: '010-6247-1639',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_서기원',
    name: '서기원',
    email: 'gwseo@school.edu',
    department: '1학년부',
    role: 'teacher',
    task: '1-8 담임',
    extension: '834',
    phone: '010-4462-9319',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_서해정',
    name: '서해정',
    email: 'hjseo@school.edu',
    department: '2학년부',
    role: 'teacher',
    task: '2-8 담임',
    extension: '841',
    phone: '010-2786-7955',
    approved: true,
    status: 'offline'
  },
  {
    id: 'teacher_신현정',
    name: '신현정',
    email: 'hjshin@school.edu',
    department: '학생생활안전부',
    role: 'dept_manager',
    task: '학생부장',
    extension: '860',
    phone: '010-8704-8183',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_안민혁',
    name: '안민혁',
    email: 'mhan@school.edu',
    department: '1학년부',
    role: 'teacher',
    task: '1-6 담임',
    extension: '833',
    phone: '010-7402-0006',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_안혜림',
    name: '안혜림',
    email: 'hrahn@school.edu',
    department: '1학년부',
    role: 'teacher',
    task: '1-1 담임',
    extension: '831',
    phone: '010-3156-2101',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_양선모',
    name: '양선모',
    email: 'smyang@school.edu',
    department: '3학년부',
    role: 'teacher',
    task: '3-1 담임',
    extension: '871',
    phone: '010-3111-5068',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_유태경',
    name: '유태경',
    email: 'tkyu@school.edu',
    department: '종교부',
    role: 'dept_manager',
    task: '종교부장',
    extension: '861',
    phone: '010-3897-4429',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_유현수',
    name: '유현수',
    email: 'hsyu@school.edu',
    department: '진로진학상담부',
    role: 'dept_manager',
    task: '진학부장',
    extension: '827',
    phone: '010-8769-7159',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_윤희정',
    name: '윤희정',
    email: 'hjyoon@school.edu',
    department: '2학년부',
    role: 'teacher',
    task: '2-7 담임',
    extension: '841',
    phone: '010-5672-2852',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_이경은',
    name: '이경은',
    email: 'kelee@school.edu',
    department: '교무운영부',
    role: 'dept_manager',
    task: '방과후부장',
    extension: '827',
    phone: '010-4520-5304',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_이고은',
    name: '이고은',
    email: 'gelee@school.edu',
    department: '3학년부',
    role: 'teacher',
    task: '3-4 담임',
    extension: '874',
    phone: '010-9632-3364',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_이동규',
    name: '이동규',
    email: 'dklee@school.edu',
    department: '2학년부',
    role: 'teacher',
    task: '2-6 담임',
    extension: '842',
    phone: '010-9217-1525',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_이미라',
    name: '이미라',
    email: 'mrlee@school.edu',
    department: '2학년부',
    role: 'teacher',
    task: '2-5 담임',
    extension: '842',
    phone: '010-8108-2753',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_이상건',
    name: '이상건',
    email: 'sklee@school.edu',
    department: '행정실',
    role: 'teacher',
    task: '-',
    extension: '862',
    phone: '010-5408-1611',
    approved: true,
    status: 'offline'
  },
  {
    id: 'teacher_이종환',
    name: '이종환',
    email: 'jhlee@school.edu',
    department: '행정실',
    role: 'teacher',
    task: '-',
    extension: '826',
    phone: '010-7570-6325',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_이충섭',
    name: '이충섭',
    email: 'cslee@school.edu',
    department: '3학년부',
    role: 'teacher',
    task: '3-8 담임',
    extension: '878',
    phone: '010-9855-9205',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_이현영',
    name: '이현영',
    email: 'hylee@school.edu',
    department: '교육연구부',
    role: 'teacher',
    task: '-',
    extension: '828',
    phone: '010-5460-0829',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_정선희',
    name: '정선희',
    email: 'shjung@school.edu',
    department: '2학년부',
    role: 'teacher',
    task: '2-2 담임',
    extension: '844',
    phone: '010-3663-3568',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_정은애',
    name: '정은애',
    email: 'eajung@school.edu',
    department: '3학년부',
    role: 'teacher',
    task: '3-7 담임',
    extension: '877',
    phone: '010-2215-0821',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_조동우',
    name: '조동우',
    email: 'dwcho@school.edu',
    department: '교육평가부',
    role: 'dept_manager',
    task: '평가부장',
    extension: '814',
    phone: '010-4253-4869',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_조옥래',
    name: '조옥래',
    email: 'orcho@school.edu',
    department: '3학년부',
    role: 'dept_manager',
    task: '3학년부장',
    extension: '870',
    phone: '010-9402-5359',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_조한정',
    name: '조한정',
    email: 'hjcho@school.edu',
    department: '행정실',
    role: 'teacher',
    task: '-',
    extension: '824',
    phone: '010-3415-2663',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_조휘빈',
    name: '조휘빈',
    email: 'hbcho@school.edu',
    department: '2학년부',
    role: 'teacher',
    task: '2-3 담임',
    extension: '843',
    phone: '010-4107-6907',
    approved: true,
    status: 'offline'
  },
  {
    id: 'teacher_천예현',
    name: '천예현',
    email: 'yhchun@school.edu',
    department: '3학년부',
    role: 'teacher',
    task: '3-3 담임',
    extension: '873',
    phone: '010-6635-3827',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_최성은',
    name: '최성은',
    email: 'sechoi@school.edu',
    department: '교육연구부',
    role: 'dept_manager',
    task: '연구부장',
    extension: '839',
    phone: '010-9240-4935',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_최신호',
    name: '최신호',
    email: 'shchoi@school.edu',
    department: '교무운영부',
    role: 'dept_manager',
    task: '교무부장',
    extension: '818',
    phone: '010-2019-0846',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_최형진',
    name: '최형진',
    email: 'hjchoi@school.edu',
    department: '교육정보부',
    role: 'dept_manager',
    task: '정보부장',
    extension: '826',
    phone: '010-9858-8901',
    approved: true,
    status: 'busy'
  },
  {
    id: 'teacher_하진성',
    name: '하진성',
    email: 'jsha@school.edu',
    department: '2학년부',
    role: 'teacher',
    task: '2-4 담임',
    extension: '843',
    phone: '010-9163-6223',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_한영희',
    name: '한영희',
    email: 'yhhan@school.edu',
    department: '보건툭수교육부',
    role: 'dept_manager',
    task: '보건부장',
    extension: '883',
    phone: '010-2878-9123',
    approved: true,
    status: 'online'
  },
  {
    id: 'teacher_황은지',
    name: '황은지',
    email: 'ejhwang@school.edu',
    department: '교육연구부',
    role: 'teacher',
    task: '-',
    extension: '839',
    phone: '010-3408-3533',
    approved: true,
    status: 'online'
  }
];

export const MOCK_CHANNELS: ChatRoom[] = [
  { id: 'room_all', name: '전체 교직원 공지 및 소통방', type: 'all', members: [] },
  { id: 'room_academic', name: '교무운영부 소통방', type: 'dept', members: [] },
  { id: 'room_research', name: '교육연구부 협의방', type: 'dept', members: [] },
  { id: 'room_student', name: '학생생활안전부 소통방', type: 'dept', members: [] },
  { id: 'room_grade1', name: '1학년부 단체방', type: 'grade', members: [] },
  { id: 'room_grade2', name: '2학년부 단체방', type: 'grade', members: [] },
  { id: 'room_grade3', name: '3학년부 단체방', type: 'grade', members: [] },
  { id: 'room_eval', name: '평가위원회 보안채널', type: 'project', members: ['principal_1', 'vice_1', 'seominho_tester'] },
  { id: 'room_ai', name: 'AI활용 연구회', type: 'project', members: ['seominho_tester'] }
];

// Fill channel members programmatically
MOCK_CHANNELS[0].members = MOCK_USERS.map(u => u.id);
MOCK_CHANNELS[1].members = MOCK_USERS.filter(u => u.department === '교무운영부').map(u => u.id);
MOCK_CHANNELS[2].members = MOCK_USERS.filter(u => u.department === '교육연구부').map(u => u.id);
MOCK_CHANNELS[3].members = MOCK_USERS.filter(u => u.department === '학생생활안전부').map(u => u.id);
MOCK_CHANNELS[4].members = MOCK_USERS.filter(u => u.department === '1학년부').map(u => u.id);
MOCK_CHANNELS[5].members = MOCK_USERS.filter(u => u.department === '2학년부').map(u => u.id);
MOCK_CHANNELS[6].members = MOCK_USERS.filter(u => u.department === '3학년부').map(u => u.id);

// Add extra chiefs/members to project channels
const specialMembers = MOCK_USERS.filter(u => ['김경임', '강유신'].includes(u.name)).map(u => u.id);
MOCK_CHANNELS[7].members.push(...specialMembers);
const aiMembers = MOCK_USERS.filter(u => ['강유신', '박지오', '유현수', '정혜성'].includes(u.name)).map(u => u.id);
MOCK_CHANNELS[8].members.push(...aiMembers);

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: 'msg_1', roomId: 'room_all', senderId: 'teacher_최신호', senderName: '최신호', text: '선생님들 안녕하십니까, 교무운영부 부장 최신호입니다. 금주 금요일 2교시 이후에 전체 교직원 긴급 회의가 소집될 예정이오니 참고해주시기 바랍니다.', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), readBy: ['seominho_tester'] },
  { id: 'msg_2', roomId: 'room_all', senderId: 'seominho_tester', senderName: '서민호', text: '부장님, 회의 안건에 혹시 정보보안 가이드라인 설명회도 함께 포함되는지요?', createdAt: new Date(Date.now() - 3600000 * 4.8).toISOString(), readBy: ['teacher_최신호'] },
  { id: 'msg_3', roomId: 'room_all', senderId: 'teacher_최신호', senderName: '최신호', text: '네, 서민호 선생님. 정보기자재 도입 및 보안 서약 안내도 의제에 포함되어 있습니다.', createdAt: new Date(Date.now() - 3600000 * 4.5).toISOString(), readBy: ['seominho_tester'] },
  { id: 'msg_4', roomId: 'room_ai', senderId: 'seominho_tester', senderName: '서민호', text: '선생님들, 이번 교육청 지원사업으로 AI 보조 튜터 라이선스를 확보했습니다! 이번 학기 현업 적용을 원하시는 분들은 공유 폴더를 참고해 주세요.', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), readBy: [] },
  { id: 'msg_5', roomId: 'room_ai', senderId: 'vice_1', senderName: '이정호', text: '오, 교감실에서도 적극 도입해 시범학급을 운영할 수 있게 돕겠습니다. 서 선생님 연구 계획안이 정말 훌륭하더군요.', createdAt: new Date(Date.now() - 3600000 * 20).toISOString(), readBy: ['seominho_tester'] }
];

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'n_1',
    title: '[중요] 2026학년도 1학기 지필평가 출제원안 및 이원목적분류표 제출 안내',
    content: `안녕하세요. 교무운영부에서 권고 드립니다.\n\n각 교과 협의회에서는 기한 내 지필평가 출제 원안 및 이원목적분류표를 교무부로 최종 제출하여 주시기 바랍니다.\n\n1. 제출 기간: 다음 주 목요일 17:00까지\n2. 제출처: 온라인 교무실 -> 자료실 -> [평가자료] 폴더\n3. 주의 사항:\n - 원안 출제 시 보안 파일 지정 필수\n - 평가 성취 수준 문항 표시 철저\n\n협조해 주셔서 감사합니다.`,
    category: '연구',
    authorId: 'teacher_최신호',
    authorName: '최신호',
    isPinned: true,
    views: 34,
    viewedBy: ['seominho_tester'],
    comments: [
      { id: 'c_1', authorId: 'teacher_강유신', authorName: '강유신', content: '기간 내에 교무실 행정 전산 등록 조율 및 제출 완료하겠습니다.', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'n_2',
    title: '교육부 지정 학교 정보보안 강화 캠페인 및 자가진단 실시',
    content: `안녕하십니까, 학교 정보담당 서민호입니다.\n\n교육부 보안성 지침에 따라 전 교직원은 공용 컴퓨터 및 스마트 장치 비밀번호 변경을 권고하며, 자가진단 서식을 기한 내 작성하여 제출바랍니다.\n\n개인 안전 수칙 준수가 학교 전체의 보안을 지킵니다.`,
    category: '교무',
    authorId: 'seominho_tester',
    authorName: '서민호',
    isPinned: false,
    views: 22,
    viewedBy: ['teacher_김경임'],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'n_3',
    title: '2026 봄 학기 학교 합동 화재 대피 훈련 가이드',
    content: `학생안전부에서 안내합니다.\n\n안전하고 질서정연한 대피를 위해 첨부된 학급 대피동선을 학급 조회 시간에 안내해 주시기 바랍니다.\n\n* 일시: 금주 목요일 3교시 소방 경보 발령 시`,
    category: '생활교육',
    authorId: 'teacher_안민혁',
    authorName: '안민혁',
    isPinned: true,
    views: 45,
    viewedBy: MOCK_USERS.slice(0, 10).map(u => u.id),
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const MOCK_FILES: FileRecord[] = [
  { id: 'fd_curric', name: '학년별 교육자료', type: 'folder', parentFolderId: null, version: 1, downloadCount: 0, ownerId: 'teacher_김경임', ownerName: '김경임', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'fd_manual', name: '업무매뉴얼 및 가이드', type: 'folder', parentFolderId: null, version: 1, downloadCount: 0, ownerId: 'seominho_tester', ownerName: '서민호', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'fd_notice_sample', name: '공문예시 및 서식', type: 'folder', parentFolderId: null, version: 1, downloadCount: 0, ownerId: 'vice_1', ownerName: '이정호', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString() },

  { id: 'f_1', name: '2026_교직원_나이스_사용법.pdf', type: 'file', parentFolderId: 'fd_manual', fileType: 'pdf', size: '2.4 MB', ownerId: 'seominho_tester', ownerName: '서민호', version: 2, downloadCount: 15, isStarred: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'f_2', name: '지필평가_학업성적관리규정.hwp', type: 'file', parentFolderId: 'fd_manual', fileType: 'hwp', size: '512 KB', ownerId: 'teacher_김경임', ownerName: '김경임', version: 1, downloadCount: 42, isStarred: true, createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 8).toISOString() },

  { id: 'f_3', name: '1학년_소풍_사전점검표.xlsx', type: 'file', parentFolderId: 'fd_curric', fileType: 'xlsx', size: '120 KB', ownerId: 'teacher_안민혁', ownerName: '안민혁', version: 1, downloadCount: 5, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() }
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'e_1', title: '1학기 1차 지필평가 기간', description: '전학년 중간 지필고사 실시', startDate: '2026-06-15', endDate: '2026-06-18', category: 'school', color: '#ef4444', ownerId: 'teacher_김경임', ownerName: '김경임', createdAt: new Date().toISOString() },
  { id: 'e_2', title: '교직원 대피 소방 훈련', description: '3교시 공용 및 학급 대피 요령 실전', startDate: '2026-06-05', endDate: '2026-06-05', category: 'school', color: '#f59e0b', ownerId: 'teacher_안민혁', ownerName: '안민혁', createdAt: new Date().toISOString() },
  { id: 'e_3', title: '에듀테크 활용 하이브리드 연수', description: '연구실 주관 스마트 교구 활용 세미나', startDate: '2026-06-10', endDate: '2026-06-10', category: 'dept', color: '#3b82f6', ownerId: 'seominho_tester', ownerName: '서민호', createdAt: new Date().toISOString() },
  { id: 'e_4', title: '영어듣기평가 시행안 확인', description: '수행 관련 부서 조율 회의', startDate: '2026-06-08', endDate: '2026-06-08', category: 'personal', color: '#10b981', ownerId: 'seominho_tester', ownerName: '서민호', createdAt: new Date().toISOString() }
];

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 's_1',
    title: '2026학년도 교직원 하반기 직무연수 개설 희망 주제 조사',
    description: '선생님들의 직무 성장에 기여하고자 최상의 연수를 계획 중입니다. 원하시는 테마를 선택해 주시기 바랍니다.',
    authorId: 'seominho_tester',
    authorName: '서민호',
    isClosed: false,
    isAnonymous: true,
    questions: [
      { id: 'q1', type: 'single', questionText: '가장 관심 있는 교육 분야를 선택하세요.', options: ['인공지능(AI) 보조교구 활용', '학교폭력 예방 및 심리치유', '미래디자인 창의교육', '학교 행정 효율화 자율 연수'] },
      { id: 'q2', type: 'multiple', questionText: '적절하다고 생각하는 연수 운영 회차를 고르세요 (다중선택)', options: ['단기 집중 (하루 4시간)', '원격 연수 (15차시 과정)', '방과후 분산 (매주 2시간씩)'] },
      { id: 'q3', type: 'text', questionText: '기타 연수에 바라는 피드백을 기재해주세요.' }
    ],
    responses: [
      { userId: 'teacher_gen_2', answers: { q1: '인공지능(AI) 보조교구 활용', q2: ['원격 연수 (15차시 과정)'], q3: '태블릿 대여가 잘 되어 연수가 실습 형태로 진행되면 좋겠습니다.' }, createdAt: new Date().toISOString() },
      { userId: 'teacher_gen_5', answers: { q1: '학교폭력 예방 및 심리치유', q2: ['단기 집중 (하루 4시간)', '방과후 분산 (매주 2시간씩)'], q3: '강사의 실제 사례 중심 진행을 희망합니다.' }, createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const MOCK_MEETINGS: MeetingRoom[] = [
  {
    id: 'meet_1',
    title: '6월 제1차 부장교사 및 행정실 정례 간담회',
    type: 'heads',
    date: '2026-06-03',
    time: '14:00',
    agenda: '학기 초 학사운영 점검 및 디지털 교과서 스마트 인프라 대여 지침 확정',
    attachments: [
      { name: '대여인프라_운용대장_안.xlsx', type: 'xlsx', url: '#' }
    ],
    minutes: `### 6월 제1차 부장 간담회 회의록\n\n- **일시**: 2026년 6월 3일 14:00 ~ 15:30\n- **장소**: 2층 소회의실\n- **참석자**: 이정호(교감), 김경임(교무), 안민혁(안전) 외 부장 6인\n\n#### [안건 1] 학교 스마트 기기 학급 대여 전산화 지침안\n- 공동 발표자료와 연동하여 태블릿 카트 대여 시, 각 기기 일련번호 확인 및 인계 대장 작성을 의무화하기로 결의함.\n- 나이스 학적 동기화는 차주 수요일 중 정보보안 교사가 지원키로 조율.\n\n#### [안건 2] 생활지도 방안 조정\n- 하절기 대비 급식실 안전 동선 준수를 위한 지킴이 조 조정을 다시 정리함.`,
    attendance: {
      'principal_1': 'present',
      'vice_1': 'present',
      'seominho_tester': 'present',
      'teacher_김경임': 'present',
      'teacher_안민혁': 'present'
    },
    recorderId: 'seominho_tester',
    recorderName: '서민호',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_SEONGMU_SHEETS: SeongmuSheet[] = [
  {
    id: 'sheet_1',
    title: '2026학년도 대전성모여고 학사 및 행사 공동 추진 일정표',
    description: '교무운영부, 교육연구부, 학생생활안전부 등 부서별 연간 학사일정 및 주간 계획 수합을 위한 공유 시트입니다.',
    category: '학사/업무',
    originalUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    embedUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/htmlembed?widget=true&headers=false',
    ownerId: 'teacher_최신호',
    ownerName: '최신호',
    comments: [
      { id: 'sc_1', authorId: 'teacher_최성은', authorName: '최성은', content: '교육연구부 연수 일정을 6월 3주차 시트에 추가해 두었습니다. 확인 부탁드립니다!', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'sc_2', authorId: 'teacher_최신호', authorName: '최신호', content: '네, 반영 확인했습니다! 다른 부서장 선생님들께서도 6월 계획 입력을 부탁드립니다.', createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'sheet_2',
    title: '교학 상장 교직원 독서동아리 및 정보보안 연수 신청 현황',
    description: '매월 실시되는 디지털 문해력 및 교사 맞춤형 AI 수업도구 연수 신청자 대장입니다.',
    category: '연수/복지',
    originalUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    embedUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/htmlembed?widget=true&headers=false',
    ownerId: 'teacher_최형진',
    ownerName: '최형진',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'sheet_3',
    title: '1학기 교과 협의회 지필/수행평가 계획 및 처리 대장',
    description: '이원목적분류표 최종 제출 및 교과별 수행평가 영역 비율 취합 관리 서식입니다. 기한을 반드시 준수 바랍니다.',
    category: '성적/평가',
    originalUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    embedUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/htmlembed?widget=true&headers=false',
    ownerId: 'teacher_조동우',
    ownerName: '조동우',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Master Storage Service utilizing LocalStorage
export class SchoolStorage {
  private static initKey(key: string, defaultData: any) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultData));
    }
  }

  static initialize() {
    // Force reset if legacy mock principal (e.g. '홍길동') is still stored, '송미령' is absent, extension needs upgrading, or legacy departments exist.
    const stored = localStorage.getItem('school_users');
    let needsReset = false;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const song = parsed.find((u: any) => u.name === '송미령');
        const hasLegacyDept = parsed.some((u: any) => u.department === '기능부' || u.department === '교무기획부');
        if (!song || song.extension !== '810' || !song.phone || hasLegacyDept) {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    } else {
      needsReset = true;
    }

    if (needsReset) {
      localStorage.removeItem('school_current_user'); // force logout to avoid session crashes
      localStorage.removeItem('school_users');
      localStorage.removeItem('school_channels');
      localStorage.removeItem('school_messages');
      localStorage.removeItem('school_notices');
      localStorage.removeItem('school_files');
      localStorage.removeItem('school_events');
      localStorage.removeItem('school_surveys');
      localStorage.removeItem('school_meetings');
      localStorage.removeItem('school_seongmu_sheets');
    }

    this.initKey('school_users', MOCK_USERS);
    this.initKey('school_channels', MOCK_CHANNELS);
    this.initKey('school_messages', MOCK_MESSAGES);
    this.initKey('school_notices', MOCK_NOTICES);
    this.initKey('school_files', MOCK_FILES);
    this.initKey('school_events', MOCK_EVENTS);
    this.initKey('school_surveys', MOCK_SURVEYS);
    this.initKey('school_meetings', MOCK_MEETINGS);
    this.initKey('school_seongmu_sheets', MOCK_SEONGMU_SHEETS);
  }

  private static get<T>(key: string): T[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  }

  private static set<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('storage')); // trigger local storage sync updates in tabs
  }

  // --- Users ---
  static getUsers(): User[] {
    return this.get<User>('school_users');
  }

  static updateUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    this.set('school_users', users);
  }

  // --- Chat Rooms ---
  static getChannels(): ChatRoom[] {
    return this.get<ChatRoom>('school_channels');
  }

  static addChannel(channel: ChatRoom) {
    const channels = this.getChannels();
    channels.push(channel);
    this.set('school_channels', channels);
    return channel;
  }

  static deleteChannel(id: string) {
    const channels = this.getChannels();
    this.set('school_channels', channels.filter(c => c.id !== id));
    
    // Clean up channel messages
    const msgs = this.get<ChatMessage>('school_messages');
    this.set('school_messages', msgs.filter(m => m.roomId !== id));
  }

  // --- Chat Messages ---
  static getMessages(roomId: string): ChatMessage[] {
    const msgs = this.get<ChatMessage>('school_messages');
    return msgs.filter(m => m.roomId === roomId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static addMessage(msg: ChatMessage) {
    const msgs = this.get<ChatMessage>('school_messages');
    msgs.push(msg);
    this.set('school_messages', msgs);
    return msg;
  }

  static updateMessageRead(roomId: string, userId: string) {
    const msgs = this.get<ChatMessage>('school_messages');
    let changed = false;
    msgs.forEach(m => {
      if (m.roomId === roomId) {
        if (!m.readBy) m.readBy = [];
        if (!m.readBy.includes(userId)) {
          m.readBy.push(userId);
          changed = true;
        }
      }
    });
    if (changed) {
      this.set('school_messages', msgs);
    }
  }

  // --- Notices ---
  static getNotices(): Notice[] {
    return this.get<Notice>('school_notices').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static addNotice(notice: Notice) {
    const notices = this.getNotices();
    notices.push(notice);
    this.set('school_notices', notices);
    return notice;
  }

  static updateNotice(notice: Notice) {
    const notices = this.getNotices();
    const idx = notices.findIndex(n => n.id === notice.id);
    if (idx >= 0) {
      notices[idx] = notice;
      this.set('school_notices', notices);
    }
  }

  static deleteNotice(id: string) {
    const notices = this.getNotices();
    this.set('school_notices', notices.filter(n => n.id !== id));
  }

  // --- Files ---
  static getFiles(): FileRecord[] {
    return this.get<FileRecord>('school_files');
  }

  static addFile(file: FileRecord) {
    const files = this.getFiles();
    files.push(file);
    this.set('school_files', files);
    return file;
  }

  static deleteFile(id: string) {
    const files = this.getFiles();
    // Re-assign remaining elements
    const filtered = files.filter(f => f.id !== id && f.parentFolderId !== id);
    this.set('school_files', filtered);
  }

  static updateFile(file: FileRecord) {
    const files = this.getFiles();
    const idx = files.findIndex(f => f.id === file.id);
    if (idx >= 0) {
      files[idx] = file;
      this.set('school_files', files);
    }
  }

  // --- Events ---
  static getEvents(): CalendarEvent[] {
    return this.get<CalendarEvent>('school_events');
  }

  static addEvent(event: CalendarEvent) {
    const evs = this.getEvents();
    evs.push(event);
    this.set('school_events', evs);
    return event;
  }

  static deleteEvent(id: string) {
    const evs = this.getEvents();
    this.set('school_events', evs.filter(e => e.id !== id));
  }

  // --- Surveys ---
  static getSurveys(): Survey[] {
    return this.get<Survey>('school_surveys');
  }

  static addSurvey(survey: Survey) {
    const surveys = this.getSurveys();
    surveys.push(survey);
    this.set('school_surveys', surveys);
    return survey;
  }

  static updateSurvey(survey: Survey) {
    const surveys = this.getSurveys();
    const idx = surveys.findIndex(s => s.id === survey.id);
    if (idx >= 0) {
      surveys[idx] = survey;
      this.set('school_surveys', surveys);
    }
  }

  // --- Meetings ---
  static getMeetings(): MeetingRoom[] {
    return this.get<MeetingRoom>('school_meetings');
  }

  static addMeeting(meeting: MeetingRoom) {
    const meets = this.getMeetings();
    meets.push(meeting);
    this.set('school_meetings', meets);
    return meeting;
  }

  static updateMeeting(meeting: MeetingRoom) {
    const meets = this.getMeetings();
    const idx = meets.findIndex(m => m.id === meeting.id);
    if (idx >= 0) {
      meets[idx] = meeting;
      this.set('school_meetings', meets);
    }
  }

  // --- Seongmu Sheets ---
  static getSeongmuSheets(): SeongmuSheet[] {
    return this.get<SeongmuSheet>('school_seongmu_sheets');
  }

  static addSeongmuSheet(sheet: SeongmuSheet) {
    const sheets = this.getSeongmuSheets();
    sheets.push(sheet);
    this.set('school_seongmu_sheets', sheets);
    return sheet;
  }

  static updateSeongmuSheet(sheet: SeongmuSheet) {
    const sheets = this.getSeongmuSheets();
    const idx = sheets.findIndex(s => s.id === sheet.id);
    if (idx >= 0) {
      sheets[idx] = sheet;
      this.set('school_seongmu_sheets', sheets);
    }
  }

  static deleteSeongmuSheet(id: string) {
    const sheets = this.getSeongmuSheets();
    this.set('school_seongmu_sheets', sheets.filter(s => s.id !== id));
  }
}
