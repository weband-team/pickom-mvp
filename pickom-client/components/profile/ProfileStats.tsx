import { Box, Typography } from '@mui/material';

interface ProfileStatsProps {
  senderRating: number;
  pickerRating: number;
}

export function ProfileStats({ senderRating, pickerRating }: ProfileStatsProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ratings
      </Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{
          flex: 1,
          textAlign: 'center',
          p: 2,
          bgcolor: '#f8f9fa',
          borderRadius: 2
        }}>
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            color: '#1976d2',
            mb: 1
          }}>
            {senderRating.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            As Sender
          </Typography>
        </Box>

        <Box sx={{
          flex: 1,
          textAlign: 'center',
          p: 2,
          bgcolor: '#f8f9fa',
          borderRadius: 2
        }}>
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            color: '#1976d2',
            mb: 1
          }}>
            {pickerRating.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            As Picker
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}