import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Paper } from '@mui/material';
import {
  Button,
  TextInput,
  UserAvatar,
  LoadingIndicator,
  Select,
  MobileContainer,
  TrustBadge,
  StarRating,
  DateTimePicker,
  PickomLogo,
  PriceSlider,
} from './index';

const meta: Meta = {
  title: 'UI/Overview',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Removed sample messages for now as ChatRoll is not available

export const AllComponents: Story = {
  render: () => (
    <Box sx={{ p: 4, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PickomLogo size="large" />
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            Pickom UI Components
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Material UI-based components with black and white color scheme
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>

          {/* Buttons */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Buttons</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button selected>Within-city</Button>
                <Button>Inter-city</Button>
                <Button>International</Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="outlined">Outlined</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </Box>
            </Box>
          </Paper>

          {/* Form Elements */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Form Elements</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextInput label="From Location" placeholder="Enter pickup location" />
              <Select
                label="Delivery Type"
                options={[
                  { value: 'express', label: 'Express Delivery' },
                  { value: 'standard', label: 'Standard Delivery' },
                  { value: 'economy', label: 'Economy Delivery' },
                ]}
                placeholder="Select delivery type"
              />
              <DateTimePicker type="date" label="Pickup Date" />
            </Box>
          </Paper>

          {/* User Elements */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>User Elements</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <UserAvatar type="customer" name="John Doe" />
                <UserAvatar type="picker" name="Jane Smith" online />
                <UserAvatar type="customer" name="Bob Wilson" showBadge />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <TrustBadge type="verified" verified size="small" />
                <TrustBadge type="phone" verified size="small" />
                <TrustBadge type="rating" verified value={4.8} size="small" />
                <TrustBadge type="delivery" verified value={127} size="small" />
              </Box>
              <StarRating value={4.7} readOnly showValue showLabel label="Overall Rating" />
            </Box>
          </Paper>

          {/* Loading States */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Loading States</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <LoadingIndicator type="circular" size="small" />
                <LoadingIndicator type="dots" text="Searching..." />
              </Box>
              <LoadingIndicator type="linear" />
              <LoadingIndicator type="skeleton" rows={2} />
            </Box>
          </Paper>

          {/* Price Slider */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Price Filter</Typography>
            <PriceSlider
              value={[500, 2500]}
              min={0}
              max={5000}
              step={100}
              range
              label="Price Range"
            />
          </Paper>

          {/* Chat - Coming Soon */}
          <Paper sx={{ p: 3, gridColumn: 'span 2' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Chat Interface</Typography>
            <Typography variant="body2" color="text.secondary">
              Chat component coming soon...
            </Typography>
          </Paper>
        </Box>

        {/* Mobile Container Demo */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Mobile Container</Typography>
          <MobileContainer width={350} height={600}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <PickomLogo size="medium" />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button selected size="small">Within-city</Button>
                <Button size="small">Inter-city</Button>
                <Button size="small">International</Button>
              </Box>

              <TextInput label="From" placeholder="Pickup location" size="small" />
              <TextInput label="To" placeholder="Delivery location" size="small" />

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', my: 1 }}>
                <UserAvatar type="picker" name="Jane" size="small" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>Jane Smith</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <TrustBadge type="verified" verified size="small" showLabel={false} />
                    <TrustBadge type="rating" verified value={4.9} size="small" showLabel={false} />
                  </Box>
                </Box>
              </Box>

              <Button>Find Pickers</Button>
            </Box>
          </MobileContainer>
        </Box>
      </Box>
    </Box>
  ),
};

export const ComponentShowcase: Story = {
  render: () => (
    <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Button</Typography>
        <Button>Click Me</Button>
      </Paper>

      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Text Input</Typography>
        <TextInput placeholder="Type here..." size="small" />
      </Paper>

      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Avatar</Typography>
        <UserAvatar type="picker" name="User" />
      </Paper>

      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Loading</Typography>
        <LoadingIndicator type="circular" size="small" />
      </Paper>

      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Trust Badge</Typography>
        <TrustBadge type="verified" verified size="small" />
      </Paper>

      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Star Rating</Typography>
        <StarRating value={4.5} readOnly size="small" />
      </Paper>

      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Logo</Typography>
        <PickomLogo size="small" />
      </Paper>
    </Box>
  ),
};