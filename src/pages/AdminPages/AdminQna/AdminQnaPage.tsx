////src/pages/AdminPages/AdminQna/AdminQnaPage.tsxc
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

import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import arrowDown from "../../../assets/arrow_down.png";
import { deleteQna, getQnas, Qna } from "../../../api/adminQna";
import DeleteSuccessModal from "../../../components/common/adminDeleteSuccessModal";
//페이지네이션 코드 통일 <<
import Pagination from "../../../components/customer/Pagination";


export default function AdminQnaPage() {
  // UI 상태
  const [search, setSearch] = useState("");
  const [uiPage, setUiPage] = useState(1); // 사용자에게 보이는 1-base
  const pageSize = 5;
  // 데이터 상태
  const [rows, setRows] = useState<Qna[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  
  const navigate = useNavigate();

  // 목록 불러오기 (스웨거가 1-base라 그대로 보냄)
  const load = async (page1Base: number) => {
    setLoading(true);
    try {
      const r = await getQnas({ page: page1Base, size: pageSize });
      setRows(r.qnas);
      setTotalPages(r.totalPages);
      setIsFirst(r.first);
      setIsLast(r.last);
      setTotalElements(r.totalElements);
    } catch (e) {
      console.error(e);
      alert("Q&A 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load(uiPage);
  }, [uiPage]);

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

  // 서버 검색 파라미터가 없으므로 일단 제목만 클라이언트 필터
  const visibleRows = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const [successOpen, setSuccessOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUiPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await deleteQna(id);
      // 마지막 한 개를 지웠다면 페이지 한 칸 당겨주기
      if (rows.length === 1 && uiPage > 1 && isLast) {
        setUiPage((p) => Math.max(1, p - 1));
      } else {
        load(uiPage);
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
          <h2 className="text-2xl font-bold">Q&A 관리</h2>
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
                전체
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
                <Box
                  onClick={() => {
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
                  전체
                </Box>
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
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", color: "#333333", pr: "130px" }}>유형</TableCell>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", color: "#333333", pr: "130px" }}>게시글 제목</TableCell>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", color: "#333333", pr: "130px" }}>작성일</TableCell>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", color: "#333333" }}>처리 상태</TableCell>
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
                <TableCell colSpan={4} sx={{ textAlign: "center", borderBottom: "1px solid #333333" }}>
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", borderBottom: "1px solid #333333" }}>
                  Q&A가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => navigate(`/admin/qna/${row.id}`)}
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
                      문의
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
                    {row.title}
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
                    {fmtDate(row.createdAt)}
                  </TableCell>

                  <TableCell sx={{ borderBottom: "1px solid #333333" }}>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id);
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
          <Button
            variant="contained"
            onClick={() => navigate("/admin/qna/new")}
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
              "&:hover": { backgroundColor: "#111111" },
            }}
          >
            등록
          </Button>
        </Box>

        {/* 페이지네이션 (공용 컴포넌트) */}
        {/* 페이지네이션 코드 통일 << */}
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