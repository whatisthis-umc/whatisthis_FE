export interface LikeItem {
  id: number;             // postId
  title: string;
  content: string;
  liked: boolean;         // 좋아요 목록이므로 true 고정
  likeCount: number;
  imageUrl: string[];
  category: string;       // 서버 enum이지만 UI에선 string으로 사용
  nickname: string;
  createdAt: string;      // ISO string
  viewCount: number;
  commentCount: number;
  isBestUser: boolean;
}

export interface LikeListViewModel {
  items: LikeItem[];
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
  pageSize: number;
}