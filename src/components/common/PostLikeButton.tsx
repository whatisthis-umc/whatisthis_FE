import { useEffect, useState } from "react";
import { useLikePost, useUnlikePost } from "../../hooks/mutations/usePostLike";

type Props = {
  postId: number;
  liked: boolean;           // 부모에서 내려주는 현재 상태 (UI 그대로 쓰기 위함)
  likeCount: number;        // 부모에서 내려주는 현재 카운트
  onChange?: (next: { liked: boolean; likeCount: number }) => void;
  render?: (opts: {
    liked: boolean;
    likeCount: number;
    pending: boolean;
    toggle: () => void;
  }) => React.ReactNode;
};

export default function PostLikeButton({
  postId,
  liked,
  likeCount,
  onChange,
  render,
}: Props) {
  // 내부에서 낙관적 업데이트 처리 (부모 UI는 바꾸지 않음)
  const [localLiked, setLocalLiked] = useState(liked);
  const [localCount, setLocalCount] = useState(likeCount);

  useEffect(() => setLocalLiked(liked), [liked]);
  useEffect(() => setLocalCount(likeCount), [likeCount]);

  const sync = (next: { liked: boolean; likeCount: number }) => {
    setLocalLiked(next.liked);
    setLocalCount(next.likeCount);
    onChange?.(next);
  };

  const likeM = useLikePost(postId, sync);
  const unlikeM = useUnlikePost(postId, sync);
  const pending = likeM.isPending || unlikeM.isPending;

  const toggle = () => {
    if (pending) return;
    const prev = { liked: localLiked, likeCount: localCount };

    if (localLiked) {
      setLocalLiked(false);
      setLocalCount((c) => Math.max(0, c - 1));
      unlikeM.mutate(undefined, {
        onError: () => {
          setLocalLiked(prev.liked);
          setLocalCount(prev.likeCount);
        },
      });
    } else {
      setLocalLiked(true);
      setLocalCount((c) => c + 1);
      likeM.mutate(undefined, {
        onError: () => {
          setLocalLiked(prev.liked);
          setLocalCount(prev.likeCount);
        },
      });
    }
  };

  // 부모가 render를 제공하면 그 UI 그대로 사용
  if (render) {
    return <>{render({ liked: localLiked, likeCount: localCount, pending, toggle })}</>;
  }
  return null;
}