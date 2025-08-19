import { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  InputBase,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { adminPostCategories } from "../../../data/categoryList";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import arrowDown from "../../../assets/arrow_down.png";
import { axiosInstance } from "../../../api/axiosInstance";
//페이지네이션 코드 통일
import Pagination from "../../../components/customer/Pagination";
import { getAdminPosts } from "../../../api/adminPosts";

interface AdminPost {
  postId: number;
  title: string;
  content: string;
  category: string;
  subCategory: string;
  createdAt: string;
}

export default function AdminPostPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState(false);


  const postsPerPage = 5;

  // 페이지 로드 시 자동 새로고침
  useEffect(() => {
    const shouldRefresh = sessionStorage.getItem("shouldRefresh");
    if (shouldRefresh === "true") {
      sessionStorage.removeItem("shouldRefresh");
      setRefreshTrigger((prev) => prev + 1);
    }
  }, []);

  // 주기적 새로고침 (5초마다 체크)
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldRefresh = sessionStorage.getItem("shouldRefresh");
      if (shouldRefresh === "true") {
        sessionStorage.removeItem("shouldRefresh");
        setRefreshTrigger((prev) => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 실제 게시물 데이터 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("adminAccessToken");

        if (!accessToken) {
          setError("로그인이 필요합니다.");
          return;
        }

        const tipCategories = [
          "COOK_TIP",
          "CLEAN_TIP",
          "BATHROOM_TIP",
          "CLOTH_TIP",
          "STORAGE_TIP",
        ];
        const itemCategories = [
          "SELF_LIFE_ITEM",
          "KITCHEN_ITEM",
          "CLEAN_ITEM",
          "HOUSEHOLD_ITEM",
          "BRAND_ITEM",
        ];

        let allPosts: any[] = [];

        if (selectedCategory === "tip2" || selectedCategory === "all") {
          const tipPromises = tipCategories.map((category) =>
            getAdminPosts({ category, page: 0, size: 20 })
          );

          const tipResponses = await Promise.all(tipPromises);
          tipResponses.forEach((response) => {
            if (response.isSuccess) {
              allPosts.push(...response.result.posts);
            }
          });
        }

        if (selectedCategory === "tip1" || selectedCategory === "all") {
          const itemPromises = itemCategories.map((category) =>
            getAdminPosts({ category, page: 0, size: 20 })
          );

          const itemResponses = await Promise.all(itemPromises);
          itemResponses.forEach((response) => {
            if (response.isSuccess) {
              allPosts.push(...response.result.posts);
            }
          });
        }

        const adminPosts: AdminPost[] = allPosts.map((item: any) => {
          const getUICategory = (subCategory: string): string => {
            const itemSubCategories = [
              "SELF_LIFE_ITEM",
              "KITCHEN_ITEM",
              "CLEAN_ITEM",
              "HOUSEHOLD_ITEM",
              "BRAND_ITEM",
            ];

            const tipSubCategories = [
              "COOK_TIP",
              "CLEAN_TIP",
              "BATHROOM_TIP",
              "CLOTH_TIP",
              "STORAGE_TIP",
            ];

            if (itemSubCategories.includes(subCategory)) {
              return "tip1";
            } else if (tipSubCategories.includes(subCategory)) {
              return "tip2";
            } else {
              return item.category === "LIFE_TIP" ? "tip2" : "tip1";
            }
          };

          return {
            postId: item.postId,
            title: item.title,
            content: item.content || item.summary || "",
            category: getUICategory(item.subCategory),
            subCategory: item.subCategory || item.category,
            createdAt: item.createdAt,
          };
        });

        setPosts(adminPosts);
        setTotalPages(Math.ceil(adminPosts.length / postsPerPage));
      } catch (err: any) {
        console.error("게시물 조회 실패:", err);
        if (err.response?.status === 403) {
          setError("관리자 권한이 필요합니다.");
        } else if (err.response?.status === 401) {
          setError("로그인이 필요합니다.");
        } else {
          setError("게시물을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, selectedCategory, refreshTrigger]); // search 제거

  // 아코디언 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (accordionOpen && !target.closest('[data-accordion]')) {
        setAccordionOpen(false);
      }
    };


    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accordionOpen]);

  // 필터링
  const filteredPosts =
    posts.length > 0
      ? posts
          .filter((post) => {
            let categoryMatch = true;
            if (selectedCategory === "tip1") {
              categoryMatch = post.category === "tip1";
            } else if (selectedCategory === "tip2") {
              categoryMatch = post.category === "tip2";
            } else if (selectedCategory === "all") {
              categoryMatch = true;
            }

            // 검색어가 있을 때만 검색 필터링 적용
            let searchMatch = true;
            if (search.trim()) {
              searchMatch = post.title
                .toLowerCase()
                .includes(search.toLowerCase());
            }

            return categoryMatch && searchMatch;
          })
          //최신순
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      : [];

  // 페이지네이션
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색어가 있을 때만 검색 실행
    if (search.trim()) {
      console.log("검색 실행:", search);
      setCurrentPage(1);
    }
  };

  // 삭제
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (confirmed) {
      try {
        const accessToken = localStorage.getItem("adminAccessToken");

        if (!accessToken) {
          alert("로그인이 필요합니다.");
          return;
        }

        const response = await axiosInstance.delete(`/admin/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data.isSuccess) {
          alert("삭제 처리되었습니다.");
          setPosts((prev) => prev.filter((post) => post.postId !== id));
        } else {
          alert(response.data.message || "삭제에 실패했습니다.");
        }
      } catch (err: any) {
        console.error("삭제 실패:", err);
        if (err.response?.status === 403) {
          alert("관리자 권한이 필요합니다.");
        } else if (err.response?.status === 404) {
          alert("게시물을 찾을 수 없습니다.");
        } else {
          alert("삭제 중 오류가 발생했습니다.");
        }
      }
    }
  };

  const navigate = useNavigate();

  if (loading) {
    return (
      <AdminLayout>
        <Box className="px-10 py-6">
          <Box className="text-left mb-20">
            <h2 className="text-2xl font-bold">게시글 관리</h2>
          </Box>
          <Box className="flex justify-center items-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </Box>
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Box className="px-10 py-6">
          <Box className="text-left mb-20">
            <h2 className="text-2xl font-bold">게시글 관리</h2>
          </Box>
          <Box className="flex justify-center items-center h-64">
            <div className="text-red-500">{error}</div>
          </Box>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box className="px-10 py-6">
        {/* 상단 제목 */}
        <Box className="text-left mb-20">
          <h2 className="text-2xl font-bold">게시글 관리</h2>
        </Box>
        {/* 필터 + 검색 */}
        <Box
          className="mb-6"
          sx={{
            width: 921,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* 커스텀 아코디언 Select 박스 */}
          <Box sx={{ position: "relative" }} data-accordion>
            <Box
              onClick={() => setAccordionOpen(!accordionOpen)}
              sx={{
                width: 567,
                height: 72,
                borderRadius: "32px",
                backgroundColor: "#E6E6E6",
                px: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#333333",
                  lineHeight: "150%",
                  flexGrow: 1,
                }}
              >

                {adminPostCategories.find((cat: any) => cat.id === selectedCategory)?.name || "전체"}
              </Box>
              <img 
                src={arrowDown} 
                alt="arrow" 
                width={24} 
                height={24} 
                style={{ 
                  opacity: 0.8,
                  transform: accordionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </Box>
            

            {/* 아코디언 드롭다운 */}
            {accordionOpen && (
              <Box
                sx={{
                  position: "absolute",
                  top: "80px", // 8px 아래
                  left: 0,
                  zIndex: 1000,
                  display: "flex",
                  width: "568px",
                  padding: "24px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "16px",
                  borderRadius: "32px",
                  background: "#E6E6E6",
                }}
              >

                {adminPostCategories.filter((cat: any) => cat.id !== "all").map((cat: any) => (
                  <Box
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentPage(1);
                      setAccordionOpen(false);
                    }}
                    sx={{
                      width: "100%",
                      cursor: "pointer",
                      fontFamily: "Pretendard",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#333333",
                      lineHeight: "150%",
                    }}
                  >
                    {cat.name}
                  </Box>
                ))}

              </Box>
            )}
          </Box>
          {/* 검색창 */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              width: 216,
              height: 40,
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #333333",
              justifyContent: "space-between",
            }}
          >
            <InputBase
              fullWidth
              placeholder="검색어를 입력하세요."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit(e);
                }
              }}
              sx={{
                fontFamily: "Pretendard",
                fontWeight: 500,
                fontSize: "16px",
                color: "#333333",
                lineHeight: "150%",
                letterSpacing: "-1%",
                px: 1,
                "&::placeholder": {
                  color: "#333333",
                  opacity: 1,
                  fontFamily: "Pretendard",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "150%",
                  letterSpacing: "-1%",
                },
              }}
            />
            <IconButton type="submit">
              <SearchIcon sx={{ color: "#333333" }} />
            </IconButton>
          </Box>
        </Box>
        {/* 게시글 테이블 */}
        <Table
          sx={{
            borderCollapse: "separate",
            "& th": {
              borderBottom: "none",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "150%",
                  letterSpacing: "-2%",
                  color: "#333333",
                  textAlign: "left",
                  pr: "130px",
                }}
              >
                유형
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "150%",
                  letterSpacing: "-2%",
                  color: "#333333",
                  textAlign: "left",
                  pr: "130px",
                }}
              >
                게시글 제목
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "150%",
                  letterSpacing: "-2%",
                  color: "#333333",
                  textAlign: "left",
                  pr: "130px",
                }}
              >
                신고일
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Pretendard",
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "150%",
                  letterSpacing: "-2%",
                  color: "#333333",
                  textAlign: "left",
                }}
              >
                처리 상태
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              fontFamily: "Pretendard",
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "150%",
              letterSpacing: "-2%",
              color: "#333333",
              textAlign: "left",
            }}
          >
            {paginatedPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", borderBottom: "1px solid #333333" }}>
                  게시물이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPosts.map((post) => (
                <TableRow
                  key={post.postId}
                  onClick={() => navigate(`/admin/post/${post.postId}`)}
                  style={{ cursor: "pointer" }}
                >

                  <TableCell sx={{ borderBottom: "1px solid #333333", pr: "130px" }}>

                    <Box
                      sx={{
                        display: "inline-block",
                        padding: "4px 12px",
                        border: "1px solid #999999",
                        borderRadius: "32px",
                        fontFamily: "Pretendard",
                        fontWeight: 500,
                        fontSize: "20px",
                        lineHeight: "150%",
                        letterSpacing: "-2%",
                        color: "#333333",
                      }}
                    >
                      {adminPostCategories.find(
                        (cat: any) => cat.id === post.category
                      )?.name ?? post.category}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Pretendard",
                      fontWeight: 500,
                      fontSize: "20px",
                      lineHeight: "150%",
                      letterSpacing: "-2%",
                      color: "#333333",
                      textAlign: "left",
                      borderBottom: "1px solid #333333",
                      pr: "130px",
                      maxWidth: 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {post.title}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Pretendard",
                      fontWeight: 500,
                      fontSize: "20px",
                      lineHeight: "150%",
                      letterSpacing: "-2%",
                      color: "#333333",
                      textAlign: "left",
                      borderBottom: "1px solid #333333",
                      pr: "130px",
                    }}
                  >
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #333333" }}>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.postId);
                      }}
                      sx={{
                        display: "flex",
                        padding: "4px 12px",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "32px",
                        background: "#333",
                        fontFamily: "Pretendard",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: 500,
                        lineHeight: "150%",
                        letterSpacing: "-0.14px",
                        color: "#FFF",
                        cursor: "pointer",
                      }}
                    >
                      삭제
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* 등록 버튼 + 페이지네이션 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                sessionStorage.setItem("shouldRefresh", "true");
                navigate("/admin/post/new");
              }}
              sx={{
                width: "160px",
                height: "54px",
                backgroundColor: "#333333",
                borderRadius: "32px",
                padding: "12px 16px",
                color: "#FFFFFF",
                fontFamily: "Pretendard",
                fontWeight: 500,
                fontSize: "20px",
                lineHeight: "150%",
                letterSpacing: "-0.02em",
                "&:hover": {
                  backgroundColor: "#111111",
                },
              }}
            >
              등록
            </Button>
          </Box>
        </Box>
        {/* 페이지네이션 (공용 컴포넌트) */}
        {/* 페이지네이션 코드 통일 */}
        <Box className="mt-20">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Box>
      </Box>
    </AdminLayout>
  );
}
