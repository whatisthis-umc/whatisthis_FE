// 문의 목록 아이템 (간단한 정보만 포함)
export interface InquiryListItem {
  id: number;
  title: string;
  content: string;
  status: 'PROCESSED' | 'UNPROCESSED';
  createdAt: string; // ISO 8601 format: "2025-08-11T17:06:42.992Z"
}

// 문의 상세 정보 (전체 정보 포함)
export interface Inquiry extends InquiryListItem {
  author?: string;
  authorNickname?: string;
  authorId?: number;
  category?: 'general' | 'product' | 'service' | 'technical';
  answer?: string; // 관리자 답변 (선택적)
  answeredAt?: string; // 답변 등록일
  isPublic?: boolean; // 공개 여부
  type?: 'post' | 'comment'; // 게시물 또는 댓글 문의
}

// 문의 상태 타입
export type InquiryStatus = 'all' | 'unprocessed' | 'processed';

// 문의 목록 응답 타입 (실제 API 응답 구조)
export interface InquiryListResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    inquiries: InquiryListItem[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
  };
}

// 문의 상세 조회 결과 (실제 API 응답 구조)
export interface InquiryDetail {
  id: number;
  title: string;
  content: string;
  status: 'PROCESSED' | 'UNPROCESSED';
  createdAt: string; // ISO 8601 format: "2025-08-11T17:21:25.251Z"
}

// 문의 상세 응답 타입
export interface InquiryDetailResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: InquiryDetail;
}

// 문의 답변 요청 타입
export interface InquiryAnswerRequest {
  content: string; // 스웨거 스펙에 맞게 키 변경
}

// 문의 답변 응답 타입 (실제 API 응답 구조)
export interface InquiryAnswerResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {}; // 빈 객체로 응답
}

// 상태 변경 요청 타입
export interface InquiryStatusUpdateRequest {
  status: 'processed' | 'unprocessed';
} 