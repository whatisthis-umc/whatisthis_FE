export interface HashtagDTO {
    id: number;
    content: string;
    updatedAt: string;
  }
  
  export interface PostImageDTO {
    id: number;
    imageUrl: string;
  }
  
 
  export interface RawTipPost {
    postId: number;
    thumnailUrl: string;     
    title: string;
    summary: string;
    hashtags: Array<{
      id: number;
      content: string;
      updatedAt: string;
      post: {
        id: number;
        title: string;
        content: string;
        viewCount: number;
        likeCount: number;
        createdAt: string;
        updatedAt: string;
        category: string;
        member: any;
        admin: any;
        postImageList: Array<{
          id: number;
          imageUrl: string;
          post: any; // 순환 참조 방지
        }>;
      };
    }>;
  }
  
  export interface SectionDTO {
    sectionName: string;
    posts: RawTipPost[];
  }
  
  export interface MainPageResponseDTO {
    categories: string[];
    sections: SectionDTO[];
  }
  
  export interface CustomResponse<T> {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
  }
  