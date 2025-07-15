export interface ItemCardProps {
    id:number;
    category: string; //청소템, 브랜드 꿀템같은 카테고리
    hashtag: string | string[];
    imageUrl: string | string[];
    title: string;
    description: string;
    views: number;
    scraps: number;
    date: Date;
    type: "tips" | "items";
  }