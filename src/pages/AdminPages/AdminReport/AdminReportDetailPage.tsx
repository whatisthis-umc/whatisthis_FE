import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { processReport, getReportDetail } from "../../../api/reportApi";
import type { ReportDetailData } from "../../../types/report";
import { like as likeIcon, commentIcon } from "../../../assets";
import reportGrayIcon from "../../../assets/report_gray.png";

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [report, setReport] = useState<ReportDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // 신고 상세 정보 조회
  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await getReportDetail(Number(id));
        if (response.isSuccess) {
          setReport(response.result);
          const status = (response.result as any)?.status;
          if (status === 'PROCESSED') {
            setIsProcessed(true);
          }
        } else {
          throw new Error(response.message || '신고를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('신고 상세 조회 실패:', err);
        if (err instanceof Error && err.message.includes('403')) {
          setError('관리자 권한이 없거나 로그인이 필요합니다. 다시 로그인해주세요.');
        } else {
          setError('신고 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [id]);

  const post = report ? (report as any).postPreview : null;
  const isAlreadyProcessed = isProcessed || (report as any)?.status === 'PROCESSED';
  const isCommentType = (report?.type === 'COMMENT' || report?.type === 'comment');

  // 이미지 소스 구성 (없으면 placeholder)
  const images: string[] = (() => {
    if (!post) return [];
    if (Array.isArray((post as any).images) && (post as any).images.length > 0) {
      return (post as any).images as string[];
    }
    if ((post as any).imageUrl) return [(post as any).imageUrl as string];
    if ((post as any).thumbnailUrl) return [(post as any).thumbnailUrl as string];
    return [];
  })();
  const displayImages = images.length > 0 ? images : ["https://via.placeholder.com/800x500?text=No+Image"]; 

  const formatRelative = (iso?: string) => {
    if (!iso) return '';
    const now = new Date();
    const t = new Date(iso);
    const diffMs = now.getTime() - t.getTime();
    const diffM = Math.floor(diffMs / 60000);
    if (diffM < 60) return `${diffM}분 전`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `${diffH}시간 전`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}일 전`;
    return t.toLocaleDateString('ko-KR');
  };

  // 로딩 상태
  if (loading) {
    return (
      <AdminLayout>
        <div className="px-10 py-6 flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <AdminLayout>
        <div className="px-10 py-6">
          <h2 className="text-2xl font-bold mb-6">신고내용</h2>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => navigate('/admin/report')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                목록으로 돌아가기
              </button>
              {error.includes('권한') && (
                <button
                  onClick={() => navigate('/admin/login')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  로그인 페이지로
                </button>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 신고를 찾을 수 없는 경우
  if (!report) {
    return (
      <AdminLayout>
        <div className="px-10 py-6">
          <h2 className="text-2xl font-bold mb-6">신고내용</h2>
          <div className="text-center py-8">
            <p className="mb-4">신고를 찾을 수 없습니다.</p>
            <button 
              onClick={() => navigate('/admin/report')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleStatusChange = async (action: 'delete' | 'keep') => {
    if (!report) return;

    try {
      const response = await processReport(report.reportId, action);
      const actionText = action === 'delete' ? '삭제' : '유지';

      if (response && response.isSuccess) {
        setModalMessage(`${actionText} 처리되었습니다.`);
        setModalOpen(true);
        setIsProcessed(true);
      } else {
        throw new Error(response?.message || `${actionText} 처리에 실패했습니다.`);
      }
    } catch (error) {
      console.error('신고 처리 실패:', error);
      setModalMessage('처리 중 오류가 발생했습니다.');
      setModalOpen(true);
    }
  };

  const handleKeepReport = async () => {
    if (!report) return;
    if (isProcessed || (report as any)?.status === 'PROCESSED') {
      setModalMessage('이미 처리 완료된 신고입니다.');
      setModalOpen(true);
      setIsProcessed(true);
      return;
    }

    try {
      const response = await processReport(report.reportId, 'keep');
      if (response && response.isSuccess) {
        navigate('/admin/report');
      } else if (response && (response as any).code === 'REPORT4001') {
        setIsProcessed(true);
        setModalMessage('이미 처리 완료된 신고입니다.');
        setModalOpen(true);
      } else {
        throw new Error(response?.message || '유지 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('신고 처리 실패:', error);
      const axiosError = error as any;
      const code = axiosError?.response?.data?.code;
      if (code === 'REPORT4001') {
        setIsProcessed(true);
        setModalMessage('이미 처리 완료된 신고입니다.');
      } else if (axiosError?.response?.status === 403) {
        setModalMessage('관리자 권한이 없거나 로그인이 필요합니다. 다시 로그인해주세요.');
      } else {
        setModalMessage('처리 중 오류가 발생했습니다.');
      }
      setModalOpen(true);
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;

    if (!confirm('정말로 이 신고를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await processReport(report.reportId, 'delete');
      if (response && response.isSuccess) {
        setIsProcessed(true);
        setModalMessage('신고가 삭제되었습니다.');
        setModalOpen(true);
      } else if (response && (response as any).code === 'REPORT4001') {
        setIsProcessed(true);
        setModalMessage('이미 처리 완료된 신고입니다.');
        setModalOpen(true);
      } else {
        throw new Error(response?.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('🔥 신고 삭제 실패 상세 정보:', error);
      const axiosError = error as any;
      const code = axiosError?.response?.data?.code;
      if (code === 'REPORT4001') {
        setIsProcessed(true);
        setModalMessage('이미 처리 완료된 신고입니다.');
      } else if (axiosError?.response?.status === 403) {
        setModalMessage('관리자 권한이 없거나 로그인이 필요합니다. 다시 로그인해주세요.');
      } else {
        setModalMessage('삭제 중 오류가 발생했습니다.');
      }
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalMessage("");
    navigate('/admin/report');
  };

  const getReasonText = (content: string) => {
    const reasonMap: Record<string, string> = {
      'ABUSIVE_LANGUAGE': '욕설/비방',
      'SPAM': '스팸',
      'INAPPROPRIATE_CONTENT': '부적절한 내용',
      'COPYRIGHT_INFRINGEMENT': '저작권 침해',
      'OTHER': '기타'
    };
    return reasonMap[content] || content;
  };

  const firstParagraph: string = (() => {
    const contentText = post && typeof post === 'object' && 'content' in post ? (post as any).content as string : '';
    if (!contentText) return '';
    const parts = contentText.split('\n\n');
    return parts[0] || contentText;
  })();

  return (
    <AdminLayout>
      <div className="px-10 py-6">
        {/* 상단 제목 */}
        <div className="text-left mb-20">
          <h2 className="text-2xl font-bold">신고내용</h2>
        </div>

        {/* 신고 메타 정보 */}
        <div className="grid grid-cols-[80px_1fr] gap-x-6 gap-y-2 max-w-xl text-sm mb-20">
          <div className="text-[#333333] font-[Pretendard] font-bold text-base leading-[150%] tracking-[-0.01em]">카테고리</div>
          <div className="text-[#333333] font-[Pretendard] font-medium text-base leading-[150%] tracking-[-0.01em]">{report.category}</div>
          <div className="text-[#333333] font-[Pretendard] font-bold text-base leading-[150%] tracking-[-0.01em]">제목</div>
          <div className="truncate text-[#333333] font-[Pretendard] font-medium text-base leading-[150%] tracking-[-0.01em]">{report.postTitle}</div>
          <div className="text-[#333333] font-[Pretendard] font-bold text-base leading-[150%] tracking-[-0.01em]">작성자</div>
          <div className="text-[#333333] font-[Pretendard] font-medium text-base leading-[150%] tracking-[-0.01em]">{report.nickname}</div>
          <div className="text-[#333333] font-[Pretendard] font-bold text-base leading-[150%] tracking-[-0.01em]">신고일시</div>
          <div className="text-[#333333] font-[Pretendard] font-medium text-base leading-[150%] tracking-[-0.01em]">{new Date(report.reportedAt).toLocaleString()}</div>
          <div className="text-[#333333] font-[Pretendard] font-bold text-base leading-[150%] tracking-[-0.01em]">신고사유</div>
          <div className="text-[#333333] font-[Pretendard] font-medium text-base leading-[150%] tracking-[-0.01em]">{getReasonText(report.content)}</div>
        </div>

        {/* 본문 영역 */}
        {isCommentType ? (
          <div className="flex flex-col">
            <div className="w-full border border-[#E6E6E6] rounded-[24px] p-6 bg-white flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <div className="text-[#333] font-bold">{report.nickname || '닉네임'}</div>
                  <div className="text-[#333] text-[14px] mt-1 whitespace-pre-line">{report.commentContent || '-'}</div>
                  <div className="flex items-center gap-4 text-[#999] text-[12px] mt-3">
                    <span>{formatRelative(report.reportedAt)}</span>
                    <span className="flex items-center gap-1"><img src={likeIcon} alt="like" className="w-4 h-4 opacity-70" />12</span>
                    <span className="flex items-center gap-1"><img src={commentIcon} alt="comment" className="w-4 h-4 opacity-70" />1</span>
                  </div>
                </div>
              </div>
              <button type="button" aria-label="신고" className="flex w-6 h-6 px-[4px] py-[3.75px] justify-center items-center aspect-square">
                <img src={reportGrayIcon} alt="report" />
              </button>
            </div>
          </div>
        ) : (
          /* 게시물 신고 UI */
          <div className="flex gap-12">
            {/* 좌측 이미지 */}
            <div className="hidden md:flex relative w-[500px] h-[500px] p-6 flex-col justify-end items-center bg-gray-200 rounded-4xl overflow-hidden aspect-square">
              <img
                src={displayImages[currentImageIndex]}
                alt="신고된 게시물"
                className="absolute inset-0 w-full h-full object-cover rounded-4xl"
              />
              {displayImages.length > 1 && (
                <div className="relative z-10 mb-2 flex gap-3 bg-[#FFFFFF80] bg-opacity-50 px-3 py-1 rounded-4xl">
                  {displayImages.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-4 h-4 rounded-4xl cursor-pointer ${currentImageIndex === idx ? 'bg-[#0080FF]' : 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 우측 텍스트/세부 */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col">
                <h3 className="text-[22px] md:text-[28px] font-bold text-black mb-4">{report.postTitle}</h3>
                <p className="text-[14px] md:text-[16px] text-[#333] mb-4 whitespace-pre-line">{firstParagraph || '신고된 게시물의 내용을 확인하세요.'}</p>

                {/* 게시물 추가 내용 */}
                <div className="w-full border border-[#E6E6E6] rounded-4xl p-4 mt-4">
                  <p className="text-[14px] md:text-[16px] text-[#333] whitespace-pre-line">
                    {(() => {
                      const contentText = post && typeof post === 'object' && 'content' in post ? (post as any).content as string : '';
                      if (!contentText) return '-';
                      const parts = contentText.split('\n\n');
                      return parts[1] || contentText;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        {!isAlreadyProcessed && (
          <div className="flex justify-end gap-6 mt-20">
            <button
              onClick={handleDeleteReport}
              className="flex w-[160px] px-4 py-3 justify-center items-center bg-[#0080FF] hover:bg-[#0066CC] text-white rounded-4xl text-[20px] font-[500]"
            >
              삭제
            </button>
            <button
              onClick={handleKeepReport}
              className="flex w-[160px] px-4 py-3 justify-center items-center bg-[#0080FF] hover:bg-[#0066CC] text-white rounded-4xl text-[20px] font-[500]"
            >
              유지
            </button>
          </div>
        )}

        {isAlreadyProcessed && (
          <div className="flex justify-center mt-8">
            <span className="bg-[#0080FF] text-white px-6 py-2 rounded-4xl">처리완료된 신고입니다</span>
          </div>
        )}

        {/* 확인 모달 */}
        <ConfirmModal
          open={modalOpen}
          onClose={handleModalClose}
          message={modalMessage}
        />
      </div>
    </AdminLayout>
  );
} 