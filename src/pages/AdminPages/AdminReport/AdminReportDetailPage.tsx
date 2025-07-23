import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Box, Button } from "@mui/material";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { dummyReports } from "../../../data/dummyReports";
import { dummyPosts } from "../../../types/post";
import ConfirmModal from "../../../components/modals/ConfirmModal";

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  const report = dummyReports.find(r => r.id === Number(id));
  const post = report ? dummyPosts.find(p => p.id === report.postId) : null;
  
  if (!report) {
    return (
      <AdminLayout>
        <Box className="px-10 py-6">
          <h2 className="text-2xl font-bold mb-6">신고내용</h2>
          <p>신고를 찾을 수 없습니다.</p>
        </Box>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout>
        <Box className="px-10 py-6">
          <h2 className="text-2xl font-bold mb-6">신고내용</h2>
          <p>해당 게시물을 찾을 수 없습니다.</p>
        </Box>
      </AdminLayout>
    );
  }

  const handleStatusChange = (action: 'delete' | 'keep') => {
    const actionText = action === 'delete' ? '삭제' : '유지';
    // 실제로는 API 호출
    setModalMessage(`${actionText} 처리되었습니다.`);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalMessage("");
    navigate('/admin/reports');
  };

  return (
    <AdminLayout>
      <Box className="px-10 py-6">
        {/* 상단 제목 */}
        <Box className="text-left mb-8">
          <h2 className="text-2xl font-bold">신고내용</h2>
        </Box>

        {/* 신고 정보 테이블 */}
        <Box className="mb-8">
          <table className="w-full max-w-md text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">카테고리</td>
                <td className="py-2">{report.postCategory}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">제목</td>
                <td className="py-2">{report.postTitle}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">작성자</td>
                <td className="py-2">{report.reportedUserNickname}({report.reportedUser})</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">신고일시</td>
                <td className="py-2">{report.createdAt}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-8 font-medium text-gray-600">신고사유</td>
                <td className="py-2">{report.reason}</td>
              </tr>
            </tbody>
          </table>
        </Box>

                {/* 메인 컨텐츠 영역 */}
        {report.category === 'comment' ? (
          /* 댓글 신고의 경우 */
          <Box className="mb-8">
            <Box className="bg-white border rounded-lg p-6">
              {/* 댓글 작성자 정보 */}
              <Box className="flex items-start mb-4">
                <Box className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm text-gray-600">👤</span>
                </Box>
                <Box className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">{report.reportedUserNickname}</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {report.reportedContent || '나쁜 유품인 정말다애나 감사합니다.'}
                  </p>
                  
                  {/* 댓글 메타 정보 */}
                  <Box className="flex items-center text-xs text-gray-500 gap-4">
                    <span>14시간</span>
                    <Box className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>12</span>
                    </Box>
                    <Box className="flex items-center gap-1">
                      <span>💬</span>
                      <span>1</span>
                    </Box>
                  </Box>
                </Box>
                
                {/* 신고 아이콘 */}
                <Box className="ml-4">
                  <span className="text-red-500">🚨</span>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          /* 게시글 신고의 경우 */
          <Box className="flex gap-8 mb-8">
            {/* 왼쪽: 신고된 게시글 내용 */}
            <Box className="flex-1">
              <Box className="bg-gray-200 rounded-lg p-8 min-h-[400px]">
                <Box className="text-gray-700">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-lg">신고된 게시글 내용</div>
                  </div>
                  
                  <Box className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-black">{post.title}</h3>
                    
                    <div className="text-sm text-gray-800 mb-4 whitespace-pre-line leading-relaxed">
                      {post.content}
                    </div>

                    {post.features && (
                      <Box className="space-y-4 mt-6">
                        {post.features.map((feature, index) => (
                          <Box key={index} className="border-l-4 border-blue-200 pl-4">
                            <div className="font-semibold text-gray-700 mb-1">{feature.title}</div>
                            <div className="text-sm text-gray-600 leading-relaxed">
                              {feature.description}
                            </div>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {post.targetAudience && (
                      <Box className="mt-6 bg-blue-50 rounded-lg p-4">
                        <div className="font-semibold text-gray-700 mb-2">추천 대상</div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {post.targetAudience}
                        </div>
                      </Box>
                    )}

                    <Box className="mt-6 pt-4 border-t text-xs text-gray-500">
                      <div>신고 사유: {report.reason}</div>
                      <div className="mt-1">신고 내용: {report.content}</div>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* 오른쪽: 게시글 정보 */}
            <Box className="w-80">
              <Box className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">{post.title}</h3>
                
                <Box className="space-y-4 text-sm">
                  <Box>
                    <div className="text-gray-600 mb-1">작성자</div>
                    <div className="font-medium">{post.authorNickname}({post.author})</div>
                  </Box>
                  
                  <Box>
                    <div className="text-gray-600 mb-1">작성일시</div>
                    <div>{post.createdAt}</div>
                  </Box>
                  
                  <Box>
                    <div className="text-gray-600 mb-1">조회수</div>
                    <div>{post.views.toLocaleString()}</div>
                  </Box>
                  
                  <Box>
                    <div className="text-gray-600 mb-1">좋아요</div>
                    <div>{post.likes}</div>
                  </Box>
                  
                  <Box>
                    <div className="text-gray-600 mb-1">댓글</div>
                    <div>{post.comments}</div>
                  </Box>

                  {post.features && (
                    <Box className="space-y-3">
                      {post.features.map((feature, index) => (
                        <Box key={index}>
                          <div className="text-gray-600 mb-1 font-medium">{feature.title}</div>
                          <div className="text-xs text-gray-500 leading-relaxed">
                            {feature.description}
                          </div>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {post.targetAudience && (
                    <Box className="pt-4 border-t">
                      <div className="text-gray-600 mb-2 font-medium">추천 대상</div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        {post.targetAudience}
                      </div>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* 하단 버튼 */}
        {report.status === 'unprocessed' && (
          <Box className="flex justify-center gap-4">
            <Button
              variant="contained"
              onClick={() => handleStatusChange('delete')}
              sx={{
                backgroundColor: '#3B82F6',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#2563EB'
                }
              }}
            >
              삭제
            </Button>
            <Button
              variant="contained"
              onClick={() => handleStatusChange('keep')}
              sx={{
                backgroundColor: '#3B82F6',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#2563EB'
                }
              }}
            >
              유지
            </Button>
          </Box>
        )}
        
        {report.status === 'processed' && (
          <Box className="flex justify-center">
            <span className="bg-blue-500 text-white px-6 py-2 rounded-lg">
              처리완료된 신고입니다
            </span>
          </Box>
        )}

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