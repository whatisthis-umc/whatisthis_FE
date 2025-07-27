import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface InquiryItem {
  id: number;
  title: string;
  content: string;
  answer?: string; // 관리자 답변 (선택적)
  status: "미답변" | "답변완료";
  date: string;
  isPublic: boolean;
  authorId: number; // 작성자 ID
  type: "post" | "comment"; // 게시물 또는 댓글 문의
}

interface InquiryContextType {
  inquiries: InquiryItem[];
  addInquiry: (inquiry: Omit<InquiryItem, 'id' | 'status' | 'date' | 'type'> & { type?: "post" | "comment" }) => void;
  updateInquiry: (id: number, inquiry: Partial<InquiryItem>) => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (context === undefined) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};

interface InquiryProviderProps {
  children: ReactNode;
}

export const InquiryProvider: React.FC<InquiryProviderProps> = ({ children }) => {
  // 초기 더미 데이터
  const [inquiries, setInquiries] = useState<InquiryItem[]>([
    {
      id: 1,
      title: "상품 관련 문의 문의드립니다.",
      content: "상품에 대해 자세히 알고 싶습니다.",
      status: "미답변",
      date: "2024.01.15",
      isPublic: true,
      authorId: 1001,
      type: "post"
    },
    {
      id: 2,
      title: "배송 관련 문의 문의드립니다.",
      content: "배송이 언제 될까요?",
      status: "미답변",
      date: "2024.01.14",
      isPublic: true,
      authorId: 999,
      type: "comment"
    },
    {
      id: 3,
      title: "교환/환불 관련 문의 문의드립니다.",
      content: "교환이 가능한지 문의드립니다.",
      answer: "안녕하세요. 고객님께서 문의주신 교환 관련 안내드립니다.\n\n구매하신 상품은 수령일로부터 7일 이내에 교환/환불이 가능합니다. 단, 상품의 포장이 훼손되지 않고 사용하지 않은 상태여야 합니다.\n\n교환을 원하시면 고객센터(1588-0000)로 연락주시거나 마이페이지에서 교환 신청을 해주시기 바랍니다.\n\n감사합니다.",
      status: "답변완료",
      date: "2024.01.13",
      isPublic: false,
      authorId: 1002,
      type: "post"
    },
    {
      id: 4,
      title: "회원 관련 문의 문의드립니다.",
      content: "회원 탈퇴는 어떻게 하나요?",
      answer: "안녕하세요. 회원 탈퇴 관련하여 안내드립니다.\n\n회원 탈퇴는 다음과 같이 진행하실 수 있습니다:\n1. 마이페이지 > 계정 관리 > 회원 탈퇴 메뉴 이용\n2. 고객센터 전화(1588-0000)를 통한 탈퇴 요청\n\n※ 주의사항: 탈퇴 시 모든 개인정보가 삭제되며, 적립금 및 쿠폰은 모두 소멸됩니다. 탈퇴 후 동일한 이메일로 재가입은 30일 후 가능합니다.\n\n신중히 결정해 주시기 바랍니다.",
      status: "답변완료",
      date: "2024.01.12",
      isPublic: true,
      authorId: 1003,
      type: "comment"
    },
    {
      id: 5,
      title: "기타 문의 문의드립니다.",
      content: "기타 문의사항입니다.",
      status: "미답변",
      date: "2024.01.11",
      isPublic: true,
      authorId: 999,
      type: "post"
    },
    {
      id: 6,
      title: "상품 크기 관련 문의 문의드립니다.",
      content: "상품 크기가 궁금합니다.",
      status: "미답변",
      date: "2024.01.10",
      isPublic: false,
      authorId: 1004,
      type: "comment"
    },
    {
      id: 7,
      title: "결제 방법 관련 문의 문의드립니다.",
      content: "결제 방법에 대해 알고 싶습니다.",
      status: "미답변",
      date: "2024.01.09",
      isPublic: true,
      authorId: 1005,
      type: "post"
    }
  ]);

  const addInquiry = (newInquiry: Omit<InquiryItem, 'id' | 'status' | 'date' | 'type'> & { type?: "post" | "comment" }) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const inquiry: InquiryItem = {
      ...newInquiry,
      id: Math.max(...inquiries.map(i => i.id), 0) + 1,
      status: "미답변",
      date: formattedDate,
      type: newInquiry.type || "post" // 기본값은 게시물
    };

    setInquiries(prev => [inquiry, ...prev]); // 새로운 문의를 맨 앞에 추가
  };

  const updateInquiry = (id: number, updatedInquiry: Partial<InquiryItem>) => {
    setInquiries(prev => prev.map(inquiry =>
      inquiry.id === id ? { ...inquiry, ...updatedInquiry } : inquiry
    ));
  };

  const value: InquiryContextType = {
    inquiries,
    addInquiry,
    updateInquiry
  };

  return (
    <InquiryContext.Provider value={value}>
      {children}
    </InquiryContext.Provider>
  );
}; 