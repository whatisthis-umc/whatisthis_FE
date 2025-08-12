import { PostCategory } from "../types/communityPost";

export const mapToCategoryEnum = (kor: string): PostCategory => {
  switch (kor) {
    case "생활꿀팁":
      return "tips";
    case "꿀템 추천":
      return "items";
    case "살까말까?":
      return "should-i-buy";
    case "궁금해요!":
      return "curious";
    default:
      return "tips";
  }
};
