import type { Meta, StoryObj } from '@storybook/react';
import { LoadingIndicator } from './LoadingIndicator';

const meta: Meta<typeof LoadingIndicator> = {
  title: 'UI/LoadingIndicator',
  component: LoadingIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: {
        type: 'select',
      },
      options: ['circular', 'linear', 'skeleton', 'dots'],
    },
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
      options: ['determinate', 'indeterminate'],
    },
    fullScreen: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Circular: Story = {
  args: {
    type: 'circular',
  },
};

export const CircularWithText: Story = {
  args: {
    type: 'circular',
    text: 'Loading...',
  },
};

export const Linear: Story = {
  args: {
    type: 'linear',
    text: 'Processing...',
  },
};

export const LinearProgress: Story = {
  args: {
    type: 'linear',
    variant: 'determinate',
    value: 65,
    text: '65% Complete',
  },
};

export const Skeleton: Story = {
  args: {
    type: 'skeleton',
    rows: 4,
  },
};

export const Dots: Story = {
  args: {
    type: 'dots',
    text: 'Searching...',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
      <LoadingIndicator type="circular" size="small" />
      <LoadingIndicator type="circular" size="medium" />
      <LoadingIndicator type="circular" size="large" />
    </div>
  ),
};

export const FullScreen: Story = {
  args: {
    type: 'circular',
    text: 'Please wait...',
    fullScreen: true,
  },
  parameters: {
    layout: 'fullscreen',
  },
};