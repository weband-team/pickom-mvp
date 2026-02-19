'use client';

import { Box, Typography, Avatar, Chip, Stack } from '@mui/material';
import { Email, Phone, VerifiedUser, CalendarToday } from '@mui/icons-material';

export interface SenderCardData {
  uid: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  totalOrders: number;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  memberSince: Date;
  phone?: string;
  email?: string;
  
}

interface SenderCardProps {
  sender: SenderCardData;
  variant?: 'compact' | 'full';
  showContact?: boolean;
}

export default function SenderCard({
  sender,
  variant = 'compact',
  showContact = false
}: SenderCardProps) {
  const isVerified = sender.isPhoneVerified && sender.isEmailVerified;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar
          src={sender.avatarUrl}
          sx={{
            width: variant === 'full' ? 64 : 48,
            height: variant === 'full' ? 64 : 48,
            bgcolor: 'primary.main',
            fontSize: variant === 'full' ? '1.5rem' : '1.2rem'
          }}
        >
          {sender.fullName.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          {/* Name and verification */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography variant={variant === 'full' ? 'h6' : 'subtitle2'} sx={{ fontWeight: 600 }}>
              {sender.fullName}
            </Typography>
            {isVerified && (
              <VerifiedUser sx={{ fontSize: 18, color: 'primary.main' }} />
            )}
          </Box>

          {/* Rating and orders */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ⭐ {sender.rating.toFixed(1)} • {sender.totalOrders} {sender.totalOrders === 1 ? 'order' : 'orders'}
          </Typography>

          {/* Verification badges */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {sender.isPhoneVerified && (
              <Chip
                icon={<Phone sx={{ fontSize: 14 }} />}
                label="Phone"
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}
            {sender.isEmailVerified && (
              <Chip
                icon={<Email sx={{ fontSize: 14 }} />}
                label="Email"
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}
          </Box>

          {/* Member since */}
          {variant === 'full' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Member since {new Date(sender.memberSince).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </Typography>
            </Box>
          )}

          {/* Contact information */}
          {showContact && (variant === 'full') && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Contact Information
              </Typography>
              {sender.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{sender.phone}</Typography>
                </Box>
              )}
              {sender.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{sender.email}</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
