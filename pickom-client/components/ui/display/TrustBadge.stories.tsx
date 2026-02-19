import type { Meta, StoryObj } from '@storybook/react';
import { TrustBadge } from './TrustBadge';
import { Box } from '@mui/material';

const meta: Meta<typeof TrustBadge> = {
  title: 'UI/TrustBadge',
  component: TrustBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: {
        type: 'select',
      },
      options: ['verified', 'identity', 'phone', 'email', 'payment', 'delivery', 'rating', 'completion'],
    },
    verified: {
      control: 'boolean',
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['small', 'medium'],
    },
    showLabel: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Verified: Story = {
  args: {
    type: 'verified',
    verified: true,
  },
};

export const NotVerified: Story = {
  args: {
    type: 'verified',
    verified: false,
  },
};

export const Identity: Story = {
  args: {
    type: 'identity',
    verified: true,
  },
};

export const Phone: Story = {
  args: {
    type: 'phone',
    verified: true,
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    verified: true,
  },
};

export const Rating: Story = {
  args: {
    type: 'rating',
    verified: true,
    value: 4.8,
  },
};

export const Deliveries: Story = {
  args: {
    type: 'delivery',
    verified: true,
    value: 127,
  },
};

export const CompletionRate: Story = {
  args: {
    type: 'completion',
    verified: true,
    value: 98,
  },
};

export const SmallSize: Story = {
  args: {
    type: 'verified',
    verified: true,
    size: 'small',
  },
};

export const WithoutLabel: Story = {
  args: {
    type: 'verified',
    verified: true,
    showLabel: false,
  },
};

export const AllBadges: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <TrustBadge type="verified" verified={true} />
        <TrustBadge type="identity" verified={true} />
        <TrustBadge type="phone" verified={true} />
        <TrustBadge type="email" verified={true} />
        <TrustBadge type="payment" verified={true} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <TrustBadge type="delivery" verified={true} value={127} />
        <TrustBadge type="rating" verified={true} value={4.8} />
        <TrustBadge type="completion" verified={true} value={98} />
      </Box>
    </Box>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <TrustBadge type="verified" verified={true} size="small" />
      <TrustBadge type="phone" verified={true} size="small" />
      <TrustBadge type="email" verified={true} size="small" />
      <TrustBadge type="rating" verified={true} value={4.9} size="small" />
      <TrustBadge type="delivery" verified={true} value={85} size="small" />
    </Box>
  ),
};