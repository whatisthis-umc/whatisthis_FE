export interface SupportInquiryListItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  memberNickname: string;
  answerContent?: string | null;
  isSecret: boolean;
}

export interface SupportInquiryListResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    inquiries: SupportInquiryListItem[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
  };
}

export interface SupportInquiryDetailResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    memberNickname: string;
    answerContent: string | null;
    isSecret: boolean;
  };
}

export interface SupportInquiryCreateRequest {
  title: string;
  content: string;
  isSecret: boolean;
}

export interface SupportInquiryCreateResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Record<string, never>;
} 