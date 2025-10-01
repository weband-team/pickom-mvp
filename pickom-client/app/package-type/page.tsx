'use client' 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Stack, Typography } from '@mui/material';
import {
    Button,
    TextInput,
    MobileContainer,
    PickomLogo
} from '../../components/ui'
import { PackageTypeEnum } from '@/types/package';

export default function PackageTypePage(){
    const router = useRouter();
    const [notes, setNotes] = useState('');
    const [otherDescription, setOtherDescription] = useState('')
    const [selectedType, setSelectedType] = useState<PackageTypeEnum | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    return (
        <Box sx={{
            minHeight: '100vh', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            p: 2,
        }}>
            <MobileContainer showFrame={false}>
                <Box sx={{ p: 3, pb: 6 }}>
                    
                    <Box sx={{textAlign: 'center', mb: 4}}> 
                        <PickomLogo size='medium'/>
                        <Typography variant='h4' sx={{mt: 2, mb: 1}}>Select Package Type</Typography>
                    </Box>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        <Box
                            onClick={() => {
                                console.log('Clicked Small Parcel');
                                setSelectedType(PackageTypeEnum.SMALL_PARCEL);
                            }}
                            sx={{
                                p: 3,
                                border: selectedType === PackageTypeEnum.SMALL_PARCEL ? '3px solid #1976d2' : '2px solid #e0e0e0',
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: selectedType === PackageTypeEnum.SMALL_PARCEL ? '#e3f2fd' : '#ffffff',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: selectedType === PackageTypeEnum.SMALL_PARCEL ? '#bbdefb' : '#f5f5f5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }}>
                            <Stack direction='row' alignItems="center" spacing={2}>
                                <Typography fontSize="2rem">📦</Typography>
                                <Box>
                                    <Typography variant='h6' sx={{
                                        color: selectedType === PackageTypeEnum.SMALL_PARCEL ? '#1976d2' : 'inherit',
                                        fontWeight: selectedType === PackageTypeEnum.SMALL_PARCEL ? 'bold' : 'normal'
                                    }}>
                                        Small Parcel
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Documents, small items up to 2kg
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Box onClick={() => {
                            console.log('Clicked Large Parcel');
                            setSelectedType(PackageTypeEnum.LARGE_PARCEL);
                        }}
                            sx={{
                                p: 3,
                                border: selectedType === PackageTypeEnum.LARGE_PARCEL ? '3px solid #1976d2' : '2px solid #e0e0e0',
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: selectedType === PackageTypeEnum.LARGE_PARCEL ? '#e3f2fd' : '#ffffff',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: selectedType === PackageTypeEnum.LARGE_PARCEL ? '#bbdefb' : '#f5f5f5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }}>
                            <Stack direction='row' alignItems="center" spacing={2}>
                                <Typography fontSize="2rem">📫</Typography>
                                <Box>
                                    <Typography variant='h6' sx={{
                                        color: selectedType === PackageTypeEnum.LARGE_PARCEL ? '#1976d2' : 'inherit',
                                        fontWeight: selectedType === PackageTypeEnum.LARGE_PARCEL ? 'bold' : 'normal'
                                    }}>
                                        Large Parcel
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Furniture, large packages over 2kg
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                        <Box onClick={() => {
                            console.log('Clicked Document');
                            setSelectedType(PackageTypeEnum.DOCUMENT);
                        }}
                            sx={{
                                p: 3,
                                border: selectedType === PackageTypeEnum.DOCUMENT ? '3px solid #1976d2' : '2px solid #e0e0e0',
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: selectedType === PackageTypeEnum.DOCUMENT ? '#e3f2fd' : '#ffffff',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: selectedType === PackageTypeEnum.DOCUMENT ? '#bbdefb' : '#f5f5f5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }}>
                            <Stack direction='row' alignItems="center" spacing={2}>
                                <Typography fontSize="2rem">📄</Typography>
                                <Box>
                                    <Typography variant='h6' sx={{
                                        color: selectedType === PackageTypeEnum.DOCUMENT ? '#1976d2' : 'inherit',
                                        fontWeight: selectedType === PackageTypeEnum.DOCUMENT ? 'bold' : 'normal'
                                    }}>
                                        Document
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Papers, contracts, certificates
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                        <Box onClick={() => {
                            console.log('Clicked Other');
                            setSelectedType(PackageTypeEnum.OTHER);
                        }}
                            sx={{
                                p: 3,
                                border: selectedType === PackageTypeEnum.OTHER ? '3px solid #1976d2' : '2px solid #e0e0e0',
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: selectedType === PackageTypeEnum.OTHER ? '#e3f2fd' : '#ffffff',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: selectedType === PackageTypeEnum.OTHER ? '#bbdefb' : '#f5f5f5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }}>
                            <Stack direction='row' alignItems="center" spacing={2}>
                                <Typography fontSize="2rem">❓</Typography>
                                <Box>
                                    <Typography variant='h6' sx={{
                                        color: selectedType === PackageTypeEnum.OTHER ? '#1976d2' : 'inherit',
                                        fontWeight: selectedType === PackageTypeEnum.OTHER ? 'bold' : 'normal'
                                    }}>
                                        Other
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tell us what you&apos;re sending
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Comments Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Additional Comments (Optional)
                        </Typography>
                        <TextInput
                            multiline
                            rows={3}
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                            fullWidth
                            placeholder="Any special instructions, fragile items, etc..."
                        />
                    </Box>

                    {/* Other Description - показать только если выбран OTHER */}
                    {selectedType === PackageTypeEnum.OTHER && (
                        <Box sx={{ mb: 3 }}>
                            <TextInput
                                label="Please describe what you're sending"
                                value={otherDescription}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtherDescription(e.target.value)}
                                fullWidth
                                required
                            />
                        </Box>
                    )}

                    {/* Navigation buttons */}
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                        <Button variant="outlined" onClick={() => router.back()}>
                            Back
                        </Button>
                        <Button
                            onClick={async () => {
                                setIsSearching(true);
                                await new Promise(resolve => setTimeout(resolve, 300));
                                router.push('/searching-pickers');
                            }}
                            disabled={!selectedType || isSearching}
                            loading={isSearching}
                            variant={selectedType ? "contained" : "outlined"}
                            sx={{
                                backgroundColor: selectedType ? '#1976d2' : 'transparent',
                                color: selectedType ? '#ffffff' : '#1976d2',
                                '&:hover': {
                                    backgroundColor: selectedType ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
                                },
                                '&:disabled': {
                                    backgroundColor: 'transparent',
                                    color: 'rgba(0, 0, 0, 0.26)',
                                    border: '1px solid rgba(0, 0, 0, 0.12)'
                                }
                            }}
                        >
                            Find Pickers
                        </Button>
                    </Stack>
                </Box>
            </MobileContainer>








        </Box>


    )
}