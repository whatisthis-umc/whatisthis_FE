export interface Report {
  id: number;
  title: string;
  reporter: string;
  reportedUser: string;
  reportedUserNickname: string;
  reason: string;
  status: 'unprocessed' | 'processed';
  createdAt: string;
  content: string;
  category: 'comment' | 'post';
  postCategory: '꿀템추천' | '생활꿀팁' | '커뮤니티';
  postTitle: string;
  postId: number;
  reportedContent?: string; // 실제 신고된 댓글이나 게시글 내용
}

export type ReportStatus = 'all' | 'unprocessed' | 'processed'; 