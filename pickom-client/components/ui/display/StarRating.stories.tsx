import type { Meta, StoryObj } from '@storybook/react';
import { StarRating } from './StarRating';
import { Box } from '@mui/material';

const meta: Meta<typeof StarRating> = {
  title: 'UI/StarRating',
  component: StarRating,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 5,
        step: 0.1,
      },
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['small', 'medium', 'large'],
    },
    readOnly: {
      control: 'boolean',
    },
    showValue: {
      control: 'boolean',
    },
    showLabel: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 0,
    readOnly: false,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 4.2,
    readOnly: true,
  },
};

export const WithValue: Story = {
  args: {
    value: 4.7,
    readOnly: true,
    showValue: true,
  },
};

export const WithLabel: Story = {
  args: {
    value: 3.8,
    readOnly: true,
    showLabel: true,
    label: 'Service Quality',
  },
};

export const WithLabelAndValue: Story = {
  args: {
    value: 4.9,
    readOnly: true,
    showLabel: true,
    showValue: true,
    label: 'Overall Rating',
  },
};

export const Interactive: Story = {
  args: {
    value: 3,
    readOnly: false,
    showLabel: true,
    label: 'Rate this picker',
  },
};

export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <StarRating value={4.5} readOnly size="small" showLabel showValue label="Small" />
      <StarRating value={4.5} readOnly size="medium" showLabel showValue label="Medium" />
      <StarRating value={4.5} readOnly size="large" showLabel showValue label="Large" />
    </Box>
  ),
};

export const RatingLevels: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <StarRating value={5} readOnly showValue label="Excellent" />
      <StarRating value={4} readOnly showValue label="Good" />
      <StarRating value={3} readOnly showValue label="Average" />
      <StarRating value={2} readOnly showValue label="Poor" />
      <StarRating value={1} readOnly showValue label="Very Poor" />
      <StarRating value={0} readOnly showValue label="Not Rated" />
    </Box>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <StarRating value={4.8} readOnly size="small" showValue label="Communication" />
      <StarRating value={4.9} readOnly size="small" showValue label="Reliability" />
      <StarRating value={4.7} readOnly size="small" showValue label="Speed" />
      <StarRating value={4.6} readOnly size="small" showValue label="Care" />
    </Box>
  ),
};