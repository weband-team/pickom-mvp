'use client';

import React from 'react';
import { Box, Typography, Button, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    };

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you would send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureError(errorDetails);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            p: 2,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 2,
              maxWidth: 500,
              width: '100%',
              border: '1px solid #ffebee',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '2rem', mr: 2 }}>⚠️</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                Something went wrong
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: '#666', mb: 3, lineHeight: 1.6 }}>
              We&apos;re sorry, but something unexpected happened. Our team has been notified.
            </Typography>

            {process.env.NODE_ENV === 'development' && (
              <Accordion sx={{ mb: 3, bgcolor: '#ffebee', border: '1px solid #ffcdd2' }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ color: '#d32f2f', fontWeight: 500 }}>
                    Error Details (Development)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#b71c1c', mb: 1 }}>
                      Message:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        bgcolor: '#fce4ec',
                        p: 1,
                        borderRadius: 1,
                        color: '#c62828',
                        mb: 2,
                      }}
                    >
                      {this.state.error.message}
                    </Typography>

                    {this.state.error.stack && (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#b71c1c', mb: 1 }}>
                          Stack Trace:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.7rem',
                            bgcolor: '#fce4ec',
                            p: 1,
                            borderRadius: 1,
                            color: '#c62828',
                            overflow: 'auto',
                            maxHeight: '8rem',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {this.state.error.stack}
                        </Box>
                      </>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={this.resetError}
                variant="contained"
                color="primary"
                sx={{
                  flex: 1,
                  fontWeight: 500,
                }}
              >
                Try Again
              </Button>
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                variant="contained"
                sx={{
                  flex: 1,
                  bgcolor: '#616161',
                  '&:hover': { bgcolor: '#424242' },
                  fontWeight: 500,
                }}
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;