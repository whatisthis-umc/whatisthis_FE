////src/pages/AdminPages/AdminNotice/AdminNoticePage.tsx

import { useEffect, useState } from "react";
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
import { deleteNotice, getNotices ,type Notice } from "../../../api/adminNotice";
import DeleteSuccessModal from "../../../components/common/adminDeleteSuccessModal";
//페이지네이션 코드 통일
import Pagination from "../../../components/customer/Pagination";

export default function AdminNoticePage() {

   // UI 상태
  const [search, setSearch] = useState("");      // (백엔드 검색 파라미터 없으니, 일단 클라이언트 필터링용 보관)
  const [uiPage, setUiPage] = useState(1);       // 사용자에게 보이는 페이지(1-base)
  const pageSize = 5;                             // 스웨거 기본 5

   // 데이터 상태
  const [rows, setRows] = useState<Notice[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false)

    const navigate = useNavigate();


    // 목록 로더
  const load = async (uiPage1Base: number) => {
    setLoading(true);
    try {
      const apiPage = Math.max(0, uiPage1Base - 1); // API는 0-base
      const data = await getNotices({ page: apiPage, size: pageSize });
      setRows(data.notices);
      setTotalPages(data.totalPages);
      setIsFirst(data.first);
      setIsLast(data.last);
      setTotalElements(data.totalElements);
    } catch (e) {
      console.error(e);
      alert("공지사항 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };


   useEffect(() => { load(uiPage); }, [uiPage]);



   // 검색은 서버 파라미터 명세가 없어서 일단 클라이언트에서 제목만 필터
  const visibleRows = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 서버 검색 파라미터가 생기면 여기서 load(1)과 함께 전달
    setUiPage(1);
  };

  const [successOpen, setSuccessOpen] = useState(false);

  const handleDelete = async (id: number) => {
  if (!window.confirm("삭제하시겠습니까?")) return;
  try {
    await deleteNotice(id);

    // 마지막 한 개를 지운 경우, 마지막 페이지라면 한 페이지 앞으로
    if (rows.length === 1 && uiPage > 1 && isLast) {
      setUiPage((p) => p - 1);
    } else {
      await load(uiPage); 
      setSuccessOpen(true);
    }
  } catch (e) {
    console.error(e);
    alert("삭제에 실패했습니다.");
  }
};

  const fmtDate = (iso: string) => iso.slice(0, 10);

 

  return (
    <AdminLayout>
      <Box className="px-10 py-6">
        {/* 상단 제목 */}
        <Box className="text-left mb-20">
          <h2 className="text-2xl font-bold">공지사항 관리</h2>
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
            "& th": {borderBottom: "none", // 헤더 셀 밑줄 제거
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

                 {loading ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 6, textAlign: "center" }}>
                  불러오는 중…
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 6, textAlign: "center" }}>
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((post) => (
                <TableRow
                  key={post.id}
                  onClick={() => navigate(`/admin/notice/${post.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ borderBottom: "1px solid #333333" }}>
                    {/* 서버에 type 없음 → 임시 '필독' 표시 */}
                    <Box
                      sx={{
                        display: "inline-block",
                        px: "12px",
                        py: "4px",
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
                      필독
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
  }}>{fmtDate(post.createdAt)}</TableCell>
                <TableCell
                sx={{ borderBottom: "1px solid #333333"}}>
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
            ))
          )}
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
            onClick={() => navigate("/admin/notice/new")}
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

        {/* 페이지네이션 (공용 컴포넌트) */}
        {/* 페이지네이션 코드 통일 */}
        <Box className="mt-20">
          <Pagination currentPage={uiPage} totalPages={totalPages} onPageChange={setUiPage} />
        </Box>
        <DeleteSuccessModal
  open={successOpen}
  message="삭제 처리되었습니다."
  confirmText="확인"
  onClose={() => setSuccessOpen(false)}
/>
      </Box>
    </AdminLayout>
  );
}
