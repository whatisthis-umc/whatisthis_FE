export interface Inquiry {
  id: number;
  title: string;
  content: string;
  author: string;
  authorNickname: string;
  category: 'general' | 'product' | 'service' | 'technical';
  status: 'unprocessed' | 'processed';
  createdAt: string;
  type: 'post' | 'comment';
}

export type InquiryStatus = 'all' | 'unprocessed' | 'processed'; 