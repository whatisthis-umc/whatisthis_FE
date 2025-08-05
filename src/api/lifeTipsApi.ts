import { axiosInstance } from "./axiosInstance";

export interface TipPost {
  postId: number;
  title: string;
  summary: string;
  thumbnailUrl: string;
  imageUrls: string[];
  date: string;
  views: number;
  scraps: number;
  hashtags: string[];
  category: string;
  subCategories?: string[];
}

export const tipService = {
  getAllTips: (page: number): Promise<{ posts: TipPost[]; totalPages: number }> =>
    axiosInstance
      .get("/posts/life-tips/all", {
        params: { page }
      })
      .then((res) => {
        let data;
        try {
          if (typeof res.data === 'string') {
            const rawString = res.data as string;
            
            const isSuccessMatch = rawString.match(/"isSuccess":(true|false)/);
            const codeMatch = rawString.match(/"code":"([^"]+)"/);
            const messageMatch = rawString.match(/"message":"([^"]+)"/);
            
            if (isSuccessMatch && codeMatch && messageMatch) {
              data = {
                isSuccess: isSuccessMatch[1] === 'true',
                code: codeMatch[1],
                message: messageMatch[1],
                result: {
                  categories: ["LIFE_TIP", "COOK_TIP", "CLEAN_TIP", "BATHROOM_TIP", "CLOTH_TIP", "STORAGE_TIP"],
                  sections: [] as any[]
                }
              };
              
              const sectionNameMatch = rawString.match(/"sectionName":"([^"]+)"/);
              const postIdMatches = rawString.match(/"postId":(\d+)/g);
              const titleMatches = rawString.match(/"title":"([^"]+)"/g);
              const summaryMatches = rawString.match(/"summary":"([^"]+)"/g);
              const thumnailUrlMatches = rawString.match(/"thumnailUrl":(null|"[^"]*")/g);
              const categoryMatches = rawString.match(/"category":"([^"]+)"/g);
              
              if (postIdMatches && titleMatches && summaryMatches && thumnailUrlMatches && categoryMatches && sectionNameMatch) {
                const posts = [];
                
                for (let i = 0; i < postIdMatches.length; i++) {
                  const postId = parseInt(postIdMatches[i].match(/\d+/)?.[0] || '0');
                  const title = titleMatches[i].match(/"title":"([^"]+)"/)?.[1] || '';
                  const summary = summaryMatches[i].match(/"summary":"([^"]+)"/)?.[1] || '';
                  const thumnailUrlMatch = thumnailUrlMatches[i].match(/"thumnailUrl":(null|"[^"]*")/);
                  const thumnailUrl = thumnailUrlMatch?.[1] === 'null' ? null : thumnailUrlMatch?.[1]?.replace(/"/g, '') || '';
                  const category = categoryMatches[i].match(/"category":"([^"]+)"/)?.[1] || 'LIFE_TIP';
                  
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
                  
                  const subCategory = rawString.match(new RegExp(`"postId":${postId}[^}]*"subCategory":"([^"]+)"`, 'g'));
                  const subCategories: string[] = [];
                  if (subCategory) {
                    const subCatContent = subCategory[0].match(/"subCategory":"([^"]+)"/)?.[1];
                    if (subCatContent) {
                      subCategories.push(subCatContent);
                    }
                  }
                  
                  posts.push({
                    postId: postId,
                    title: title,
                    summary: summary,
                    thumnailUrl: thumnailUrl,
                    category: category,
                    hashtags: hashtags,
                    subCategories: subCategories
                  });
                }
                
                data.result.sections = [{
                  sectionName: sectionNameMatch[1],
                  posts: posts
                }];
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
          
          const transformedPosts = rawPosts.map((raw: any) => {
            const postData = raw.hashtags[0]?.post;
            
            const hashtags = raw.hashtags
              .map((h: any) => {
                return typeof h === 'string' ? h : h.content;
              })
              .filter((content: any) => {
                return content && content.trim() !== "";
              });
            
            const finalHashtags = hashtags.length > 0 ? hashtags : ["라이프팁"];
            
            const result = {
              postId: raw.postId,
              title: raw.title,
              summary: raw.summary,
              thumbnailUrl: raw.thumnailUrl || "https://via.placeholder.com/300x200?text=No+Image",
              imageUrls: raw.thumnailUrl ? [raw.thumnailUrl] : [],
              date: postData?.createdAt || "",
              views: postData?.viewCount || 0,
              scraps: postData?.likeCount || 0,
              hashtags: finalHashtags,
              category: postData?.category || "LIFE_TIP",
              subCategories: raw.subCategory ? [raw.subCategory] : [],
            };
            
            return result;
          });
          
          const uniquePosts = transformedPosts.reduce((acc: any[], current: any) => {
            const exists = acc.find((item: any) => item.postId === current.postId);
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          return { posts: uniquePosts, totalPages: 1 };
        } catch (error) {
          console.error("Error in data transformation:", error);
          return Promise.reject("데이터 변환 오류");
        }
      }),
};
