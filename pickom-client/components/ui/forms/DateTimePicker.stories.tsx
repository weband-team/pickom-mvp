import type { Meta, StoryObj } from '@storybook/react';
import { DateTimePicker } from './DateTimePicker';
import { Box } from '@mui/material';

const meta: Meta<typeof DateTimePicker> = {
  title: 'UI/DateTimePicker',
  component: DateTimePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: {
        type: 'select',
      },
      options: ['date', 'time', 'datetime'],
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    disablePast: {
      control: 'boolean',
    },
    disableFuture: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DatePicker: Story = {
  args: {
    type: 'date',
    label: 'Select Date',
  },
};

export const TimePicker: Story = {
  args: {
    type: 'time',
    label: 'Select Time',
  },
};

export const DateTimePickerStory: Story = {
  args: {
    type: 'datetime',
    label: 'Select Date & Time',
  },
  name: 'DateTime Picker',
};

export const WithValue: Story = {
  args: {
    type: 'date',
    label: 'Delivery Date',
    value: new Date(),
  },
};

export const WithError: Story = {
  args: {
    type: 'date',
    label: 'Delivery Date',
    error: true,
    helperText: 'Please select a valid date',
  },
};

export const DisablePast: Story = {
  args: {
    type: 'date',
    label: 'Pickup Date',
    disablePast: true,
  },
};

export const DisableFuture: Story = {
  args: {
    type: 'date',
    label: 'Order Date',
    disableFuture: true,
  },
};

export const Disabled: Story = {
  args: {
    type: 'date',
    label: 'Disabled Date',
    disabled: true,
    value: new Date(),
  },
};

export const WithDateRange: Story = {
  args: {
    type: 'date',
    label: 'Available Date',
    minDate: new Date(),
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
};

export const AllTypes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 300 }}>
      <DateTimePicker type="date" label="Pickup Date" />
      <DateTimePicker type="time" label="Pickup Time" />
      <DateTimePicker type="datetime" label="Delivery Date & Time" />
    </Box>
  ),
};

export const DeliveryScheduling: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
      <DateTimePicker
        type="date"
        label="Pickup Date"
        disablePast
        value={new Date()}
      />
      <DateTimePicker
        type="time"
        label="Pickup Time"
        value={new Date()}
      />
      <DateTimePicker
        type="date"
        label="Delivery Date"
        disablePast
        minDate={new Date()}
      />
      <DateTimePicker
        type="time"
        label="Delivery Time"
      />
    </Box>
  ),
};