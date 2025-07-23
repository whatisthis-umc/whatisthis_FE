import { Box, Modal, Button } from "@mui/material";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

export default function ConfirmModal({ open, onClose, message }: ConfirmModalProps) {
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
          height: '210px',
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
        <Box className="text-lg font-medium text-gray-800">
          {message}
        </Box>
        
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: '#3B82F6',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontSize: '16px',
            fontWeight: 'medium',
            '&:hover': {
              backgroundColor: '#2563EB'
            }
          }}
        >
          확인
        </Button>
      </Box>
    </Modal>
  );
} 