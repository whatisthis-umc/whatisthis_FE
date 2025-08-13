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
  scrapId?: number; 
}

interface UseInteractionReturn {
  state: InteractionState;
  toggle: () => Promise<void>;
  updateCount: (newCount: number) => void;
  setActive: (active: boolean) => void;
  setScrapId: (scrapId: number) => void;
}

export const useInteraction = (
  postId: number,
  initialState: { isActive: boolean; count: number; scrapId?: number },
  config: InteractionConfig
): UseInteractionReturn => {
  const [state, setState] = useState<InteractionState>({
    isActive: initialState.isActive,
    count: initialState.count,
    isLoading: false,
    scrapId: initialState.scrapId,
  });

  const toggle = useCallback(async () => {
    if (config.requiresAuth) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      let response;
      
      if (config.type === 'scrap' && state.isActive) {
        // 스크랩 해제: DELETE 요청
        if (!state.scrapId) {
          console.log("scrapId가 없어서 스크랩 목록에서 찾아서 해제합니다.");
           // 스크랩 목록 API를 호출해서 해당 postId의 scrapId 찾기
           try {
             const scrapListResponse = await axiosInstance.get('/scraps', {
               headers: {
                 ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
               },
             });
            
            if (scrapListResponse.data.isSuccess) {
              const scrapItem = scrapListResponse.data.result.scraps.find(
                (item: any) => item.postId === postId
              );
              
              if (scrapItem) {
                console.log(`스크랩 목록에서 찾은 scrapId: ${scrapItem.id}`);
                response = await axiosInstance.delete(`/posts/${postId}/scraps/${scrapItem.id}`, {
                  headers: {
                    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                  },
                });
              } else {
                throw new Error("스크랩 목록에서 해당 게시물을 찾을 수 없습니다.");
              }
            } else {
              throw new Error("스크랩 목록 조회에 실패했습니다.");
            }
          } catch (scrapListError) {
            console.error("스크랩 목록 조회 오류:", scrapListError);
            throw new Error("스크랩 해제를 위해 스크랩 목록을 조회할 수 없습니다.");
          }
        } else {
          response = await axiosInstance.delete(`/posts/${postId}/scraps/${state.scrapId}`, {
            headers: {
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
          });
        }
      } else {
        // 스크랩 추가: POST 요청
        response = await axiosInstance.post(config.endpoint, {}, {
          headers: {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
      }

      if (response.data.isSuccess) {
        const newIsActive = !state.isActive;
        
        setState(prev => ({
          ...prev,
          isActive: newIsActive,
          count: prev.isActive ? prev.count - 1 : prev.count + 1,
          isLoading: false,
          // 스크랩 추가 시 서버에서 반환하는 스크랩 ID 저장
          scrapId: config.type === 'scrap' && newIsActive ? response.data.result?.scrapId : undefined,
        }));

        // 스크랩의 경우 로컬 스토리지 업데이트
        if (config.type === 'scrap') {
          const scrappedPostIds = JSON.parse(localStorage.getItem("scrappedPosts") || "[]");
          const scrappedPostData = JSON.parse(localStorage.getItem("scrappedPostData") || "{}");
          
          if (newIsActive) {
            // 스크랩 추가
            if (!scrappedPostIds.includes(postId)) {
              scrappedPostIds.push(postId);
              scrappedPostData[postId] = {
                scrapId: response.data.result?.scrapId,
                timestamp: Date.now()
              };
              localStorage.setItem("scrappedPosts", JSON.stringify(scrappedPostIds));
              localStorage.setItem("scrappedPostData", JSON.stringify(scrappedPostData));
            }
          } else {
            // 스크랩 제거
            const updatedIds = scrappedPostIds.filter((id: number) => id !== postId);
            delete scrappedPostData[postId];
            localStorage.setItem("scrappedPosts", JSON.stringify(updatedIds));
            localStorage.setItem("scrappedPostData", JSON.stringify(scrappedPostData));
          }
          
          console.log(`스크랩 토글 - postId: ${postId}, newIsActive: ${newIsActive}, scrapId: ${response.data.result?.scrapId}`);
          console.log(`전체 API 응답:`, response.data);
          console.log(`업데이트된 로컬 스토리지:`, JSON.parse(localStorage.getItem("scrappedPosts") || "[]"));
          console.log(`업데이트된 scrappedPostData:`, JSON.parse(localStorage.getItem("scrappedPostData") || "{}"));
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
  }, [postId, state.isActive, state.scrapId, config]);

  const updateCount = useCallback((newCount: number) => {
    setState(prev => ({ ...prev, count: newCount }));
  }, []);

  const setActive = useCallback((active: boolean) => {
    setState(prev => ({ ...prev, isActive: active }));
  }, []);

  const setScrapId = useCallback((scrapId: number) => {
    setState(prev => ({ ...prev, scrapId }));
  }, []);

  return {
    state,
    toggle,
    updateCount,
    setActive,
    setScrapId,
  };
};

// 스크랩 전용 Hook
export const useScrap = (
  postId: number,
  initialState: { isActive: boolean; count: number }
) => {
  // 로컬 스토리지에서 스크랩 상태 확인
  const scrappedPostIds = JSON.parse(localStorage.getItem("scrappedPosts") || "[]");
  const scrappedPostData = JSON.parse(localStorage.getItem("scrappedPostData") || "{}");
  const isScrapped = scrappedPostIds.includes(postId);
  const scrapId = scrappedPostData[postId]?.scrapId;
  
  console.log(`useScrap - postId: ${postId}, scrappedPostIds:`, scrappedPostIds, 'isScrapped:', isScrapped, 'scrapId:', scrapId);
  console.log(`scrappedPostData for postId ${postId}:`, scrappedPostData[postId]);
  console.log(`전체 scrappedPostData:`, scrappedPostData);
  
  const actualInitialState = {
    isActive: isScrapped,
    count: initialState.count,
    scrapId: scrapId,
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