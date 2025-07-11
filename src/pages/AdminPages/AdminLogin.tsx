import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  FormHelperText,
} from '@mui/material';

import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (username === 'admin' && password === '1234') {
      navigate('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <AdminLayout showSidebar={false}>
      <Box className="min-h-screen flex items-center justify-center bg-gray-50">
        <Box className="bg-white shadow-md rounded-2xl p-10 w-[400px]">
          <TextField
            label="아이디"
            placeholder="입력"
            variant="standard"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-6"
          />

          <TextField
            label="비밀번호"
            placeholder="입력"
            variant="standard"
            fullWidth
            type="password"
            error={error}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-1"
            InputProps={{
              endAdornment: error ? (
                <InputAdornment position="end">
                  <ErrorOutlineIcon color="error" />
                </InputAdornment>
              ) : null,
            }}
          />
          {error && (
            <FormHelperText error>도움말 텍스트</FormHelperText>
          )}

          <Button
            onClick={handleLogin}
            variant="contained"
            fullWidth
            sx={{ mt: 4, backgroundColor: '#ddd', color: '#333' }}
          >
            로그인
          </Button>
        </Box>
      </Box>
    </AdminLayout>
  );
}
