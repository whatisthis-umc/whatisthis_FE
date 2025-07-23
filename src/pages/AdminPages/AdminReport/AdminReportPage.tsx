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
import { dummyReports, reportStatuses } from "../../../data/dummyReports";
import type { ReportStatus } from "../../../types/report";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import Pagination from "../../../components/customer/Pagination";

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
    currentPage * reportsPerPage
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // 상태 변경 처리
  const handleStatusChange = (reportId: number) => {
    const report = dummyReports.find(r => r.id === reportId);
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
        <Box className="flex justify-between items-center mb-6">
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as ReportStatus);
              setCurrentPage(1);
            }}
            size="small"
            sx={{ minWidth: 140, backgroundColor: "#f1f1f1", borderRadius: 3 }}
          >
            {reportStatuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.name}
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

        {/* 신고 테이블 */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>유형</TableCell>
              <TableCell>신고 내용</TableCell>
              <TableCell>신고일</TableCell>
              <TableCell>처리 상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReports.map((report) => (
              <TableRow
                key={report.id}
                onClick={() => navigate(`/admin/reports/${report.id}`)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>
                  <span className="border px-2 py-1 rounded-full text-xs inline-block">
                    {report.category === 'comment' ? '댓글' : '게시글'}
                  </span>
                </TableCell>
                <TableCell>{report.title}</TableCell>
                <TableCell>{report.createdAt}</TableCell>
                <TableCell>
                  {report.status === 'unprocessed' ? (
                    <button
                      className="bg-blue-500 text-white px-4 py-1 rounded shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(report.id);
                      }}
                    >
                      처리하기
                    </button>
                  ) : (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                      처리완료
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        <Box className="flex justify-center items-center mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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