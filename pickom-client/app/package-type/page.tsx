'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Stack, Typography, IconButton, Alert, Card, CardMedia, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import { CloudUpload, Delete, Link as LinkIcon } from '@mui/icons-material';
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
    const [packageImage, setPackageImage] = useState<string>('');
    const [imageError, setImageError] = useState<string>('');
    const [imageUploadMethod, setImageUploadMethod] = useState<'file' | 'url'>('file');
    const [imageUrl, setImageUrl] = useState<string>('');

    // Handle image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            setImageError('Please select an image file');
            return;
        }

        // Check file size (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setImageError('Image size must be less than 10MB');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setPackageImage(base64);
            setImageError('');
        };
        reader.onerror = () => {
            setImageError('Failed to read image');
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setPackageImage('');
        setImageError('');
        setImageUrl('');
    };

    // Handle image URL upload
    const handleImageUrlUpload = async () => {
        if (!imageUrl.trim()) {
            setImageError('Please enter an image URL');
            return;
        }

        setImageError('');

        try {
            // Fetch the image
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error('Failed to load image');
            }

            // Get the blob
            const blob = await response.blob();

            // Check file size (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (blob.size > maxSize) {
                setImageError('Image size must be less than 10MB');
                return;
            }

            // Check if it's an image
            if (!blob.type.startsWith('image/')) {
                setImageError('URL must point to an image file');
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                setPackageImage(base64);
                setImageError('');
            };
            reader.onerror = () => {
                setImageError('Failed to process image');
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            setImageError('Failed to load image from URL. Make sure the URL is valid and accessible.');
        }
    };

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

                    {/* Package Image Upload Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Package Photo (Optional)
                        </Typography>

                        {!packageImage ? (
                            <Box>
                                {/* Tabs for upload method */}
                                <Tabs
                                    value={imageUploadMethod}
                                    onChange={(_, newValue) => {
                                        setImageUploadMethod(newValue);
                                        setImageError('');
                                    }}
                                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                                >
                                    <Tab label="Upload File" value="file" />
                                    <Tab label="From URL" value="url" />
                                </Tabs>

                                {imageUploadMethod === 'file' ? (
                                    <Box>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="package-image-upload"
                                            type="file"
                                            onChange={handleImageUpload}
                                        />
                                        <label htmlFor="package-image-upload">
                                            <Box
                                                sx={{
                                                    border: '2px dashed',
                                                    borderColor: imageError ? 'error.main' : 'divider',
                                                    borderRadius: 2,
                                                    p: 3,
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                        backgroundColor: 'action.hover'
                                                    }
                                                }}
                                            >
                                                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                                <Typography variant="body1" color="text.secondary">
                                                    Click to upload package photo
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Max size: 10MB
                                                </Typography>
                                            </Box>
                                        </label>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Stack direction="row" spacing={1}>
                                            <TextField
                                                fullWidth
                                                placeholder="https://example.com/image.jpg"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                error={!!imageError}
                                                size="small"
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LinkIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <Button
                                                onClick={handleImageUrlUpload}
                                                disabled={!imageUrl.trim()}
                                                sx={{ whiteSpace: 'nowrap' }}
                                            >
                                                Load Image
                                            </Button>
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                            Enter image URL (Max size: 10MB)
                                        </Typography>
                                    </Box>
                                )}

                                {imageError && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {imageError}
                                    </Alert>
                                )}
                            </Box>
                        ) : (
                            <Box>
                                <Card sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        image={packageImage}
                                        alt="Package preview"
                                        sx={{
                                            maxHeight: 300,
                                            objectFit: 'contain',
                                            backgroundColor: 'grey.100'
                                        }}
                                    />
                                    <IconButton
                                        onClick={removeImage}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'background.paper',
                                            '&:hover': {
                                                backgroundColor: 'error.light',
                                                color: 'error.contrastText'
                                            }
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Card>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Image uploaded successfully
                                </Typography>
                            </Box>
                        )}
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

                                    // Use the selected delivery method from deliveryData
                                    let deliveryType: 'within-city' | 'inter-city' | 'international' = deliveryMethodData.selectedMethod || 'within-city';

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
                                        packageImageUrl: packageImage || undefined,
                                    });

                                    const deliveryId = response.data.id;

                                    toast.success('Delivery created successfully!', { id: toastId });

                                    // Save delivery ID for searching-pickers and picker-results
                                    const completeDeliveryData = {
                                        ...deliveryMethodData,
                                        deliveryId,
                                        deliveryType,
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