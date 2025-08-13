export interface Notice {
  id: number;
  title: string;
  content: string;
  createdAt: string; // "2025-07-08T14:04:48" 같은 ISO
}

export interface NoticeListResult {
  notices: Notice[];
  pageNumber: number;   // 0-base
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}