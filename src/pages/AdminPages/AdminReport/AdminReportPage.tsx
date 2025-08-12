import { useState, useEffect, useMemo, useCallback } from "react";
import { reportStatuses } from "../../../data/dummyReports";
import type { ReportStatus } from "../../../types/report";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import arrowDown from "../../../assets/arrow_down.png";
import { 
  REPORT_TYPE_LABELS, 
  REPORT_CONTENT_LABELS,
  type ReportListItem
} from "../../../types/report";
import * as reportApi from "../../../api/reportApi";
import Pagination from "../../../components/customer/Pagination";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

export default function AdminReportPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // 관리자 인증 상태 확인
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const adminAccessToken = localStorage.getItem("adminAccessToken");
    
    if (!accessToken && !adminAccessToken) {
      console.warn("❌ 인증 토큰이 없습니다. 로그인 페이지로 이동합니다.");
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  const getApiStatus = useCallback((status: ReportStatus) => {
    if (status === 'PROCESSED') return 'PROCESSED';
    if (status === 'UNPROCESSED') return 'UNPROCESSED';
    return 'ALL';
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reportApi.getReportList(
        currentPage,
        getApiStatus(selectedStatus),
        debouncedSearch || undefined
      );

      if (response.isSuccess && response.result) {
        setReports(response.result.reportList);
        setTotalPages(response.result.totalPage);
        setTotalElements(response.result.totalElements);
      } else {
        setError(response.message || '신고 목록을 불러오는데 실패했습니다.');
        setReports([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('신고 목록 조회 실패:', err);
      setError('신고 목록을 불러오는데 실패했습니다.');
      setReports([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, debouncedSearch, getApiStatus]);

  // 초기 로드 및 필터/검색 변경시 재조회
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback(async (reportId: number) => {
    try {
      setProcessing(true);
      const response = await reportApi.processReport(reportId, 'delete');

      if (response && response.isSuccess) {
        setModalMessage("삭제 처리되었습니다.");
        setReports((prev) => prev.map((r) => r.reportId === reportId ? { ...r, status: 'PROCESSED' } : r));
      } else if (response && (response as any).code === 'REPORT4001') {
        setModalMessage('이미 처리 완료된 신고입니다.');
        setReports((prev) => prev.map((r) => r.reportId === reportId ? { ...r, status: 'PROCESSED' } : r));
      } else {
        setModalMessage(response?.message || '처리 중 오류가 발생했습니다.');
      }
      setModalOpen(true);
      fetchReports();
    } catch (error) {
      console.error('신고 처리 실패:', error);
      const axiosError = error as any;
      const code = axiosError?.response?.data?.code;
      if (code === 'REPORT4001') {
        setModalMessage('이미 처리 완료된 신고입니다.');
      } else if (axiosError?.response?.status === 403) {
        setModalMessage('관리자 권한이 없거나 로그인이 필요합니다. 다시 로그인해주세요.');
      } else {
        setModalMessage('처리 중 오류가 발생했습니다.');
      }
      setModalOpen(true);
    } finally {
      setProcessing(false);
    }
  }, [fetchReports]);

  const displayReports = useMemo(() => reports, [reports]);

  const formatReportDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  }, []);

  return (
    <AdminLayout>
      <div className="px-10 py-6">
        {/* 상단 제목 */}
        <div className="text-left mb-20">
          <h2 className="text-2xl font-bold">신고내역</h2>
          {totalElements > 0 && (
            <p className="text-gray-600 mt-2">총 {totalElements}건의 신고가 있습니다.</p>
          )}
        </div>

        {/* 필터 + 검색 */}
        <div className="mb-6 w-[921px] h-[72px] flex items-center justify-between">
          {/* Select 박스 wrapper */}
          <div className="w-[567px] h-[72px] rounded-[32px] bg-[#E6E6E6] px-6 flex items-center justify-between">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as ReportStatus);
                setCurrentPage(1);
              }}
              className="flex-grow bg-transparent text-[#333333] font-[Pretendard] font-bold text-base leading-[150%] outline-none"
            >
              {reportStatuses.map((status) => (
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

        {/* 로딩/에러/테이블 */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              <button onClick={fetchReports} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">다시 시도</button>
              <button onClick={() => navigate('/admin/login')} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">로그인 페이지로</button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full border-separate">
              <thead>
                <tr>
                  <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">유형</th>
                  <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">신고 내용</th>
                  <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">신고 사유</th>
                  <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">신고일</th>
                  <th className="text-left font-[Pretendard] font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#333333] pb-4">처리 상태</th>
                </tr>
              </thead>
              <tbody className="font-[Pretendard] font-medium text-xl leading-[150%] tracking-[-0.02em] text-[#333333]">
                {displayReports.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">신고 내역이 없습니다.</td></tr>
                ) : (
                  displayReports.map((report) => (
                    <tr key={report.reportId} onClick={() => navigate(`/admin/reports/${report.reportId}`)} className="cursor-pointer hover:bg-gray-50">
                      <td className="py-3"><div className="inline-block py-1 px-3 border border-[#999999] rounded-[32px] text-base">{REPORT_TYPE_LABELS[report.type]}</div></td>
                      <td className="py-3 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{report.content}</td>
                      <td className="py-3 text-[#666666]">{REPORT_CONTENT_LABELS[report.reportContent]}</td>
                      <td className="py-3 text-center">{formatReportDate(report.reportedAt)}</td>
                      <td className="py-3">
                        {report.status === "UNPROCESSED" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(report.reportId); }}
                            disabled={processing}
                            className={`${processing ? "bg-gray-300 cursor-not-allowed" : "bg-[#0080FF] cursor-pointer"} text-white text-sm font-medium py-1 px-3 rounded-[32px] border-none`}
                          >
                            {processing ? "처리중..." : "처리하기"}
                          </button>
                        ) : (
                          <span className="bg-green-500 text-white text-sm font-medium py-1 px-3 rounded-[32px] inline-block">처리완료</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && !error && totalPages >= 1 && (
          <div className="mt-20">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}

        {/* 확인 모달 */}
        <ConfirmModal open={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage} />
      </div>
    </AdminLayout>
  );
}
