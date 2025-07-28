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
  InputBase,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { dummyReports, reportStatuses } from "../../../data/dummyReports";
import type { ReportStatus } from "../../../types/report";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import arrowDown from "../../../assets/arrow_down.png";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function AdminReportPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const reportsPerPage = 5;
  const navigate = useNavigate();

  // 필터링
  const filteredReports = dummyReports.filter((report) => {
    const statusMatch =
      selectedStatus === "all" || report.status === selectedStatus;
    const searchMatch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.reporter.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage,
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // 상태 변경 처리
  const handleStatusChange = (reportId: number) => {
    const report = dummyReports.find((r) => r.id === reportId);
    if (report) {
      // 실제로는 API 호출
      setModalMessage("삭제 처리되었습니다.");
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalMessage("");
  };

  return (
    <AdminLayout>
      <Box className="px-10 py-6">
        {/* 상단 제목 */}
        <Box className="text-left mb-6">
          <h2 className="text-2xl font-bold">신고내역</h2>
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
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as ReportStatus);
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
              {reportStatuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>

            {/* 화살표 아이콘 */}
            <img
              src={arrowDown}
              alt="arrow"
              width={24}
              height={24}
              style={{ opacity: 0.8 }}
            />
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
                },
                "& input::placeholder": {
                  color: "#333333 !important",
                  opacity: 1,
                },
              }}
            />
            <IconButton type="submit">
              <SearchIcon sx={{ color: "#333333" }} />
            </IconButton>
          </Box>
        </Box>

        {/* 신고 테이블 */}
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
                신고 내용
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
            {paginatedReports.map((report) => (
              <TableRow
                key={report.id}
                onClick={() => navigate(`/admin/reports/${report.id}`)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>
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
                    {report.category === "comment" ? "댓글" : "게시글"}
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
                  }}
                >
                  {report.title}
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
                  {report.createdAt}
                </TableCell>
                <TableCell>
                  {report.status === "unprocessed" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(report.id);
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
                      처리하기
                    </button>
                  ) : (
                    <span
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
                        display: "inline-block",
                      }}
                    >
                      처리완료
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        <Box className="flex justify-center mt-6 gap-2 items-center">
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

        {/* 확인 모달 */}
        <ConfirmModal
          open={modalOpen}
          onClose={handleModalClose}
          message={modalMessage}
        />
      </Box>
    </AdminLayout>
  );
}
