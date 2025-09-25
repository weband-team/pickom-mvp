import type { Meta, StoryObj } from '@storybook/react';
import { UserAvatar } from './UserAvatar';

const meta: Meta<typeof UserAvatar> = {
  title: 'UI/UserAvatar',
  component: UserAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: {
        type: 'select',
      },
      options: ['customer', 'picker'],
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['small', 'medium', 'large'],
    },
    showBadge: {
      control: 'boolean',
    },
    online: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Customer: Story = {
  args: {
    type: 'customer',
    name: 'John Doe',
  },
};

export const Picker: Story = {
  args: {
    type: 'picker',
    name: 'Jane Smith',
  },
};

export const WithImage: Story = {
  args: {
    type: 'customer',
    name: 'John Doe',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  },
};

export const Online: Story = {
  args: {
    type: 'picker',
    name: 'Jane Smith',
    online: true,
  },
};

export const WithBadge: Story = {
  args: {
    type: 'customer',
    name: 'John Doe',
    showBadge: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <UserAvatar type="customer" name="Small" size="small" />
      <UserAvatar type="customer" name="Medium" size="medium" />
      <UserAvatar type="customer" name="Large" size="large" />
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <UserAvatar type="customer" name="Customer" />
      <UserAvatar type="picker" name="Picker" />
    </div>
  ),
};