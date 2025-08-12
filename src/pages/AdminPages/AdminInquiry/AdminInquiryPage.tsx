import { useState, useEffect } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import arrowDown from "../../../assets/arrow_down.png";
import { getInquiryList, updateInquiryStatus } from "../../../api/inquiryApi";
import type { InquiryListItem, InquiryStatus } from "../../../types/adminInquiry";
import Pagination from "../../../components/customer/Pagination";
import LoginPromptModal from "../../../components/modals/LoginPromptModal";

const inquiryStatuses = [
  { id: "all", name: "전체" },
  { id: "unprocessed", name: "미답변" },
  { id: "processed", name: "답변완료" },
];

export default function AdminInquiryPage() {
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>("all");
  const [search, setSearch] = useState("");
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

  // API 호출 함수
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getInquiryList(
        currentPage, 
        inquiriesPerPage, 
        selectedStatus, 
        search || undefined
      );
      
      if (response.isSuccess) {
        setInquiries(response.result.inquiries);
        setTotalPages(response.result.totalPages);
      } else {
        setError(response.message || "문의 목록을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("문의 목록 조회 오류:", err);
      setError("문의 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 및 상태 변경 시 API 호출
  useEffect(() => {
    fetchInquiries();
  }, [currentPage, selectedStatus]);

  // 더미 데이터로 필터링하는 대신 실제 데이터 사용
  const displayInquiries = inquiries;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInquiries();
  };

  // 상태 변경 처리
  const handleStatusChange = async (inquiryId: number) => {
    try {
      const response = await updateInquiryStatus(inquiryId, { status: "processed" });
      if (response.isSuccess) {
        setModalMessage("답변완료로 처리되었습니다.");
        setModalOpen(true);
        // 목록 새로고침
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
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalMessage("");
  };

  const handleWriteClick = () => {
    const accessToken = localStorage.getItem("accessToken");
    const adminAccessToken = localStorage.getItem("adminAccessToken");
    if (!accessToken && !adminAccessToken) {
      setShowLoginPrompt(true);
      return;
    }
    // 로그인되어 있다면 고객 문의 작성 페이지로 이동(요구사항에 맞게 경로 조정 가능)
    navigate("/customer/inquiry/write");
  };

  const handleLoginPromptClose = () => setShowLoginPrompt(false);
  const handleLoginPromptLogin = () => {
    setShowLoginPrompt(false);
    navigate("/login");
  };

  return (
    <AdminLayout>
      <div className="px-10 py-6">
        {/* 상단 제목 + 작성 버튼 */}
        <div className="text-left mb-20 flex items-center justify-between">
          <h2 className="text-2xl font-bold">문의내역</h2>
          <button
            onClick={handleWriteClick}
            className="bg-[#0080FF] text-white px-4 py-2 rounded-[32px] hover:bg-[#0070e6]"
          >
            문의글 작성
          </button>
        </div>

        {/* 필터 + 검색 */}
        <div className="mb-6 w-[921px] h-[72px] flex items-center justify-between">
          {/* Select 박스 wrapper */}
          <div className="w-[567px] h-[72px] rounded-[32px] bg-[#E6E6E6] px-6 flex items-center justify-between">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as InquiryStatus);
                setCurrentPage(1);
              }}
              className="flex-grow bg-transparent text-[#333333] font-[Pretendard] font-bold text-base leading-[150%] outline-none"
            >
              {inquiryStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>

            {/* 화살표 아이콘 */}
            <img
              src={arrowDown}
              alt="arrow"
              width={24}
              height={24}
              className="opacity-80"
            />
          </div>

          {/* 검색창 */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-[216px] h-10 flex items-center border-b border-[#333333] justify-between"
          >
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow font-[Pretendard] font-medium text-base text-[#333333] leading-[150%] tracking-[-0.01em] px-1 outline-none placeholder:text-[#333333] placeholder:opacity-100 placeholder:font-[Pretendard] placeholder:font-medium placeholder:text-base placeholder:leading-[150%] placeholder:tracking-[-0.01em]"
            />
            <button type="submit" className="p-1">
              <svg
                className="w-6 h-6 text-[#333333]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* 문의 테이블 */}
        <div className="w-full">
          <table className="w-full border-separate">
            <thead>
              <tr>
                <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">
                  유형
                </th>
                <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">
                  문의 내용
                </th>
                <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">
                  작성일
                </th>
                <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">
                  처리 상태
                </th>
              </tr>
            </thead>
            <tbody className="font-[Pretendard] font-medium text-xl leading-[150%] tracking-[-0.02em] text-[#333333]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    로딩 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : displayInquiries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    문의 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                displayInquiries.map((inquiry: InquiryListItem) => (
                  <tr
                    key={inquiry.id}
                    onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="py-3">
                      <div className="inline-block py-1 px-3 border border-[#999999] rounded-[32px] font-[Pretendard] font-medium text-xl leading-[150%] tracking-[-0.02em] text-[#333333]">
                        문의
                      </div>
                    </td>
                    <td className="py-3 font-[Pretendard] font-medium text-xl leading-[150%] tracking-[-0.02em] text-[#333333]">
                      {inquiry.title}
                    </td>
                    <td className="py-3 text-center font-[Pretendard] font-medium text-xl leading-[150%] tracking-[-0.02em] text-[#333333]">
                      {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3">
                      {inquiry.status === "UNPROCESSED" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(inquiry.id);
                          }}
                          className="bg-[#E6E6E6] text-[#333333] font-[Pretendard] text-sm font-medium leading-[150%] tracking-[-0.01em] py-1 px-3 rounded-[32px] border-none cursor-pointer"
                        >
                          미답변
                        </button>
                      ) : (
                        <span className="bg-[#0080FF] text-white font-[Pretendard] text-sm font-medium leading-[150%] tracking-[-0.01em] py-1 px-3 rounded-[32px] inline-block">
                          답변완료
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages >= 1 && (
          <div className="mt-20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}

        {/* 확인 모달 */}
        <ConfirmModal
          open={modalOpen}
          onClose={handleModalClose}
          message={modalMessage}
        />

        {/* 로그인 프롬프트 모달 */}
        <LoginPromptModal
          open={showLoginPrompt}
          onClose={handleLoginPromptClose}
          onLogin={handleLoginPromptLogin}
          message="이 기능은 로그인 후 이용 가능합니다.\n로그인하시겠습니까?"
        />
      </div>
    </AdminLayout>
  );
}
