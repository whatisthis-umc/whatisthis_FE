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
import { useInquiry } from "../../../contexts/InquiryContext";

const inquiryStatuses = [
  { id: 'all', name: '전체' },
  { id: 'unprocessed', name: '미답변' },
  { id: 'processed', name: '답변완료' }
];

type InquiryStatus = 'all' | 'unprocessed' | 'processed';
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import Pagination from "../../../components/customer/Pagination";

export default function AdminInquiryPage() {
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const inquiriesPerPage = 5;
  const navigate = useNavigate();
  const { inquiries, updateInquiry } = useInquiry();

  // 필터링
  const filteredInquiries = inquiries.filter((inquiry) => {
    const statusMatch = 
      selectedStatus === "all" || 
      (selectedStatus === "unprocessed" && inquiry.status === "미답변") ||
      (selectedStatus === "processed" && inquiry.status === "답변완료");
    const searchMatch = 
      inquiry.title.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.authorId.toString().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredInquiries.length / inquiriesPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * inquiriesPerPage,
    currentPage * inquiriesPerPage
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // 상태 변경 처리
  const handleStatusChange = (inquiryId: number) => {
    const inquiry = inquiries.find(i => i.id === inquiryId);
    if (inquiry) {
      // 상태를 답변완료로 변경
      updateInquiry(inquiryId, { status: "답변완료" });
      setModalMessage("답변완료로 처리되었습니다.");
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
          <h2 className="text-2xl font-bold">문의내역</h2>
        </Box>

        {/* 필터 + 검색 */}
        <Box className="flex justify-between items-center mb-6">
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as InquiryStatus);
              setCurrentPage(1);
            }}
            size="small"
            sx={{ minWidth: 140, backgroundColor: "#f1f1f1", borderRadius: 3 }}
          >
            {inquiryStatuses.map((status) => (
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

        {/* 문의 테이블 */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>유형</TableCell>
              <TableCell>문의 내용</TableCell>
              <TableCell>작성일</TableCell>
              <TableCell>처리 상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedInquiries.map((inquiry) => (
              <TableRow
                key={inquiry.id}
                onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>
                  <span className="border px-2 py-1 rounded-full text-xs inline-block">
                    {inquiry.type === 'comment' ? '댓글' : '게시물'}
                  </span>
                </TableCell>
                <TableCell>{inquiry.title}</TableCell>
                <TableCell>{inquiry.date}</TableCell>
                <TableCell>
                  {inquiry.status === '미답변' ? (
                    <button
                      className="bg-gray-200 text-gray-700 px-4 py-1 rounded shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(inquiry.id);
                      }}
                    >
                      미답변
                    </button>
                  ) : (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                      답변완료
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