import { useState } from "react";
import {
  Box,
  Select,
  MenuItem,
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { dummyQna } from "../../../data/dummyQna";

export default function AdminNoticePage() {
  const [selectedCategory /*, setSelectedCategory */] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  // 필터링
  const filteredPosts = dummyQna.filter((post) => {
    const categoryMatch =
      selectedCategory === "all" || post.category === selectedCategory;
    const searchMatch = post.title.toLowerCase().includes(search.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 검색 시 첫 페이지로
  };
  //삭제
  const handleDelete = (/* id: number */) => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (confirmed) {
      alert("삭제 처리되었습니다.");
    }
    // 실제 삭제 로직은 생략 (예: API 호출)
  };

  const navigate = useNavigate();
  return (
    <AdminLayout>
      <Box className="px-10 py-6">
        {/* 상단 제목 */}
        <Box className="text-left mb-20">
          <h2 className="text-2xl font-bold">Q&A 관리</h2>
        </Box>

        {/* 필터 + 검색 */}

        <Box
          className="mb-6"
          sx={{
            width: 921,
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Select 박스 wrapper */}
          <Box
            sx={{
              width: 567,
              height: 72,
              borderRadius: "32px",
              backgroundColor: "#E6E6E6",
              px: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Select
              value="all"
              onChange={() => {}}
              disableUnderline
              variant="standard"
              IconComponent={() => (
                <img src={arrowDown} alt="arrow" width={24} height={24} />
              )}
              sx={{
                fontFamily: "Pretendard",
                fontWeight: 700,
                fontSize: "16px",
                color: "#333333",
                lineHeight: "150%",
                flexGrow: 1,
                backgroundColor: "transparent",
              }}
            >
              <MenuItem value="all">전체</MenuItem>
            </Select>
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
                  "& input::placeholder": {
                    color: "#333333 !important",
                    opacity: 1, // ← input 내부 placeholder까지 확실하게!
                  },
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
            borderCollapse: "separate", // ← 이거 있어야 일부 보더 제거 가능
            "& th": {
              borderBottom: "none", // 헤더 셀 밑줄 제거
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
            {paginatedPosts.map((post) => (
              <TableRow
                key={post.id}
                onClick={() => navigate(`/admin/qna/${post.id}`)} // ← 이동
                style={{ cursor: "pointer" }}
              >
                <TableCell
                sx={{ borderBottom: "1px solid #333333"}}>
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
                    {adminPostCategories.find((cat) => cat.id === post.category)
                      ?.name ?? post.category}
                  </Box>
                </TableCell>
                <TableCell
<<<<<<< HEAD
                sx={{
    fontFamily: "Pretendard",
    fontWeight: 500,
    fontSize: "20px",
    lineHeight: "150%",
    letterSpacing: "-2%",
    color: "#333333",
    textAlign: "left", // ← 필요시 center로 조정 가능
     borderBottom: "1px solid #333333"
  }}>{post.title}</TableCell>
                <TableCell
                sx={{
    fontFamily: "Pretendard",
    fontWeight: 500,
    fontSize: "20px",
    lineHeight: "150%",
    letterSpacing: "-2%",
    color: "#333333",
    textAlign: "left",
     borderBottom: "1px solid #333333"
  }}>{post.date}</TableCell>
                <TableCell
                sx={{ borderBottom: "1px solid #333333"}}>
=======
                  sx={{
                    fontFamily: "Pretendard",
                    fontWeight: 500,
                    fontSize: "20px",
                    lineHeight: "150%",
                    letterSpacing: "-2%",
                    color: "#333333",
                    textAlign: "left", // ← 필요시 center로 조정 가능
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
                    textAlign: "center",
                  }}
                >
                  {post.date}
                </TableCell>
                <TableCell>
>>>>>>> dev
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                    style={{
                      backgroundColor: "#0080FF",
                      color: "#FFFFFF",
                      fontFamily: "Pretendard",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "150%",
                      letterSpacing: "-1%",
                      padding: "4px 12px",
                      borderRadius: "32px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 등록 버튼 + 페이지네이션 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px", // 필요 시 여백 조정
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate("/admin/qna/new")}
            sx={{
              width: "160px",
              height: "54px",
              backgroundColor: "#0080FF",
              borderRadius: "32px",
              padding: "12px 16px",
              color: "#FFFFFF",
              fontFamily: "Pretendard",
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "150%",
              letterSpacing: "-0.02em",
              "&:hover": {
                backgroundColor: "#0066CC",
              },
            }}
          >
            등록
          </Button>
        </Box>
        <Box className="flex justify-center mt-20 gap-2 items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeftIcon sx={{ color: "#999999" }} />
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
            (num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-[24px] h-[24px] rounded-full flex items-center justify-center font-medium text-[20px] leading-[150%] tracking-[-0.02em] ${
                  num === currentPage
                    ? "bg-[#0080FF] text-white"
                    : "text-[#999999] hover:text-black"
                }`}
                style={{ fontFamily: "Pretendard" }}
              >
                {num}
              </button>
            ),
          )}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            <ChevronRightIcon sx={{ color: "#999999" }} />
          </button>
        </Box>
      </Box>
    </AdminLayout>
  );
}
