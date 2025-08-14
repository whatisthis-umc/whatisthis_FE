import { axiosInstance } from "./axiosInstance";
import axios from "axios";
import type { Post} from "./types";

// 공통 API 응답 파싱 함수
export const parseApiResponse = (rawString: string, categories: string[]) => {
  const isSuccessMatch = rawString.match(/"isSuccess":(true|false)/);
  const codeMatch = rawString.match(/"code":"([^"]+)"/);
  const messageMatch = rawString.match(/"message":"([^"]+)"/);
  
  if (isSuccessMatch && codeMatch && messageMatch) {
    return {
      isSuccess: isSuccessMatch[1] === 'true',
      code: codeMatch[1],
      message: messageMatch[1],
      result: {
        categories,
        sections: [] as any[]
      }
    };
  }
  return null;
};

// 게시물 데이터 추출 함수
export const extractPostsFromResponse = (rawString: string) => {
  const sectionNameMatch = rawString.match(/"sectionName":"([^"]+)"/);
  const postIdMatches = rawString.match(/"postId":(\d+)/g);
  const titleMatches = rawString.match(/"title":"([^"]+)"/g);
  const summaryMatches = rawString.match(/"summary":"([^"]+)"/g);
  const thumnailUrlMatches = rawString.match(/"thumnailUrl":(null|"[^"]*")/g);
  const categoryMatches = rawString.match(/"category":"([^"]+)"/g);
  const viewCountMatches = rawString.match(/"viewCount":(\d+)/g);
  const scrapCountMatches = rawString.match(/"scrapCount":(\d+)/g);
  
  if (!postIdMatches || !titleMatches || !summaryMatches || !thumnailUrlMatches || !categoryMatches || !sectionNameMatch) {
    return null;
  }
  
  const posts = [];
  
  for (let i = 0; i < postIdMatches.length; i++) {
    const postId = parseInt(postIdMatches[i].match(/\d+/)?.[0] || '0');
    const title = titleMatches[i].match(/"title":"([^"]+)"/)?.[1] || '';
    const summary = summaryMatches[i].match(/"summary":"([^"]+)"/)?.[1] || '';
    const thumnailUrlMatch = thumnailUrlMatches[i].match(/"thumnailUrl":(null|"[^"]*")/);
    const thumnailUrl = thumnailUrlMatch?.[1] === 'null' ? null : thumnailUrlMatch?.[1]?.replace(/"/g, '') || '';
    const category = categoryMatches[i].match(/"category":"([^"]+)"/)?.[1] || 'LIFE_TIP';
    
    // viewCount와 scrapCount 추출
    const viewCount = viewCountMatches?.[i] ? parseInt(viewCountMatches[i].match(/"viewCount":(\d+)/)?.[1] || '0') : 0;
    const scrapCount = scrapCountMatches?.[i] ? parseInt(scrapCountMatches[i].match(/"scrapCount":(\d+)/)?.[1] || '0') : 0;
    
    // 해시태그 추출
    const hashtags: any[] = [];
    const contentMatches = rawString.match(new RegExp(`"postId":${postId}[^}]*"content":"([^"]+)"`, 'g'));
    if (contentMatches) {
      contentMatches.forEach(match => {
        const content = match.match(/"content":"([^"]+)"/)?.[1];
        if (content) {
          hashtags.push({
            id: Math.floor(Math.random() * 1000),
            content: content,
            updatedAt: new Date().toISOString(),
            post: {
              id: postId,
              title: title,
              content: summary,
              viewCount: 0,
              likeCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: category,
              member: null,
              admin: null,
              postImageList: []
            }
          });
        }
      });
    }
    
    // subCategory 추출
    const subCategory = rawString.match(new RegExp(`"postId":${postId}[^}]*"subCategory":"([^"]+)"`, 'g'));
    const subCategories: string[] = [];
    console.log(`Extracting subCategory for postId ${postId}:`, subCategory);
    if (subCategory) {
      const subCatContent = subCategory[0].match(/"subCategory":"([^"]+)"/)?.[1];
      console.log(`Found subCategory content for postId ${postId}:`, subCatContent);
      if (subCatContent) {
        subCategories.push(subCatContent);
      }
    }
    console.log(`Final subCategories for postId ${postId}:`, subCategories);
    
    posts.push({
      postId: postId,
      title: title,
      summary: summary,
      thumnailUrl: thumnailUrl,
      category: category,
      viewCount: viewCount,
      scrapCount: scrapCount,
      hashtags: hashtags.length > 0 ? hashtags : [{
        id: Math.floor(Math.random() * 1000),
        content: "기본태그",
        updatedAt: new Date().toISOString(),
        post: {
          id: postId,
          title: title,
          content: summary,
          viewCount: 0,
          likeCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: category,
          member: null,
          admin: null,
          postImageList: []
        }
      }],
      subCategories: subCategories
    });
  }
  
  return {
    sectionName: sectionNameMatch[1],
    posts: posts
  };
};

