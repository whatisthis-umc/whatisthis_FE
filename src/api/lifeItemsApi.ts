import { createPostService } from "./commonApi";

export const itemService = createPostService(
  "/posts/life-items/all", 
  ["LIFE_ITEM", "SELF_LIFE_ITEM", "KITCHEN_ITEM", "CLEAN_ITEM", "HOUSEHOLD_ITEM", "BRAND_ITEM"],
  "items"
);
