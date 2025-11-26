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
import { ReceiverSelector } from '@/components/order/ReceiverSelector';

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
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        setImagePreview(null);
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
                                console.log('Clicked Small Parcel');
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
                            console.log('Clicked Large Parcel');
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
                            console.log('Clicked Document');
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
                            console.log('Clicked Other');
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

                            {/* Image Upload Section */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                    Package Photo (optional)
                                </Typography>

                                {!imagePreview ? (
                                    <Box
                                        component="label"
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 3,
                                            border: '2px dashed',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            backgroundColor: 'background.paper',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                borderColor: 'primary.main',
                                            }
                                        }}
                                    >
                                        <Typography fontSize="3rem" sx={{ mb: 1 }}>📷</Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Click to upload package photo
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            Max size: 10MB
                                        </Typography>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={imagePreview}
                                            alt="Package preview"
                                            sx={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: 300,
                                                objectFit: 'contain',
                                                display: 'block',
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                display: 'flex',
                                                gap: 1,
                                            }}
                                        >
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="error"
                                                onClick={handleRemoveImage}
                                                sx={{
                                                    minWidth: 'auto',
                                                    px: 2,
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
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
                                        packageImageUrl: imagePreview || undefined,
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
                                } catch (error) {
                                    console.error('Failed to create delivery:', error);
                                    const toast = (await import('react-hot-toast')).default;
                                    const errorMessage = (error as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Failed to create delivery. Please try again.';
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