// 데이터 변환 함수
export const transformPosts = (rawPosts: any[], postType: "tips" | "items" = "tips"): Post[] => {
  return rawPosts.map((raw: any) => {
    // 해시태그 처리 - API 응답에 따라 다르게 처리
    let hashtags: string[] = [];
    if (Array.isArray(raw.hashtags)) {
      // 새로운 API 응답 형태: ["tag1", "tag2"]
      hashtags = raw.hashtags.filter((tag: any) => tag && typeof tag === 'string');
    } else if (raw.hashtags && Array.isArray(raw.hashtags) && raw.hashtags.length > 0) {
      // 기존 형태: [{content: "tag1"}, {content: "tag2"}]
      hashtags = raw.hashtags.map((h: any) => h.content).filter(Boolean);
    }
    
    console.log(`Raw post ${raw.postId} hashtags:`, raw.hashtags);
    console.log(`Transformed hashtags:`, hashtags);
    
    // postData 처리 - 새로운 API 응답에서는 post 정보가 없을 수 있음
    const postData = raw.hashtags?.[0]?.post || null;
    
    // subCategory (단수형)을 배열로 변환
    const subCategories = raw.subCategory ? [raw.subCategory] : [];
    
    console.log(`Raw post ${raw.postId} subCategory:`, raw.subCategory);
    console.log(`Transformed subCategories:`, subCategories);
    
    console.log(`Transform post ${raw.postId}:`, {
      thumnailUrl: raw.thumnailUrl,
      hasThumnailUrl: !!raw.thumnailUrl,
      thumnailUrlType: typeof raw.thumnailUrl
    });
    
    return {
      postId: raw.postId,
      title: raw.title,
      summary: raw.summary,
      thumbnailUrl: raw.thumnailUrl || "https://via.placeholder.com/300x200?text=No+Image",
      imageUrls: raw.thumnailUrl && raw.thumnailUrl !== 'null' && raw.thumnailUrl.trim() !== '' ? [raw.thumnailUrl] : ["https://via.placeholder.com/300x200?text=No+Image"],
      date: postData?.createdAt || "",
      views: raw.viewCount || postData?.viewCount || 0,
      scraps: raw.scrapCount || postData?.likeCount || 0,
      hashtags: hashtags,
      category: postData?.category || "LIFE_TIP",
      subCategories: subCategories,
      type: postType as "tips" | "items" // 기본값, 필요시 오버라이드
    };
  });
};

// 중복 제거 함수
export const removeDuplicates = (posts: Post[]): Post[] => {
  return posts.reduce((acc: Post[], current: Post) => {
    const exists = acc.find((item: Post) => item.postId === current.postId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);
};

// 공통 API 호출 함수
export const createPostService = (endpoint: string, categories: string[], postType: string = "tips") => {
  return {
    getAllPosts: (page: number): Promise<{ posts: Post[]; totalPages: number }> => {
      const accessToken = localStorage.getItem("accessToken");
      
      // /admin/posts/ 요청만 직접 백엔드로, 나머지는 기존 방식 사용
      const isAdminPostsOnly = endpoint.includes('/admin/posts');
      
      const request = isAdminPostsOnly
        ? axios.get(`http://52.78.98.150:8080${endpoint}`, {
            params: { page },
            headers: {
              Accept: "application/json",
              ...(accessToken && { Authorization: `Bearer ${accessToken}` })
            }
          })
        : axiosInstance.get(endpoint, {
            params: { page },
            headers: {
              ...(accessToken && { Authorization: `Bearer ${accessToken}` })
            }
          });
      
      return request.then((res) => {
            let data;
            try {
              if (typeof res.data === 'string') {
                const rawString = res.data as string;
                data = parseApiResponse(rawString, categories);
              
                if (data) {
                  const sectionData = extractPostsFromResponse(rawString);
                  if (sectionData) {
                    data.result.sections = [sectionData];
                  }
                } else {
                  data = res.data;
                }
              } else {
                data = res.data;
              }
            } catch (error) {
              console.error("JSON parsing error:", error);
              return Promise.reject("데이터 파싱 오류");
            }
          
          if (!data?.isSuccess) {
            return Promise.reject(data?.message || "Unknown error");
          }
          
          try {
            if (!data.result || !data.result.sections) {
              return { posts: [], totalPages: 1 };
            }
            
            const rawPosts = (data.result.sections || []).flatMap(
              (sec: any) => sec?.posts || []
            ).filter((post: any) => post !== null);
            
            // 꿀템 서비스인 경우 꿀템 카테고리만 필터링
            const filteredPosts = postType === "items" 
              ? rawPosts.filter((post: any) => {
                  const category = post.category || post.hashtags?.[0]?.post?.category;
                  console.log(`Post ${post.postId} category:`, category);
                  console.log(`Post ${post.postId} full data:`, post);
                  
                  // 꿀템 카테고리만 필터링
                  const itemCategories = ["LIFE_ITEM", "SELF_LIFE_ITEM", "KITCHEN_ITEM", "CLEAN_ITEM", "HOUSEHOLD_ITEM", "BRAND_ITEM"];
                  return category && itemCategories.includes(category);
                })
              : rawPosts;
            
            const transformedPosts = transformPosts(filteredPosts, postType as "tips" | "items");
            
            const uniquePosts = removeDuplicates(transformedPosts);
            
            return { posts: uniquePosts, totalPages: 1 };
          } catch (error) {
            console.error("Error in data transformation:", error);
            return Promise.reject("데이터 변환 오류");
          }
        })
  }
}; 
}