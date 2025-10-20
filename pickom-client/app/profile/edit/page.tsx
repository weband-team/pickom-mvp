'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  CardContent,
  Autocomplete,
} from '@mui/material';
import { ArrowBack, PhotoCamera, Save, LocationOn } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { handleMe } from '@/app/api/auth';
import { updateUser } from '@/app/api/user';
import dynamic from 'next/dynamic';

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
});

interface EditFormData {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  about: string;
  locationLat: string;
  locationLng: string;
  locationPlaceId: string;
  address: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [userUid, setUserUid] = useState<string>('');

  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    phone: '',
    email: '',
    avatarUrl: '',
    about: '',
    locationLat: '',
    locationLng: '',
    locationPlaceId: '',
    address: '',
  });

  const [phoneError, setPhoneError] = useState<string>('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [loadingAddressSuggestions, setLoadingAddressSuggestions] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await handleMe();
        const user = response.data.user;
        setUserUid(user.uid);
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || '',
          about: user.about || '',
          locationLat: user.location?.lat?.toString() || '',
          locationLng: user.location?.lng?.toString() || '',
          locationPlaceId: user.location?.placeId || '',
          address: (user.location as any)?.address || '',
        });
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load profile. Please login again.');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Validate and format phone number
  const validatePhoneNumber = (phone: string): { isValid: boolean; formatted: string; error?: string } => {
    const cleaned = phone.replace(/\s+/g, '').replace(/[()-]/g, '');

    // If already has +, just validate length
    if (cleaned.startsWith('+')) {
      if (cleaned.length >= 10 && cleaned.length <= 15) {
        return { isValid: true, formatted: cleaned };
      }
      return { isValid: false, formatted: cleaned, error: 'Phone number should be 10-15 digits' };
    }

    // Auto-add + if it's just digits
    if (/^\d+$/.test(cleaned)) {
      if (cleaned.length >= 9 && cleaned.length <= 14) {
        return { isValid: true, formatted: '+' + cleaned };
      }
      return { isValid: false, formatted: cleaned, error: 'Phone number should be 9-14 digits' };
    }

    return { isValid: false, formatted: cleaned, error: 'Phone number can only contain digits' };
  };

  const handleInputChange = (field: keyof EditFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;

    // Special handling for phone field - validate in real-time
    if (field === 'phone') {
      setFormData({
        ...formData,
        [field]: value,
      });

      // Real-time validation for phone
      if (value.trim()) {
        const validation = validatePhoneNumber(value);
        if (!validation.isValid) {
          setPhoneError(validation.error || 'Invalid phone format');
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }

    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setFormData({
      ...formData,
      locationLat: lat.toString(),
      locationLng: lng.toString(),
      address: address || formData.address, // Keep existing address if no new address provided
    });
    setError('');
    setSuccess('');
  };

  // Search for address suggestions using Nominatim
  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setLoadingAddressSuggestions(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&accept-language=en`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );

      const data = await response.json();
      setAddressSuggestions(data);
    } catch (error) {
      console.error('Address search error:', error);
      setAddressSuggestions([]);
    } finally {
      setLoadingAddressSuggestions(false);
    }
  };

  // Debounce address search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address) {
        searchAddress(formData.address);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.address]);

  // Handle address selection from autocomplete
  const handleAddressSelect = (suggestion: any) => {
    if (!suggestion) return;

    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const address = suggestion.display_name;

    setFormData({
      ...formData,
      address: address,
      locationLat: lat.toString(),
      locationLng: lng.toString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone is required');
      return;
    }

    // Validate and format phone number
    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Invalid phone number format');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare location object
      const location = formData.locationLat && formData.locationLng ? {
        lat: parseFloat(formData.locationLat),
        lng: parseFloat(formData.locationLng),
        placeId: formData.locationPlaceId || undefined,
        address: formData.address || undefined,
      } : undefined;

      await updateUser(userUid, {
        name: formData.name,
        phone: phoneValidation.formatted, // Use formatted phone
        // Email is not sent - it cannot be changed
        avatarUrl: formData.avatarUrl || undefined,
        about: formData.about || undefined,
        location,
      });

      setSuccess('Profile updated successfully!');

      // Redirect back to profile page after 1.5 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
        <MobileContainer showFrame={false}>
          <Box sx={{ p: 3, pb: 10, backgroundColor: 'background.default', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconButton
                onClick={handleBackClick}
                sx={{
                  p: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Edit Profile
              </Typography>
              <ThemeToggle />
            </Box>

            {/* Avatar Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={formData.avatarUrl}
                  alt={formData.name}
                  sx={{
                    width: 100,
                    height: 100,
                    border: '4px solid',
                    borderColor: 'background.paper',
                    boxShadow: 2,
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Edit Form */}
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      label="Full Name"
                      variant="outlined"
                      fullWidth
                      required
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      disabled={saving}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                        }
                      }}
                    />

                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      fullWidth
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      disabled={saving}
                      placeholder="+48123456789"
                      error={!!phoneError}
                      helperText={phoneError || "Use international format starting with + (e.g., +48123456789)"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                        }
                      }}
                    />

                    <TextField
                      label="Email"
                      variant="outlined"
                      fullWidth
                      required
                      type="email"
                      value={formData.email}
                      disabled={true}
                      helperText="Email cannot be changed for security reasons"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.disabledBackground',
                        }
                      }}
                    />

                    <TextField
                      label="Avatar URL"
                      variant="outlined"
                      fullWidth
                      value={formData.avatarUrl}
                      onChange={handleInputChange('avatarUrl')}
                      disabled={saving}
                      placeholder="https://example.com/avatar.jpg"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                        }
                      }}
                    />

                    <TextField
                      label="About"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      value={formData.about}
                      onChange={handleInputChange('about')}
                      disabled={saving}
                      placeholder="Tell us about yourself..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                        }
                      }}
                    />

                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Your Location
                      </Typography>

                      <Autocomplete
                        freeSolo
                        options={addressSuggestions}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.display_name}
                        inputValue={formData.address}
                        onInputChange={(_, newValue) => {
                          setFormData({
                            ...formData,
                            address: newValue,
                          });
                        }}
                        onChange={(_, newValue) => {
                          if (typeof newValue !== 'string' && newValue) {
                            handleAddressSelect(newValue);
                          }
                        }}
                        loading={loadingAddressSuggestions}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Address"
                            placeholder="Type to search address..."
                            size="small"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: <LocationOn sx={{ color: 'primary.main', mr: 1 }} />,
                              endAdornment: (
                                <>
                                  {loadingAddressSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'background.paper',
                              },
                              mb: 2,
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} key={option.lat + option.lon}>
                            <Typography variant="body2">{option.display_name}</Typography>
                          </Box>
                        )}
                      />

                      <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        initialPosition={
                          formData.locationLat && formData.locationLng
                            ? { lat: parseFloat(formData.locationLat), lng: parseFloat(formData.locationLng) }
                            : undefined
                        }
                      />
                    </Box>

                    {/* Save Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                      disabled={saving}
                      sx={{
                        py: 1.5,
                        mt: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 500,
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}
