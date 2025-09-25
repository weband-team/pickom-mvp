import type { Meta, StoryObj } from '@storybook/react';
import { MobileContainer } from './MobileContainer';
import { Button } from '../base/Button';
import { TextInput } from '../forms/TextInput';
import { Box, Typography } from '@mui/material';

const meta: Meta<typeof MobileContainer> = {
  title: 'UI/MobileContainer',
  component: MobileContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'number',
    },
    height: {
      control: 'number',
    },
    showFrame: {
      control: 'boolean',
    },
    backgroundColor: {
      control: 'color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = () => (
  <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
      Pickom App
    </Typography>

    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Button selected>Within-city</Button>
      <Button>Inter-city</Button>
      <Button>International</Button>
    </Box>

    <TextInput label="From" placeholder="Select pickup location" />
    <TextInput label="To" placeholder="Select delivery location" />
    <TextInput label="Package description" placeholder="What are you sending?" />

    <Button>Find Pickers</Button>

    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Recent Orders</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle2">Package to SPB</Typography>
          <Typography variant="caption" color="text.secondary">In transit</Typography>
        </Box>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle2">Documents to Kazan</Typography>
          <Typography variant="caption" color="text.secondary">Delivered</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);

export const WithFrame: Story = {
  args: {
    children: <SampleContent />,
    showFrame: true,
  },
};

export const WithoutFrame: Story = {
  args: {
    children: <SampleContent />,
    showFrame: false,
  },
  parameters: {
    layout: 'centered',
  },
};

export const iPhone13: Story = {
  args: {
    children: <SampleContent />,
    width: 390,
    height: 844,
    showFrame: true,
  },
};

export const iPhone13Mini: Story = {
  args: {
    children: <SampleContent />,
    width: 375,
    height: 812,
    showFrame: true,
  },
};

export const AndroidLarge: Story = {
  args: {
    children: <SampleContent />,
    width: 412,
    height: 892,
    showFrame: true,
  },
};

export const DarkBackground: Story = {
  args: {
    children: (
      <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', gap: 2, color: 'white' }}>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, color: 'white' }}>
          Dark Mode Pickom
        </Typography>
        <Button>Find Pickers</Button>
      </Box>
    ),
    backgroundColor: '#121212',
    showFrame: true,
  },
};