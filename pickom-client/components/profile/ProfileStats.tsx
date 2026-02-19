import { Box, Typography } from '@mui/material';
import { Star, LocalShipping, ShoppingBag } from '@mui/icons-material';

interface ProfileStatsProps {
  rating: number;
  totalRatings?: number;
  role: 'picker' | 'sender';
  completedDeliveries?: number;
  totalOrders?: number;
}

export function ProfileStats({
  rating,
  totalRatings = 0,
  role,
  completedDeliveries = 0,
  totalOrders = 0
}: ProfileStatsProps) {
  const formatRating = (rating: number | null | undefined): string => {
    if (rating === null || rating === undefined) {
      return '0.0';
    }
    const numRating = Number(rating);
    if (isNaN(numRating)) {
      return '0.0';
    }
    return numRating.toFixed(1);
  };

  const deliveryCount = role === 'picker' ? completedDeliveries : totalOrders;
  const deliveryLabel = role === 'picker' ? 'Deliveries Completed' : 'Orders Placed';
  const DeliveryIcon = role === 'picker' ? LocalShipping : ShoppingBag;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Rating
      </Typography>

      <Box sx={{
        textAlign: 'center',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Star sx={{ fontSize: 40, color: '#FFB800', mr: 1 }} />
          <Typography variant="h3" sx={{
            fontWeight: 'bold',
            color: 'primary.main',
          }}>
            {formatRating(rating)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {totalRatings > 0 ? `Based on ${totalRatings} ${totalRatings === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
        </Typography>
      </Box>

      <Box sx={{
        textAlign: 'center',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <DeliveryIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
          <Typography variant="h3" sx={{
            fontWeight: 'bold',
            color: 'primary.main',
          }}>
            {deliveryCount}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {deliveryLabel}
        </Typography>
      </Box>
    </Box>
  );
}