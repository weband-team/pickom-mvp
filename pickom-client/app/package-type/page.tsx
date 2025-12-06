'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Stack, Typography } from '@mui/material';
import {
    Button,
    TextInput,
    MobileContainer,
    PickomLogo
} from '../../components/ui';
import { PackageTypeEnum } from '@/types/package';
import { ReceiverSelector } from '@/components/order/ReceiverSelector';
import { AxiosError } from 'axios';

export default function PackageTypePage(){
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [otherDescription, setOtherDescription] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [selectedType, setSelectedType] = useState<PackageTypeEnum | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Map package type to size
    const getSizeFromType = (): 'small' | 'medium' | 'large' => {
        if (selectedType === PackageTypeEnum.DOCUMENT || selectedType === PackageTypeEnum.SMALL_PARCEL) {
            return 'small';
        }
        if (selectedType === PackageTypeEnum.LARGE_PARCEL) {
            return 'large';
        }
        return 'medium'; // OTHER
    };
    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
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
                                setSelectedType(PackageTypeEnum.SMALL_PARCEL);
                            }}
                            sx={{
                                p: 3,
                                border: selectedType === PackageTypeEnum.SMALL_PARCEL ? '3px solid' : '2px solid',
                                borderColor: selectedType === PackageTypeEnum.SMALL_PARCEL ? 'primary.main' : 'divider',
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: selectedType === PackageTypeEnum.SMALL_PARCEL ? 'action.selected' : 'background.paper',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }}>
                            <Stack direction='row' alignItems="center" spacing={2}>
                                <Typography fontSize="2rem">📦</Typography>
                                <Box>
                                    <Typography variant='h6' sx={{
                                        color: selectedType === PackageTypeEnum.SMALL_PARCEL ? 'primary.main' : 'text.primary',
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
                            setSelectedType(PackageTypeEnum.LARGE_PARCEL);
                        }}
                            sx={{
                                p: 3,
                                border: selectedType === PackageTypeEnum.LARGE_PARCEL ? '3px solid' : '2px solid',
                                borderColor: selectedType === PackageTypeEnum.LARGE_PARCEL ? 'primary.main' : 'divider',
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: selectedType === PackageTypeEnum.LARGE_PARCEL ? 'action.selected' : 'background.paper',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }}>
                            <Stack direction='row' alignItems="center" spacing={2}>
                                <Typography fontSize="2rem">📫</Typography>
                                <Box>
                                    <Typography variant='h6' sx={{
                                        color: selectedType === PackageTypeEnum.LARGE_PARCEL ? 'primary.main' : 'text.primary',
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
                            setSelectedType(PackageTypeEnum.DOCUMENT);
                        }}
                            sx={{
                                p: 3,
                                border: selectedType === PackageTypeEnum.DOCUMENT ? '3px solid' : '2px solid',
                                borderColor: selectedType === PackageTypeEnum.DOCUMENT ? 'primary.main' : 'divider',
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: selectedType === PackageTypeEnum.DOCUMENT ? 'action.selected' : 'background.paper',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }}>
                            <Stack direction='row' alignItems="center" spacing={2}>
                                <Typography fontSize="2rem">📄</Typography>
                                <Box>
                                    <Typography variant='h6' sx={{
                                        color: selectedType === PackageTypeEnum.DOCUMENT ? 'primary.main' : 'text.primary',
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
                            setSelectedType(PackageTypeEnum.OTHER);
                        }}
                            sx={{
                                p: 3,
                                border: selectedType === PackageTypeEnum.OTHER ? '3px solid' : '2px solid',
                                borderColor: selectedType === PackageTypeEnum.OTHER ? 'primary.main' : 'divider',
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: selectedType === PackageTypeEnum.OTHER ? 'action.selected' : 'background.paper',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }}>
                            <Stack direction='row' alignItems="center" spacing={2}>
                                <Typography fontSize="2rem">❓</Typography>
                                <Box>
                                    <Typography variant='h6' sx={{
                                        color: selectedType === PackageTypeEnum.OTHER ? 'primary.main' : 'text.primary',
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

                    {/* Package Details Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Package Details
                        </Typography>
                        <Stack spacing={2}>
                            <TextInput
                                label="What are you sending?"
                                value={title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                placeholder="e.g., Documents, Flowers, Phone"
                                required
                                fullWidth
                            />

                            <TextInput
                                label="Description (optional)"
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                                multiline
                                rows={2}
                                placeholder="Additional details about the package"
                                fullWidth
                            />

                            <TextInput
                                label="Price (zł)"
                                type="number"
                                value={price}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                                required
                                fullWidth
                            />

                            <TextInput
                                label="Weight (kg) - optional"
                                type="number"
                                value={weight}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
                                fullWidth
                            />
                        </Stack>
                    </Box>

                    {/* Comments Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Special Instructions (Optional)
                        </Typography>
                        <TextInput
                            multiline
                            rows={3}
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                            fullWidth
                            placeholder="e.g., Call before delivery, Fragile"
                        />
                    </Box>

                    {/* Other Description - show only if OTHER is selected */}
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

                    {/* Receiver Section */}
                    <ReceiverSelector
                        recipientId={recipientId}
                        recipientPhone={recipientPhone}
                        onRecipientIdChange={setRecipientId}
                        onRecipientPhoneChange={setRecipientPhone}
                    />

                    {/* Navigation buttons */}
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                        <Button variant="outlined" onClick={() => router.back()}>
                            Back
                        </Button>
                        <Button
                            onClick={async () => {
                                setIsSearching(true);

                                try {
                                    // Load existing delivery data from localStorage
                                    const existingData = localStorage.getItem('deliveryData');
                                    if (!existingData) {
                                        const toast = (await import('react-hot-toast')).default;
                                        toast.error('Delivery information not found. Please start from the beginning.');
                                        router.push('/delivery-methods');
                                        return;
                                    }

                                    const deliveryMethodData = JSON.parse(existingData);

                                    // Check if we have location data
                                    if (!deliveryMethodData.fromLocation || !deliveryMethodData.toLocation) {
                                        const toast = (await import('react-hot-toast')).default;
                                        toast.error('Location information not found. Please start from the beginning.');
                                        router.push('/delivery-methods');
                                        return;
                                    }

                                    // Determine delivery type based on cities
                                    let deliveryType: 'within-city' | 'inter-city' | undefined = 'within-city';
                                    const fromCity = deliveryMethodData.fromLocation.city;
                                    const toCity = deliveryMethodData.toLocation.city;

                                    if (fromCity && toCity && fromCity !== toCity) {
                                        deliveryType = 'inter-city';
                                    }

                                    // Create delivery request
                                    const { createDeliveryRequest } = await import('../api/delivery');
                                    const toast = (await import('react-hot-toast')).default;

                                    const toastId = toast.loading('Creating delivery...');

                                    const response = await createDeliveryRequest({
                                        title,
                                        description: description || undefined,
                                        fromLocation: deliveryMethodData.fromLocation,
                                        toLocation: deliveryMethodData.toLocation,
                                        deliveryType,
                                        price: parseFloat(price),
                                        size: getSizeFromType(),
                                        weight: weight ? parseFloat(weight) : undefined,
                                        notes: notes || undefined,
                                        recipientEmail: recipientId || undefined,
                                        recipientPhone: recipientPhone || undefined,
                                    });

                                    const deliveryId = response.data.id;

                                    toast.success('Delivery created successfully!', { id: toastId });

                                    // Save delivery ID for searching-pickers and picker-results
                                    const completeDeliveryData = {
                                        ...deliveryMethodData,
                                        deliveryId,
                                        packageType: selectedType,
                                        title,
                                        description: description || undefined,
                                        size: getSizeFromType(),
                                        price: parseFloat(price),
                                        weight: weight ? parseFloat(weight) : undefined,
                                        notes: notes || undefined,
                                        otherDescription: selectedType === PackageTypeEnum.OTHER ? otherDescription : undefined,
                                        recipientEmail: recipientId || undefined,
                                        recipientPhone: recipientPhone || undefined,
                                    };

                                    localStorage.setItem('deliveryData', JSON.stringify(completeDeliveryData));

                                    // Redirect to searching pickers
                                    router.push('/searching-pickers');
                                } catch (err) {
                                    const toast = (await import('react-hot-toast')).default;
                                    const error = err as AxiosError<{ message?: string }>;
                                    const errorMessage = error.response?.data?.message || 'Failed to create delivery. Please try again.';
                                    toast.error(errorMessage);
                                    setIsSearching(false);
                                }
                            }}
                            disabled={!selectedType || !title || !price || (selectedType === PackageTypeEnum.OTHER && !otherDescription) || isSearching}
                            loading={isSearching}
                            variant={selectedType && title && price ? "contained" : "outlined"}
                            sx={{
                                '&.Mui-disabled': {
                                    backgroundColor: 'action.disabled',
                                    color: 'text.disabled',
                                    borderColor: 'divider'
                                }
                            }}
                        >
                            Create Order & Find Pickers
                        </Button>
                    </Stack>
                </Box>
            </MobileContainer>








        </Box>


    )
}