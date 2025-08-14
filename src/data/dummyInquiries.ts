import type { Inquiry } from '../types/adminInquiry';

export const dummyInquiries: Inquiry[] = [
  {
    id: 1,
    title: '상품 리뷰 관련 문의 드립니다.',
    content: '구매한 상품에 대한 리뷰 작성 방법과 관련하여 문의드립니다.',
    status: 'UNPROCESSED',
    createdAt: '2025-07-26T00:00:00.000Z'
  },
  {
    id: 2,
    title: '상품 리뷰 관련 문의 드립니다.',
    content: '상품 교환 및 환불 정책에 대해 자세히 알고 싶습니다.',
    status: 'UNPROCESSED',
    createdAt: '2025-07-26T00:00:00.000Z'
  },
  {
    id: 3,
    title: '상품 리뷰 관련 문의 드립니다.',
    content: '댓글 삭제 기능이 작동하지 않습니다.',
    status: 'UNPROCESSED',
    createdAt: '2025-07-26T00:00:00.000Z'
  },
  {
    id: 4,
    title: '상품 리뷰 관련 문의 드립니다.',
    content: '회원가입 시 인증메일이 오지 않습니다.',
    status: 'PROCESSED',
    createdAt: '2025-07-26T00:00:00.000Z'
  },
  {
    id: 5,
    title: '상품 리뷰 관련 문의 드립니다.',
    content: '커뮤니티 이용 규칙에 대해 궁금합니다.',
    status: 'PROCESSED',
    createdAt: '2025-07-26T00:00:00.000Z'
  }
];

export const inquiryStatuses = [
  { id: 'all', name: '전체' },
  { id: 'unprocessed', name: '미처리' },
  { id: 'processed', name: '처리완료' }
]; 