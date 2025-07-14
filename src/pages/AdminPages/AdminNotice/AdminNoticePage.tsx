import { useState } from 'react';
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
} from '@mui/material';
import { dummyPosts3 } from '../../../data/dummyPosts3';
import { adminPostCategories } from '../../../data/categoryList';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';


export default function AdminNoticePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPosts =
    selectedCategory === 'all'
      ? dummyPosts3
      : dummyPosts3.filter((post) => post.category === selectedCategory);

  return (
    <AdminLayout>
    <Box className="px-10 py-6">
    <Box className="text-left mb-6">
      <h2 className="text-2xl font-bold mb-6">공지사항 관리</h2>
      </Box>

      {/* 카테고리 필터 */}
      <Box className="flex justify-between items-center mb-6">
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          size="small"
          sx={{ minWidth: 140, backgroundColor: '#f1f1f1', borderRadius: 3 }}
        >
          {adminPostCategories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
        {/* 검색창 등 추가 가능 */}
      </Box>

      {/* 테이블 */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>구분</TableCell>
            <TableCell>게시글 제목</TableCell>
            <TableCell>신고일</TableCell>
            <TableCell>처리 상태</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <span className="border px-2 py-1 rounded-full text-xs inline-block">
                  {
                    adminPostCategories.find((cat) => cat.id === post.category)?.name ??
                    post.category
                  }
                </span>
              </TableCell>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.date}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ backgroundColor: '#007AFF', borderRadius: '9999px' }}
                >
                  삭제
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
    </AdminLayout>
  );
}
