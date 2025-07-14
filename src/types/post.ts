export interface ItemCardProps {
    id:number;
    hashtag: string;
    imageUrl: string | string[];
    title: string;
    description: string;
    views: number;
    scraps: number;
    date: Date;
  }