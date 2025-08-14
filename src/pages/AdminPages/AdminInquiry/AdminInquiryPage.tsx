import { useState, useEffect, useMemo, useCallback } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import arrowDown from "../../../assets/arrow_down.png";
import { getInquiryList, updateInquiryStatus } from "../../../api/inquiryApi";
import type { InquiryListItem, InquiryStatus } from "../../../types/adminInquiry";
import LoginPromptModal from "../../../components/modals/LoginPromptModal";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import {
  Box,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputBase,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "../../../components/customer/Pagination";

const inquiryStatuses = [
  { id: "all", name: "전체" },
  { id: "unprocessed", name: "미답변" },
  { id: "processed", name: "답변완료" },
];

export default function AdminInquiryPage() {
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const inquiriesPerPage = 5;
  const navigate = useNavigate();

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInquiryList(
        currentPage,
        inquiriesPerPage,
        selectedStatus,
        debouncedSearch || undefined
      );
      if (response.isSuccess) {
        setInquiries(response.result.inquiries);
        setTotalPages(response.result.totalPages);
      } else {
        setError(response.message || "문의 목록을 불러오는데 실패했습니다.");
        setInquiries([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("문의 목록 조회 오류:", err);
      setError("문의 목록을 불러오는데 실패했습니다.");
      setInquiries([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, inquiriesPerPage, selectedStatus, debouncedSearch]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const displayInquiries = useMemo(() => inquiries, [inquiries]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback(async (inquiryId: number) => {
    try {
      const response = await updateInquiryStatus(inquiryId, { status: "processed" });
      if (response.isSuccess) {
        setModalMessage("답변완료로 처리되었습니다.");
        setModalOpen(true);
        fetchInquiries();
      } else {
        setModalMessage("상태 변경에 실패했습니다.");
        setModalOpen(true);
      }
    } catch (err) {
      console.error("상태 변경 오류:", err);
      setModalMessage("상태 변경에 실패했습니다.");
      setModalOpen(true);
    }
  }, [fetchInquiries]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setModalMessage("");
  }, []);

  const handleWriteClick = useCallback(() => {
    const accessToken = localStorage.getItem("accessToken");
    const adminAccessToken = localStorage.getItem("adminAccessToken");
    if (!accessToken && !adminAccessToken) {
      setShowLoginPrompt(true);
      return;
    }
    navigate("/customer/inquiry/write");
  }, [navigate]);

  const handleLoginPromptClose = useCallback(() => setShowLoginPrompt(false), []);
  const handleLoginPromptLogin = useCallback(() => {
    setShowLoginPrompt(false);
    navigate("/login");
  }, [navigate]);

  if (loading) {
    return (
      <AdminLayout>
        <Box className="px-10 py-6">
          <Box className="text-left mb-20">
            <h2 className="text-2xl font-bold">문의내역</h2>
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
            <h2 className="text-2xl font-bold">문의내역</h2>
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
          <h2 className="text-2xl font-bold">문의내역</h2>
        </Box>

        {/* 필터 + 검색 (MUI 스타일) */}
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
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as InquiryStatus);
                setCurrentPage(1);
              }}
              disableUnderline
              variant="standard"
              IconComponent={() => null}
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
              {inquiryStatuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
            <img src={arrowDown} alt="arrow" width={24} height={24} style={{ opacity: 0.8 }} />
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
                if (e.key === 'Enter') {
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

        {/* 문의 테이블 (MUI 스타일) */}
        <Table
          sx={{
            borderCollapse: "separate",
            "& th": { borderBottom: "none" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left" }}>유형</TableCell>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left" }}>문의 내용</TableCell>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left" }}>작성일</TableCell>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left" }}>처리 상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ fontFamily: "Pretendard", fontWeight: 500, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left" }}>
            {displayInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", borderBottom: "1px solid #333333" }}>
                  문의 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              displayInquiries.map((inquiry: InquiryListItem) => (
                <TableRow key={inquiry.id} onClick={() => navigate(`/admin/inquiry/${inquiry.id}`)} style={{ cursor: "pointer" }}>
                  <TableCell sx={{ borderBottom: "1px solid #333333" }}>
                    <Box sx={{ display: "inline-block", padding: "4px 12px", border: "1px solid #999999", borderRadius: "32px", fontFamily: "Pretendard", fontWeight: 500, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333" }}>
                      문의
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 500, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left", borderBottom: "1px solid #333333" }}>{inquiry.title}</TableCell>
                  <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 500, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left", borderBottom: "1px solid #333333" }}>{new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #333333" }}>
                    {inquiry.status === "UNPROCESSED" ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(inquiry.id); }}
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
                        처리하기
                      </button>
                    ) : (
                      <span className="bg-[#0080FF] text-white text-sm font-medium py-1 px-3 rounded-[32px] inline-block">답변완료</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {totalPages >= 1 && (
          <Box className="mt-20">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </Box>
        )}

        {/* 확인 모달 */}
        <ConfirmModal open={modalOpen} onClose={handleModalClose} message={modalMessage} />

        {/* 로그인 프롬프트 모달 */}
        <LoginPromptModal open={showLoginPrompt} onClose={handleLoginPromptClose} onLogin={handleLoginPromptLogin} message={"이 기능은 로그인 후 이용 가능합니다.\n로그인하시겠습니까?"} />
      </Box>
    </AdminLayout>
  );
}
