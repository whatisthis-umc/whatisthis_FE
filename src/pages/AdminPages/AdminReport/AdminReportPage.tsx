import { useState, useEffect } from "react";
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
  CircularProgress,
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
import { reportApi, type ReportListItem } from "../../../api/reportApi";

export default function AdminReportPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportsPerPage = 5;
  const navigate = useNavigate();

  // 신고 목록 조회
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API 파라미터를 스웨거 문서에 맞게 변환
      let apiStatus = 'ALL';
      if (selectedStatus === 'processed') apiStatus = 'PROCESSED';
      if (selectedStatus === 'unprocessed') apiStatus = 'UNPROCESSED';
      
      const response = await reportApi.getReportList(
        currentPage,
        apiStatus,
        search
      );
      
      // API 응답에서 실제 데이터 추출
      if (response.isSuccess) {
        setReports(response.result.reportList);
        setTotalPages(response.result.totalPage);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('신고 목록 조회 실패:', err);
      setError('신고 목록을 불러오는데 실패했습니다.');
      
      // 개발 중에는 더미 데이터로 폴백 (API 형태로 변환)
      const filteredReports = dummyReports.filter((report) => {
        const statusMatch =
          selectedStatus === "all" || report.status === selectedStatus;
        const searchMatch =
          report.title.toLowerCase().includes(search.toLowerCase()) ||
          report.reporter.toLowerCase().includes(search.toLowerCase());
        return statusMatch && searchMatch;
      });
      
      const startIndex = (currentPage - 1) * 5;
      const paginatedReports = filteredReports.slice(
        startIndex,
        startIndex + 5,
      );
      
      // 더미 데이터를 API 응답 형태로 변환
      const convertedReports: ReportListItem[] = paginatedReports.map((report: any) => ({
        reportId: report.id,
        type: report.category === "comment" ? "COMMENT" : "POST",
        content: report.title,
        reportContent: "ETC_CONTENT",
        reportedAt: report.createdAt || new Date().toISOString(),
        status: report.status === "processed" ? "PROCESSED" : "UNPROCESSED"
      }));
      
      setReports(convertedReports);
      setTotalPages(Math.ceil(filteredReports.length / 5));
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터/검색 변경시 재조회
  useEffect(() => {
    fetchReports();
  }, [currentPage, selectedStatus, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // useEffect에서 search 변경을 감지하여 자동으로 API 호출됨
  };

  // 상태 변경 처리
  const handleStatusChange = async (reportId: number) => {
    try {
      await reportApi.processReport(reportId, 'delete');
      setModalMessage("삭제 처리되었습니다.");
      setModalOpen(true);
      
      // 목록 새로고침
      fetchReports();
    } catch (error) {
      console.error('신고 처리 실패:', error);
      setModalMessage("처리 중 오류가 발생했습니다.");
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
        <Box className="text-left mb-20">
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

        {/* 로딩 상태 */}
        {loading && (
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        )}

        {/* 에러 상태 */}
        {error && (
          <Box className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </Box>
        )}

        {/* 신고 테이블 */}
        {!loading && !error && (
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
            {reports.map((report) => (
              <TableRow
                key={report.reportId}
                onClick={() => navigate(`/admin/reports/${report.reportId}`)}
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
                    {report.type === "COMMENT" ? "댓글" : report.type === "POST" ? "게시글" : "기타"}
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
                  {report.content}
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
                  {new Date(report.reportedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {report.status === "UNPROCESSED" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(report.reportId);
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
        )}

        {/* 페이지네이션 */}
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
