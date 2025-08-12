export interface QnaListItem {
  id: number;
  title: string;
  content: string;
  createdAt: string; // ISO 8601
}

export interface QnaListResult {
  qnas: QnaListItem[];
  pageNumber: number; // 0-based
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface QnaListResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: QnaListResult;
}

// 상세 조회 타입
export interface QnaDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface QnaDetailResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: QnaDetail;
} 