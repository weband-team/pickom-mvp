import { Box, Typography } from '@mui/material';
import { PickomLogo, Button, MobileContainer } from './components/ui';
import Link from 'next/link';

export default function HomePage() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                p: 2,
            }}
        >
            <MobileContainer showFrame={false}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        p: 4,
                        minHeight: '100vh',
                    }}
                >
                    <PickomLogo size="large" />
                    <Typography
                        variant="h6"
                        sx={{
                            mt: 2,
                            mb: 1,
                            color: '#666666',
                            fontWeight: 400,
                        }}
                    >
                        People-Powered Delivery
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 4,
                            color: '#999999',
                            maxWidth: 280,
                        }}
                    >
                        Connect with trusted travelers to send your packages safely and affordably
                    </Typography>
                    <Link href="/delivery-methods" passHref>
                        <Button size="large" fullWidth>
                            Choose Delivery Method
                        </Button>
                    </Link>
                </Box>
            </MobileContainer>
        </Box>
    );
} 