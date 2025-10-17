'use client' 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Stack, Typography } from '@mui/material';
import {
    Button,
    TextInput,
    Select,
    MobileContainer,
    PickomLogo
} from '../../components/ui'
import { PackageTypeEnum } from '@/types/package';
import { ReceiverSelector } from '@/components/order/ReceiverSelector';

export default function PackageTypePage(){
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [size, setSize] = useState<'small' | 'medium' | 'large' | ''>('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [otherDescription, setOtherDescription] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [selectedType, setSelectedType] = useState<PackageTypeEnum | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
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

                            <Select
                                label="Package Size"
                                value={size}
                                onChange={(val) => setSize(val as any)}
                                options={[
                                    { value: 'small', label: 'Small (< 5kg)' },
                                    { value: 'medium', label: 'Medium (5-20kg)' },
                                    { value: 'large', label: 'Large (> 20kg)' },
                                ]}
                                placeholder="Select size"
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
                                        alert('Delivery information not found. Please start from the beginning.');
                                        router.push('/delivery-methods');
                                        return;
                                    }

                                    const deliveryMethodData = JSON.parse(existingData);

                                    // Determine delivery type and extract city info
                                    let fromCity: string | undefined = undefined;
                                    let toCity: string | undefined = undefined;
                                    let deliveryType: 'within-city' | 'inter-city' | undefined = undefined;

                                    // Parse fromAddress and toAddress to extract cities
                                    const fromAddressParts = deliveryMethodData.fromAddress.split(',').map((s: string) => s.trim());
                                    const toAddressParts = deliveryMethodData.toAddress.split(',').map((s: string) => s.trim());

                                    if (fromAddressParts.length > 1) {
                                        fromCity = fromAddressParts[fromAddressParts.length - 1];
                                    }
                                    if (toAddressParts.length > 1) {
                                        toCity = toAddressParts[toAddressParts.length - 1];
                                    }

                                    // Determine delivery type
                                    if (fromCity && toCity && fromCity !== toCity) {
                                        deliveryType = 'inter-city';
                                    } else {
                                        deliveryType = 'within-city';
                                    }

                                    const { createDeliveryRequest } = await import('../api/delivery');
                                    const response = await createDeliveryRequest({
                                        title,
                                        description: description || undefined,
                                        fromAddress: deliveryMethodData.fromAddress,
                                        fromCity,
                                        toAddress: deliveryMethodData.toAddress,
                                        toCity,
                                        deliveryType,
                                        price: parseFloat(price),
                                        size: size as 'small' | 'medium' | 'large',
                                        weight: weight ? parseFloat(weight) : undefined,
                                        notes: notes || undefined,
                                        recipientId: recipientId || undefined,
                                        recipientPhone: recipientPhone || undefined,
                                    });

                                    const deliveryId = response.data.id;

                                    // Save delivery ID for searching-pickers and picker-results
                                    const completeDeliveryData = {
                                        ...deliveryMethodData,
                                        deliveryId,
                                        packageType: selectedType,
                                        title,
                                        description: description || undefined,
                                        size,
                                        price: parseFloat(price),
                                        weight: weight ? parseFloat(weight) : undefined,
                                        notes: notes || undefined,
                                        otherDescription: selectedType === PackageTypeEnum.OTHER ? otherDescription : undefined,
                                    };

                                    localStorage.setItem('deliveryData', JSON.stringify(completeDeliveryData));

                                    // Redirect to searching pickers
                                    router.push('/searching-pickers');
                                } catch (error: any) {
                                    console.error('Failed to create delivery:', error);
                                    alert(error.response?.data?.message || 'Failed to create delivery. Please try again.');
                                    setIsSearching(false);
                                }
                            }}
                            disabled={!selectedType || !title || !size || !price || (selectedType === PackageTypeEnum.OTHER && !otherDescription) || isSearching}
                            loading={isSearching}
                            variant={selectedType && title && size && price ? "contained" : "outlined"}
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