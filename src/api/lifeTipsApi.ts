import { createPostService } from "./commonApi";

// 기존 엔드포인트 (일반 사용자 게시물만)
export const tipService = createPostService(
  "/posts/life-tips/all",
  ["LIFE_TIP", "COOK_TIP", "CLEAN_TIP", "BATHROOM_TIP", "CLOTH_TIP", "STORAGE_TIP"],
  "tips"
);

// 관리자 등록 게시물을 포함하는 엔드포인트
export const tipServiceWithAdmin = createPostService(
  "/admin/posts/life-tips/all",  // 관리자 API 사용
  ["LIFE_TIP", "COOK_TIP", "CLEAN_TIP", "BATHROOM_TIP", "CLOTH_TIP", "STORAGE_TIP"],
  "tips"
);

// 모든 게시물을 포함하는 엔드포인트
export const allPostsService = createPostService(
  "/posts",  // 모든 게시물
  ["LIFE_TIP", "COOK_TIP", "CLEAN_TIP", "BATHROOM_TIP", "CLOTH_TIP", "STORAGE_TIP"],
  "tips"
);
