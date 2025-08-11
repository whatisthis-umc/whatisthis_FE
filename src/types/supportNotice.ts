export interface NoticeListItem {
  id: number;
  title: string;
  content: string;
  createdAt: string; // ISO 8601
}

export interface NoticeListResult {
  notices: NoticeListItem[];
  pageNumber: number; // 0-based
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface NoticeListResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: NoticeListResult;
}

// 상세 조회 타입
export interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface NoticeDetailResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: NoticeDetail;
} 