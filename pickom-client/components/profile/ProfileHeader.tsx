import { Box, Typography } from '@mui/material';
import { UserAvatar } from './UserAvatar';
import { BaseUserData, UserType } from '@/types/auth';

interface ProfileHeaderProps {
  user: BaseUserData;
}

const USER_TYPE_LABELS: Record<UserType, string> = {
  [UserType.SENDER]: 'Sender',
  [UserType.PICKER]: 'Picker'
};

export function ProfileHeader({ user }: ProfileHeaderProps) {

  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <UserAvatar
          name={user.fullName}
          avatarUrl={user.avatarUrl}
          sx={{
            width: 100,
            height: 100,
            fontSize: '2rem',
            mx: 'auto',
            cursor: 'default',
            '&:hover': {
              transform: 'none',
              opacity: 1,
              boxShadow: 'none'
            },
            '&:active': {
              transform: 'none'
            }
          }}
        />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
        {user.fullName}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {USER_TYPE_LABELS[user.userType] || 'User'}
      </Typography>

      {user.isVerified && (
        <Box sx={{
          display: 'inline-flex',
          alignItems: 'center',
          bgcolor: '#e8f5e8',
          color: '#2e7d32',
          px: 2,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.875rem'
        }}>
          ✓ Verified User
        </Box>
      )}
    </Box>
  );
}