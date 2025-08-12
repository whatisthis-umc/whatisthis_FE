import { Box, Modal, Button } from "@mui/material";

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  message: string;
}

export default function LoginPromptModal({ 
  open, 
  onClose, 
  onLogin, 
  message 
}: LoginPromptModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '686px',
          height: '250px',
          backgroundColor: 'white',
          borderRadius: '32px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          outline: 'none',
          boxShadow: 24,
        }}
      >
        <Box 
          className="text-lg font-medium text-gray-800 text-center"
          sx={{
            fontFamily: 'Pretendard',
            fontSize: '20px',
            fontWeight: 500,
            lineHeight: '150%',
            letterSpacing: '-0.4px',
          }}
        >
          {message}
        </Box>

        <Box sx={{ display: 'flex', gap: '16px' }}>
          <Button
            onClick={onClose}
            sx={{
              backgroundColor: '#E6E6E6',
              color: '#333333',
              px: 4,
              py: 1.5,
              borderRadius: '32px',
              fontSize: '16px',
              fontWeight: 500,
              fontFamily: 'Pretendard',
              minWidth: '120px',
              '&:hover': {
                backgroundColor: '#CCCCCC'
              }
            }}
          >
            취소
          </Button>
          
          <Button
            onClick={onLogin}
            sx={{
              backgroundColor: '#0080FF',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '32px',
              fontSize: '16px',
              fontWeight: 500,
              fontFamily: 'Pretendard',
              minWidth: '120px',
              '&:hover': {
                backgroundColor: '#0066CC'
              }
            }}
          >
            로그인
          </Button>
        </Box>
      </Box>
    </Modal>
  );
} 