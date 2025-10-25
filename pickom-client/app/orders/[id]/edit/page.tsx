'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import { Button, TextInput, Select } from '@/components/ui';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getDeliveryRequestById, updateDeliveryRequest, type DeliveryRequest } from '@/app/api/delivery';
import { getCurrentUser } from '@/app/api/user';

export default function EditDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const deliveryId = Number(resolvedParams.id);

  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentUserUid, setCurrentUserUid] = useState<string>('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('small');
  const [weight, setWeight] = useState(0);
  const [notes, setNotes] = useState('');

  // Fetch delivery and check permissions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Get current user
        const userResponse = await getCurrentUser();
        setCurrentUserUid(userResponse.user.uid);

        // Get delivery
        const deliveryResponse = await getDeliveryRequestById(deliveryId);
        const deliveryData = deliveryResponse.data;
        setDelivery(deliveryData);

        // Check if user is the sender
        if (deliveryData.senderId !== userResponse.user.uid) {
          setError('You are not authorized to edit this delivery');
          return;
        }

        // Check if delivery is still pending
        if (deliveryData.status !== 'pending') {
          setError('You can only edit pending deliveries');
          return;
        }

        // Populate form fields
        setTitle(deliveryData.title || '');
        setDescription(deliveryData.description || '');
        setFromAddress(deliveryData.fromLocation?.address || '');
        setToAddress(deliveryData.toLocation?.address || '');
        setPrice(deliveryData.price || 0);
        setSize(deliveryData.size || 'small');
        setWeight(deliveryData.weight || 0);
        setNotes(deliveryData.notes || '');
      } catch (err: any) {
        console.error('Failed to fetch delivery:', err);
        setError('Failed to load delivery. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deliveryId]);

  const handleSave = async () => {
    if (!delivery) return;

    setSaving(true);
    setError('');

    try {
      await updateDeliveryRequest(deliveryId, {
        title,
        description,
        fromLocation: fromAddress ? {
          lat: delivery.fromLocation?.lat || 0,
          lng: delivery.fromLocation?.lng || 0,
          address: fromAddress,
          city: delivery.fromLocation?.city
        } : undefined,
        toLocation: toAddress ? {
          lat: delivery.toLocation?.lat || 0,
          lng: delivery.toLocation?.lng || 0,
          address: toAddress,
          city: delivery.toLocation?.city
        } : undefined,
        price,
        size,
        weight,
        notes,
      });

      alert('Delivery updated successfully!');
      router.push(`/orders/${deliveryId}`);
    } catch (err: any) {
      console.error('Failed to update delivery:', err);
      setError('Failed to update delivery. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/orders/${deliveryId}`);
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
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
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 375 }}>
          <MobileContainer showFrame={false}>
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
              <Button
                fullWidth
                onClick={() => router.push('/orders')}
                sx={{ mt: 2 }}
              >
                Back to Orders
              </Button>
            </Box>
          </MobileContainer>
        </Box>
      </Box>
    );
  }

  if (!delivery) {
    return null;
  }

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
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, minHeight: 812 }}>
        <MobileContainer showFrame={false}>
          <Box
            sx={{
              minHeight: '100vh',
              backgroundColor: 'background.default',
              pb: 10,
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
                backgroundColor: 'background.paper',
              }}
            >
              <IconButton onClick={handleCancel} size="small">
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Edit Delivery
              </Typography>
              <IconButton
                onClick={handleSave}
                disabled={saving}
                size="small"
                sx={{ color: 'primary.main' }}
              >
                <Save />
              </IconButton>
            </Box>

            {/* Form */}
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Basic Information
                    </Typography>

                    <Stack spacing={2}>
                      <TextInput
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Package title"
                        fullWidth
                      />

                      <TextInput
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your package"
                        multiline
                        rows={3}
                        fullWidth
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Addresses
                    </Typography>

                    <Stack spacing={2}>
                      <TextInput
                        label="Pickup Address"
                        value={fromAddress}
                        onChange={(e) => setFromAddress(e.target.value)}
                        placeholder="From where?"
                        fullWidth
                      />

                      <TextInput
                        label="Delivery Address"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        placeholder="To where?"
                        fullWidth
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Package Details
                    </Typography>

                    <Stack spacing={2}>
                      <Select
                        label="Package Size"
                        value={size}
                        onChange={(value) => setSize(value as 'small' | 'medium' | 'large')}
                        options={[
                          { value: 'small', label: 'Small' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'large', label: 'Large' },
                        ]}
                        fullWidth
                      />

                      <TextInput
                        label="Weight (kg)"
                        type="number"
                        value={weight.toString()}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        placeholder="0"
                        fullWidth
                      />

                      <TextInput
                        label="Price (zł)"
                        type="number"
                        value={price.toString()}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="0"
                        fullWidth
                      />

                      <TextInput
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes"
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Stack>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}
