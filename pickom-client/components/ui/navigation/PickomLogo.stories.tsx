import type { Meta, StoryObj } from '@storybook/react';
import { PickomLogo } from './PickomLogo';
import { Box } from '@mui/material';

const meta: Meta<typeof PickomLogo> = {
  title: 'UI/PickomLogo',
  component: PickomLogo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: {
        type: 'select',
      },
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: {
        type: 'select',
      },
      options: ['icon', 'text', 'full'],
    },
    color: {
      control: {
        type: 'select',
      },
      options: ['black', 'white'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: {
    variant: 'full',
    size: 'medium',
    color: 'black',
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'icon',
    size: 'medium',
    color: 'black',
  },
};

export const TextOnly: Story = {
  args: {
    variant: 'text',
    size: 'medium',
    color: 'black',
  },
};

export const White: Story = {
  args: {
    variant: 'full',
    size: 'medium',
    color: 'white',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
      <PickomLogo variant="full" size="small" />
      <PickomLogo variant="full" size="medium" />
      <PickomLogo variant="full" size="large" />
    </Box>
  ),
};

export const Variants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <PickomLogo variant="icon" size="medium" />
      <PickomLogo variant="text" size="medium" />
      <PickomLogo variant="full" size="medium" />
    </Box>
  ),
};

export const Navigation: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
        minWidth: 300,
      }}
    >
      <PickomLogo variant="full" size="small" />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <span>Home</span>
        <span>Orders</span>
        <span>Profile</span>
      </Box>
    </Box>
  ),
};

export const AppHeader: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        backgroundColor: '#000000',
        borderRadius: 1,
        minWidth: 300,
      }}
    >
      <PickomLogo variant="full" size="large" color="white" />
    </Box>
  ),
};