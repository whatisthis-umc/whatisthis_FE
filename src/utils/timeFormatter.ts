export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const targetDate = new Date(dateString);
  const diffMs = now.getTime() - targetDate.getTime();
  
  // 밀리초를 분으로 변환
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // 1시간 미만: 몇분 전
  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)}분 전`;
  }
  
  // 밀리초를 시간으로 변환
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // 1시간 이상 12시간 미만: 몇시간 전
  if (diffHours < 12) {
    return `${diffHours}시간 전`;
  }
  
  // 12시간 이상 24시간 미만: 1일 전
  if (diffHours < 24) {
    return '1일 전';
  }
  
  // 24시간 이상: YY.MM.DD 형식
  const year = targetDate.getFullYear().toString().slice(-2);
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const day = targetDate.getDate().toString().padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}; 