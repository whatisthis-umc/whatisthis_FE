import { useState, useCallback } from 'react';
import { axiosInstance } from '../api/axiosInstance';

interface InteractionConfig {
  type: 'scrap' | 'like';
  endpoint: string;
  requiresAuth?: boolean;
}

interface InteractionState {
  isActive: boolean;
  count: number;
  isLoading: boolean;
}

interface UseInteractionReturn {
  state: InteractionState;
  toggle: () => Promise<void>;
  updateCount: (newCount: number) => void;
  setActive: (active: boolean) => void;
}

export const useInteraction = (
  postId: number,
  initialState: { isActive: boolean; count: number },
  config: InteractionConfig
): UseInteractionReturn => {
  const [state, setState] = useState<InteractionState>({
    isActive: initialState.isActive,
    count: initialState.count,
    isLoading: false,
  });

  const toggle = useCallback(async () => {
    // 인증이 필요한 경우 체크
    if (config.requiresAuth) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        // 로그인 모달 표시 또는 로그인 페이지로 이동
        alert('로그인이 필요합니다.');
        return;
      }
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await axiosInstance.post(config.endpoint, {}, {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (response.data.isSuccess) {
        const newIsActive = !state.isActive;
        
        setState(prev => ({
          ...prev,
          isActive: newIsActive,
          count: prev.isActive ? prev.count - 1 : prev.count + 1,
          isLoading: false,
        }));

        // 스크랩의 경우 로컬 스토리지 업데이트
        if (config.type === 'scrap') {
          const scrappedPostIds = JSON.parse(localStorage.getItem("scrappedPosts") || "[]");
          
          if (newIsActive) {
            // 스크랩 추가
            if (!scrappedPostIds.includes(postId)) {
              scrappedPostIds.push(postId);
              localStorage.setItem("scrappedPosts", JSON.stringify(scrappedPostIds));
            }
          } else {
            // 스크랩 제거
            const updatedIds = scrappedPostIds.filter((id: number) => id !== postId);
            localStorage.setItem("scrappedPosts", JSON.stringify(updatedIds));
          }
          
          console.log(`스크랩 토글 - postId: ${postId}, newIsActive: ${newIsActive}`);
          console.log(`업데이트된 로컬 스토리지:`, JSON.parse(localStorage.getItem("scrappedPosts") || "[]"));
        }

        console.log(`${config.type} 성공:`, response.data.message);
      } else {
        throw new Error(response.data.message || `${config.type} 실패`);
      }
    } catch (error) {
      console.error(`${config.type} 오류:`, error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      // 에러 처리
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(`${config.type === 'scrap' ? '스크랩' : '좋아요'} 처리 중 오류가 발생했습니다.`);
      }
    }
  }, [postId, state.isActive, config]);

  const updateCount = useCallback((newCount: number) => {
    setState(prev => ({ ...prev, count: newCount }));
  }, []);

  const setActive = useCallback((active: boolean) => {
    setState(prev => ({ ...prev, isActive: active }));
  }, []);

  return {
    state,
    toggle,
    updateCount,
    setActive,
  };
};

// 스크랩 전용 Hook
export const useScrap = (
  postId: number,
  initialState: { isActive: boolean; count: number }
) => {
  // 로컬 스토리지에서 스크랩 상태 확인
  const scrappedPostIds = JSON.parse(localStorage.getItem("scrappedPosts") || "[]");
  const isScrapped = scrappedPostIds.includes(postId);
  
  console.log(`useScrap - postId: ${postId}, scrappedPostIds:`, scrappedPostIds, 'isScrapped:', isScrapped);
  
  const actualInitialState = {
    isActive: isScrapped,
    count: initialState.count,
  };

  return useInteraction(postId, actualInitialState, {
    type: 'scrap',
    endpoint: `/posts/${postId}/scraps`,
    requiresAuth: true,
  });
};

// 좋아요 전용 Hook
export const useLike = (
  postId: number,
  initialState: { isActive: boolean; count: number }
) => {
  return useInteraction(postId, initialState, {
    type: 'like',
    endpoint: `/posts/${postId}/likes`,
    requiresAuth: true,
  });
};