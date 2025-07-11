import { useParams, useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import { dummyPosts3 } from '../../../data/dummyPosts3';

export default function AdminPostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = dummyPosts3.find((p) => p.id === Number(id));

  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <Box className="p-10">
      <Typography variant="h5" fontWeight="bold" mb={4}>게시글 내용</Typography>
      <Typography variant="subtitle1" gutterBottom>제목: {post.title}</Typography>
      <Typography>작성일: {post.date}</Typography>
      <Typography>카테고리: {post.category}</Typography>

      {/* 수정 버튼 */}
      <Box mt={4}>
        <Button
          variant="contained"
          onClick={() => navigate(`/admin/post/${post.id}/edit`)}
        >
          수정
        </Button>
      </Box>
    </Box>
  );
}
