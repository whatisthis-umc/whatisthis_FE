import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import { adminLogin } from "../../api/auth/admin";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const isFilled = username.trim() !== "" && password.trim() !== "";

  const handleLogin = async () => {
    try {
      const { accessToken } = await adminLogin(username, password);
      // adminLogin 내부에서 토큰 저장을 이미 수행
      localStorage.setItem("adminAccessToken", accessToken);
      navigate("/admin");
    } catch (err) {
      console.error("로그인 실패:", err);
      setError(true);
    }
  };

  return (
    <AdminLayout showSidebar={false}>
      <Box className="min-h-screen flex items-center justify-center bg-white">
        <Box
          className="w-[400px] border border-[#E6E6E6] rounded-[32px] shadow-md bg-white flex flex-col items-center"
          sx={{
            padding: "40px 24px 32px 24px",
          }}
        >
          {/* 입력 영역 */}
          <Box
            className="flex flex-col gap-6"
            sx={{
              width: "352px",
            }}
          >
            {/* 아이디 */}
            <TextField
              label="아이디"
              placeholder="입력"
              variant="standard"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputLabelProps={{
                style: {
                  color: "#333333",
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  letterSpacing: "-1%",
                  lineHeight: "150%",
                },
              }}
              inputProps={{
                style: {
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  letterSpacing: "-1%",
                  lineHeight: "150%",
                  paddingTop: "24px",
                  paddingBottom: "8px",
                },
              }}
              sx={{
                height: "68px",
                "& label.Mui-focused": {
                  color: "#4B4B4B",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "#D9D9D9",
                },
              }}
            />

            {/* 비밀번호 */}
            <TextField
              label="비밀번호"
              placeholder="입력"
              variant="standard"
              fullWidth
              type="password"
              error={error}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{
                style: {
                  color: "#333333",
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  letterSpacing: "-1%",
                  lineHeight: "150%",
                },
              }}
              inputProps={{
                style: {
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  letterSpacing: "-1%",
                  lineHeight: "150%",
                  paddingTop: "24px",
                  paddingBottom: "8px",
                },
              }}
              InputProps={{
                endAdornment: error ? (
                  <InputAdornment position="end">
                    <ErrorOutlineIcon color="error" fontSize="small" />
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                height: "68px",
                "& label.Mui-focused": {
                  color: "#4B4B4B",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: error ? "#FF3B30" : "#D9D9D9",
                },
              }}
            />

            {/* 에러 텍스트 */}
            {error && (
              <FormHelperText
                error
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  letterSpacing: "-1%",
                  marginTop: "4px",
                }}
              >
                아이디와 비밀번호가 틀렸습니다.
              </FormHelperText>
            )}
          </Box>

          {/* 로그인 버튼 */}
          <Button
            onClick={handleLogin}
            variant="contained"
            fullWidth
            disableElevation
            disabled={!isFilled}
            sx={{
              mt: 10,
              width: "352px",
              height: "48px",
              borderRadius: "9999px",
              backgroundColor: isFilled ? "#D9D9D9" : "#E6E6E6",
              color: isFilled ? "#333" : "#9E9E9E",
              fontWeight: 500,
              fontSize: "15px",
              "&:hover": {
                backgroundColor: isFilled ? "#D0D0D0" : "#E6E6E6",
              },
            }}
          >
            로그인
          </Button>
        </Box>
      </Box>
    </AdminLayout>
  );
}
