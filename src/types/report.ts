// 신고 사유 enum 타입 정의
export type ReportContent = 
  | 'ABUSIVE_LANGUAGE'
  | 'HARASSMENT'
  | 'SPAM'
  | 'INAPPROPRIATE_CONTENT'
  | 'COPYRIGHT_VIOLATION'
  | 'ETC_CONTENT';

// 신고 상태 enum 타입 정의
export type ReportStatus = 'PROCESSED' | 'UNPROCESSED';

// 신고 타입 enum 정의
export type ReportType = 'POST' | 'COMMENT';

// 공통 API 응답 타입
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 신고 목록 조회 타입 정의
export interface ReportListItem {
  reportId: number;
  type: ReportType;
  content: string;
  reportContent: ReportContent;
  reportedAt: string; // ISO 8601 형식
  status: ReportStatus;
}

export interface ReportListResult {
  reportList: ReportListItem[];
  listSize: number; // 페이지 크기
  totalPage: number; // 전체 페이지 수
  totalElements: number; // 전체 요소 수
  isFirst: boolean; // 첫 페이지 여부
  isLast: boolean; // 마지막 페이지 여부
}

export interface ReportListResponse extends ApiResponse<ReportListResult> {}

// 신고 상세 조회 타입 정의
export interface ReportDetail {
  reportId: number;
  type: ReportType;
  content: string;
  reportContent: ReportContent;
  reportedAt: string;
  status: ReportStatus;
  // 추가 상세 정보는 상세조회 API 스웨거 문서 확인 후 추가
}

export interface ReportDetailResponse extends ApiResponse<ReportDetail> {}

// 신고 사유 한국어 매핑
export const REPORT_CONTENT_LABELS: Record<ReportContent, string> = {
  ABUSIVE_LANGUAGE: '욕설/비방',
  HARASSMENT: '괴롭힘',
  SPAM: '스팸',
  INAPPROPRIATE_CONTENT: '부적절한 콘텐츠',
  COPYRIGHT_VIOLATION: '저작권 침해',
  ETC_CONTENT: '기타',
};

// 신고 타입 한국어 매핑
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  POST: '게시글',
  COMMENT: '댓글',
}; 