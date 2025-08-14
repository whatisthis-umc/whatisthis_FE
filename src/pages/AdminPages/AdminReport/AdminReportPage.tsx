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
// import Pagination from "../../../components/customer/Pagination";
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

export default function AdminReportPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>("all" as any);
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
  const [accordionOpen, setAccordionOpen] = useState(false);
  const navigate = useNavigate();

  // 로컬 캐시: 처리 완료 후에도 유형/내용/사유를 유지하기 위한 간단한 저장소
  type ReportCacheEntry = Pick<ReportListItem, 'type' | 'content' | 'reportContent'>;
  const REPORT_CACHE_KEY = 'admin_report_meta_cache';
  const loadReportCache = (): Record<number, ReportCacheEntry> => {
    try {
      const raw = localStorage.getItem(REPORT_CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };
  const saveReportCache = (cache: Record<number, ReportCacheEntry>) => {
    try {
      localStorage.setItem(REPORT_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // noop
    }
  };

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

  const isMeaningful = (v: any) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      return s !== '' && s !== 'null' && s !== 'undefined';
    }
    return true;
  };

  // 상세 API를 통해 비어 있는 신고 내용(content)을 보강하는 함수
  const backfillMissingContent = useCallback(async (list: ReportListItem[]) => {
    const targets = list.filter((item) => !isMeaningful(item.content));
    if (targets.length === 0) return;

    try {
      const results = await Promise.all(
        targets.map(async (t) => {
          try {
            const detail = await reportApi.getReportDetail(t.reportId);
            if (detail?.isSuccess && detail.result) {
              const { postTitle, commentContent, description } = detail.result as any;
              const recovered: string | undefined = postTitle || commentContent || description;
              if (isMeaningful(recovered)) {
                return { reportId: t.reportId, content: recovered as string };
              }
            }
          } catch {
            // ignore per-item errors
          }
          return null;
        })
      );

      const updates = results.filter((r): r is { reportId: number; content: string } => !!r);
      if (updates.length === 0) return;

      // 상태 업데이트
      setReports((prev) => prev.map((r) => {
        const u = updates.find((x) => x.reportId === r.reportId);
        return u ? { ...r, content: u.content } : r;
      }));

      // 캐시 반영
      const cache = loadReportCache();
      updates.forEach((u) => {
        const base = cache[u.reportId] || ({} as any);
        cache[u.reportId] = { type: base.type, reportContent: base.reportContent, content: u.content } as any;
      });
      saveReportCache(cache);
    } catch {
      // ignore
    }
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
        const cache = loadReportCache();
        const mergedList = response.result.reportList.map((r) => {
          const c = cache[r.reportId];
          const mergedContent = isMeaningful(r.content) ? r.content : (c?.content ?? r.content);
          const mergedType = isMeaningful(r.type) ? r.type : (c?.type ?? r.type);
          const mergedReason = isMeaningful(r.reportContent) ? r.reportContent : (c?.reportContent ?? r.reportContent);
          return { ...r, content: mergedContent, type: mergedType, reportContent: mergedReason } as ReportListItem;
        });

        // 병합 결과 중 유효한 값은 캐시에 반영하여 다음 조회에서도 사용
        const nextCache = { ...cache } as Record<number, ReportCacheEntry>;
        mergedList.forEach((m) => {
          const existing = nextCache[m.reportId] || {} as ReportCacheEntry;
          nextCache[m.reportId] = {
            type: isMeaningful(m.type) ? m.type : existing.type,
            content: isMeaningful(m.content) ? m.content : existing.content,
            reportContent: isMeaningful(m.reportContent) ? m.reportContent : existing.reportContent,
          } as ReportCacheEntry;
        });
        saveReportCache(nextCache);

        setReports(mergedList);
        setTotalPages(response.result.totalPage);
        setTotalElements(response.result.totalElements);

        // 비어 있는 신고내용은 상세 API로 보강
        backfillMissingContent(mergedList);
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
  }, [currentPage, selectedStatus, debouncedSearch, getApiStatus, backfillMissingContent]);

  // 초기 로드 및 필터/검색 변경시 재조회
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback(async (reportId: number) => {
    try {
      setProcessing(true);

      // 처리 전 현재 항목의 메타를 캐시에 저장해 둔다 (서버가 마스킹하더라도 유지 표시)
      const current = reports.find((r) => r.reportId === reportId);
      if (current) {
        const cache = loadReportCache();
        cache[reportId] = { type: current.type, content: current.content, reportContent: current.reportContent };
        saveReportCache(cache);
      }

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
      // 목록 재조회는 즉시 하지 않고, 낙관적 업데이트로 유지합니다.
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
  }, [reports]);

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

  if (loading) {
    return (
      <AdminLayout>
        <Box className="px-10 py-6">
          <Box className="text-left mb-20">
            <h2 className="text-2xl font-bold">신고내역</h2>
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
            <h2 className="text-2xl font-bold">신고내역</h2>
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
          <h2 className="text-2xl font-bold">신고내역</h2>
        </Box>

        {/* 필터 + 검색 (MUI 스타일) */}
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
                {reportStatuses.find((status) => status.id === selectedStatus)?.name || "전체"}
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
                {reportStatuses.filter((status) => status.id !== "all").map((status) => (
                  <Box
                    key={status.id}
                    onClick={() => {
                      setSelectedStatus(status.id as ReportStatus);
                      setCurrentPage(1);
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
                    {status.name}
                  </Box>
                ))}
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

        {/* 신고 테이블 (MUI 스타일) */}
        <Table
          sx={{
            borderCollapse: "separate",
            "& th": { borderBottom: "none" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left", pr: "140px" }}>유형</TableCell>
              {/* 신고 내용 컬럼 삭제 */}
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left", pr: "140px" }}>신고 사유</TableCell>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left", pr: "140px" }}>신고일</TableCell>
              <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left" }}>처리 상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ fontFamily: "Pretendard", fontWeight: 500, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left" }}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", borderBottom: "1px solid #333333" }}>
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : displayReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", borderBottom: "1px solid #333333" }}>
                  신고 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              displayReports.map((report) => (
                <TableRow key={report.reportId} onClick={() => navigate(`/admin/report/${report.reportId}`)} style={{ cursor: "pointer" }}>
                  <TableCell sx={{ borderBottom: "1px solid #333333", pr: "140px" }}>
                    <Box sx={{ display: "inline-block", padding: "4px 12px", border: "1px solid #999999", borderRadius: "32px", fontFamily: "Pretendard", fontWeight: 500, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333" }}>
                      {REPORT_TYPE_LABELS[report.type]}
                    </Box>
                  </TableCell>
                  {/* 신고 내용 셀 삭제 */}
                  <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 500, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#666666", textAlign: "left", borderBottom: "1px solid #333333", pr: "140px" }}>{REPORT_CONTENT_LABELS[report.reportContent]}</TableCell>
                  <TableCell sx={{ fontFamily: "Pretendard", fontWeight: 500, fontSize: "20px", lineHeight: "150%", letterSpacing: "-2%", color: "#333333", textAlign: "left", borderBottom: "1px solid #333333", pr: "140px" }}>{formatReportDate(report.reportedAt)}</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #333333" }}>
                    {report.status === "UNPROCESSED" ? (
                      <Box
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(report.reportId); }}
                        sx={{
                          display: "flex",
                          padding: "4px 12px",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "32px",
                          border: "1px solid #999",
                          fontFamily: "Pretendard",
                          fontSize: "14px",
                          fontStyle: "normal",
                          fontWeight: 500,
                          lineHeight: "150%",
                          letterSpacing: "-0.14px",
                          color: processing ? "#CCCCCC" : "#999",
                          backgroundColor: processing ? "#F5F5F5" : "transparent",
                          cursor: processing ? "not-allowed" : "pointer",
                        }}
                      >
                        {processing ? "처리중..." : "미처리"}
                      </Box>
                    ) : (
                      <Box
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
                        }}
                      >
                        처리완료
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 (공용 컴포넌트) */}
        {totalPages >= 1 && (
          <Box className="mt-20">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </Box>
        )}

        {/* 확인 모달 */}
        <ConfirmModal open={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage} />
      </Box>
    </AdminLayout>
  );
}
