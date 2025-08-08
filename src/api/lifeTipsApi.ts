import { createPostService } from "./commonApi";

export const tipService = createPostService(
  "/posts/life-tips/all",
  ["LIFE_TIP", "COOK_TIP", "CLEAN_TIP", "BATHROOM_TIP", "CLOTH_TIP", "STORAGE_TIP"],
  "tips"
);
