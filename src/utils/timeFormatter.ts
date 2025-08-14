export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const targetDate = new Date(dateString);
  const diffMs = now.getTime() - targetDate.getTime();
  
  // 밀리초를 분으로 변환
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  
  // 밀리초를 시간으로 변환
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  
  // 밀리초를 일로 변환
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1일 전';
  }
  
  // 48시간 이상인 경우 YY.MM.DD 형식
  const year = targetDate.getFullYear().toString().slice(-2);
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const day = targetDate.getDate().toString().padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}; 