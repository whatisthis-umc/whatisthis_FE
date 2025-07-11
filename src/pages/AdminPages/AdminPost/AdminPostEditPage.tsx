import { useParams, useNavigate } from 'react-router-dom';

import { Box, TextField, Button, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { dummyPosts3 } from '../../../data/dummyPosts3';
import { adminPostCategories } from '../../../data/categoryList';


export default function AdminPostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = dummyPosts3.find((p) => p.id === Number(id));

  const [title, setTitle] = useState(post?.title || '');
  const [category, setCategory] = useState(post?.category || 'tip1');

  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  const handleSave = () => {
    console.log('수정된 제목:', title);
    console.log('선택된 카테고리:', category);
    navigate(`/admin/post/${id}`);
  };

  return (
    <Box className="p-10 max-w-[600px]">
      <Typography variant="h5" fontWeight="bold" mb={4}>게시글 수정</Typography>

      <TextField
        label="제목"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TextField
        select
        label="카테고리"
        fullWidth
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        sx={{ mb: 3 }}
      >
        {adminPostCategories
          .filter((cat) => cat.id !== 'all')
          .map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
      </TextField>

      <Box display="flex" gap={2}>
        <Button onClick={() => navigate(-1)}>취소</Button>
        <Button variant="contained" onClick={handleSave}>저장</Button>
      </Box>
    </Box>
  );
}
