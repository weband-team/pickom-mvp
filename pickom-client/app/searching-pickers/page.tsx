'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { PickerSearchLoader } from '@/components/picker/PickerSearchLoader';

export default function SearchingPickersPage() {
  const router = useRouter();

  const handleSearchComplete = () => {
    router.push('/picker-results');
  };

  return (
    <>
      <MobileContainer showFrame={false}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            <PickerSearchLoader onSearchComplete={handleSearchComplete} />
          </Box>
      </MobileContainer>
    </>
  );
}
