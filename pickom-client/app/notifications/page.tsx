'use client';

import { Box, Typography, IconButton, Button, CircularProgress, Chip, useTheme } from '@mui/material';
import { ArrowBack, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

export default function NotificationsPage() {
  const router = useRouter();
  const theme = useTheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'offer_received': return '💼';
      case 'offer_accepted': return '✅';
      case 'status_update': return '📦';
      case 'incoming_delivery': return '📥';
      case 'new_delivery': return '🚚';
      default: return '🔔';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
        <MobileContainer showFrame={false}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => router.back()}
                  sx={{ mr: 1, p: 1 }}
                >
                  <ArrowBack />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                  Notifications
                  {unreadCount > 0 && (
                    <Chip
                      label={unreadCount}
                      size="small"
                      color="error"
                      sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                </Typography>
              </Box>

              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  size="small"
                  sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                >
                  Mark All Read
                </Button>
              )}
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                pb: 8,
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="error" variant="body1" sx={{ mb: 1 }}>
                    Loading Error
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {error}
                  </Typography>
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', py: 8 }}>
                  <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    No Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Order notifications will appear here
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2 }}>
                  {notifications.map((notification) => (
                    <Box
                      key={notification.id}
                      onClick={() => {
                        if (!notification.read) markAsRead(notification.id);

                        // Navigate based on notification type
                        if (notification.type === 'offer_received' && notification.related_delivery_id) {
                          router.push(`/orders/${notification.related_delivery_id}/offers`);
                        } else if (notification.type === 'new_delivery' && notification.related_delivery_id) {
                          // For new delivery invitation - picker should see delivery details
                          router.push(`/delivery-details/${notification.related_delivery_id}`);
                        } else if (notification.related_delivery_id) {
                          router.push(`/delivery-details/${notification.related_delivery_id}`);
                        }
                      }}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        backgroundColor: notification.read ? 'action.hover' : 'background.paper',
                        border: 1,
                        borderColor: notification.read ? 'divider' : 'primary.main',
                        opacity: notification.read ? 0.7 : 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: notification.read ? 0 : 2,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '1.5rem' }}>
                          {getTypeIcon(notification.type)}
                        </Typography>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: notification.read ? 500 : 600,
                                color: notification.read ? 'text.secondary' : 'text.primary',
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  bgcolor: 'primary.main',
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{
                              mb: 1,
                              color: notification.read ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {notification.message}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: enUS
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation unreadNotificationsCount={unreadCount} />
      </Box>
    </Box>
  );
}