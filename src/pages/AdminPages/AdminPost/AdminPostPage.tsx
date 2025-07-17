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
  Paper,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { dummyPosts3 } from "../../../data/dummyPosts3";
import { adminPostCategories } from "../../../data/categoryList";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";

export default function AdminPostPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  // 필터링
  const filteredPosts = dummyPosts3.filter((post) => {
    const categoryMatch =
      selectedCategory === "all" || post.category === selectedCategory;
    const searchMatch = post.title.toLowerCase().includes(search.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 검색 시 첫 페이지로
  };
  //삭제
  const handleDelete = (id: number) => {
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
        <Box className="text-left mb-6">
          <h2 className="text-2xl font-bold">게시글 관리</h2>
        </Box>

        {/* 필터 + 검색 */}
        <Box className="flex justify-between items-center mb-6">
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            size="small"
            sx={{ minWidth: 140, backgroundColor: "#f1f1f1", borderRadius: 3 }}
          >
            {adminPostCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>

          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            className="flex items-center px-2 w-64 h-10 shadow-none border"
          >
            <InputBase
              className="ml-2 flex-1"
              placeholder="검색어를 입력하세요."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconButton type="submit">
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>

        {/* 게시글 테이블 */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>구분</TableCell>
              <TableCell>게시글 제목</TableCell>
              <TableCell>신고일</TableCell>
              <TableCell>처리 상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPosts.map((post) => (
              <TableRow
                key={post.id}
                onClick={() => navigate(`/admin/post/${post.id}`)} // ← 이동
                style={{ cursor: "pointer" }}
              >
                <TableCell>
                  <span className="border px-2 py-1 rounded-full text-xs inline-block">
                    {adminPostCategories.find((cat) => cat.id === post.category)
                      ?.name ?? post.category}
                  </span>
                </TableCell>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.date}</TableCell>
                <TableCell>
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded shadow"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
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
        <Box className="flex justify-between items-center mt-8">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/admin/post/new")}
          >
            등록
          </Button>

          <Box className="flex justify-center gap-2 flex-1">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`px-2 py-1 rounded-full text-sm ${
                    num === currentPage
                      ? "bg-blue-500 text-white font-bold"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {num}
                </button>
              )
            )}
          </Box>
        </Box>
      </Box>
    </AdminLayout>
  );
}
