import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { processReport, getReportDetail } from "../../../api/reportApi";
import type { ReportDetailData } from "../../../types/report";

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [report, setReport] = useState<ReportDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);

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

        // 토큰 상태 디버깅
        const accessToken = localStorage.getItem("accessToken");
        const adminAccessToken = localStorage.getItem("adminAccessToken");
        console.log("🔍 토큰 상태 확인:");
        console.log("- accessToken:", accessToken ? "존재" : "없음");
        console.log("- adminAccessToken:", adminAccessToken ? "존재" : "없음");
        
        const response = await getReportDetail(Number(id));
        if (response.isSuccess) {
          setReport(response.result);
          // 상세 응답에 status가 포함되는 경우 처리완료 상태 반영
          const status = (response.result as any)?.status;
          if (status === 'PROCESSED') {
            setIsProcessed(true);
          }
        } else {
          throw new Error(response.message || '신고를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('신고 상세 조회 실패:', err);
        
        // 403 오류인 경우 특별한 처리
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

  const post = report ? report.postPreview : null;
  const isAlreadyProcessed = isProcessed || (report as any)?.status === 'PROCESSED';

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
        // 상태 업데이트
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
      
      console.log("🔥 신고 유지 API 응답:", response);
      
      // 응답 구조 확인 후 성공 여부 판단
      if (response && response.isSuccess) {
        // 성공 시 모달 없이 바로 목록 페이지로 이동
        navigate('/admin/report');
      } else if (response && (response as any).code === 'REPORT4001') {
        // 이미 처리 완료된 신고인 경우
        setIsProcessed(true);
        setModalMessage('이미 처리 완료된 신고입니다.');
        setModalOpen(true);
      } else {
        throw new Error(response?.message || '유지 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('신고 처리 실패:', error);

      // Axios 형태의 에러 응답 코드 확인
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
      // 상세 디버깅 정보
      const accessToken = localStorage.getItem("accessToken");
      const adminAccessToken = localStorage.getItem("adminAccessToken");
      
      console.log("🚀 삭제 API 호출 전 상세 정보:");
      console.log("- Report ID:", report.reportId);
      console.log("- Access Token:", accessToken ? `${accessToken.substring(0, 20)}...` : "없음");
      console.log("- Admin Access Token:", adminAccessToken ? `${adminAccessToken.substring(0, 20)}...` : "없음");
      console.log("- 사용할 토큰:", adminAccessToken || accessToken ? "존재" : "없음");

      // processReport API 사용
      const response = await processReport(report.reportId, 'delete');
      
      console.log("🔥 신고 삭제 API 응답:", response);
      
      // 응답 구조 확인 후 성공 여부 판단
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
      
      // AxiosError인 경우 더 자세한 정보 로깅
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.log("🔍 Axios 오류 상세:");
        console.log("- Status:", axiosError.response?.status);
        console.log("- Status Text:", axiosError.response?.statusText);
        console.log("- Response Data:", axiosError.response?.data);
        console.log("- Headers:", axiosError.response?.headers);
        console.log("- Request URL:", axiosError.config?.url);
        console.log("- Request Method:", axiosError.config?.method);
        console.log("- Request Headers:", axiosError.config?.headers);
      }
      
      // 에러 코드에 따른 처리
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

  // 신고 사유 매핑
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

  return (
    <AdminLayout>
      <div className="px-10 py-6">
        {/* 상단 제목 */}
        <div className="text-left mb-8">
          <h2 className="text-2xl font-bold">신고내용</h2>
        </div>

        {/* 신고 정보 테이블 */}
        <div className="mb-8">
          <table className="w-full max-w-md text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">카테고리</td>
                <td className="py-2">{report.category}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">제목</td>
                <td className="py-2">{report.postTitle}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">작성자</td>
                <td className="py-2">{report.nickname}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">신고일시</td>
                <td className="py-2">{new Date(report.reportedAt).toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">신고사유</td>
                <td className="py-2">{getReasonText(report.content)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 메인 컨텐츠 영역 */}
        {report.type === 'comment' ? (
          /* 댓글 신고의 경우 */
          <div className="mb-8">
            <div className="bg-white border rounded-lg p-6">
              {/* 댓글 작성자 정보 */}
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm text-gray-600">👤</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">{report.nickname}</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {report.commentContent || '댓글 내용이 없습니다.'}
                  </p>

                  {/* 댓글 메타 정보 */}
                  <div className="flex items-center text-xs text-gray-500 gap-4">
                    <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 신고 아이콘 */}
                <div className="ml-4">
                  <span className="text-red-500">🚨</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 게시글 신고의 경우 */
          <div className="flex gap-8 mb-8">
            {/* 왼쪽: 신고된 게시글 내용 */}
            <div className="flex-1">
              <div className="bg-gray-200 rounded-lg p-8 min-h-[400px]">
                <div className="text-gray-700">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-lg">신고된 게시글 내용</div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-black">{report.postTitle}</h3>

                    <div className="text-sm text-gray-800 mb-4 whitespace-pre-line leading-relaxed">
                      {post && typeof post === 'object' && 'content' in post ? post.content : '게시글 내용을 불러올 수 없습니다.'}
                    </div>

                    <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                      <div>신고 사유: {getReasonText(report.content)}</div>
                      <div className="mt-1">신고 내용: {report.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 게시글 정보 */}
            <div className="w-80">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">{report.postTitle}</h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">작성자</div>
                    <div className="font-medium">{report.nickname}</div>
                  </div>

                  <div>
                    <div className="text-gray-600 mb-1">신고일시</div>
                    <div>{new Date(report.reportedAt).toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-gray-600 mb-1">카테고리</div>
                    <div>{report.category}</div>
                  </div>

                  <div>
                    <div className="text-gray-600 mb-1">신고 타입</div>
                    <div>{report.type}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        {!isAlreadyProcessed && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDeleteReport}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              삭제
            </button>
            <button
              onClick={handleKeepReport}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              유지
            </button>
          </div>
        )}

        {isAlreadyProcessed && (
          <div className="flex justify-center">
            <span className="bg-blue-500 text-white px-6 py-2 rounded-lg">
              처리완료된 신고입니다
            </span>
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