import type { Meta, StoryObj } from '@storybook/react';
import { PriceSlider } from './PriceSlider';
import { Box } from '@mui/material';
import { useState } from 'react';

const meta: Meta<typeof PriceSlider> = {
  title: 'UI/PriceSlider',
  component: PriceSlider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showLabels: {
      control: 'boolean',
    },
    showValue: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    range: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: {
    value: 1500,
    min: 0,
    max: 5000,
    step: 100,
    label: 'Maximum Price',
  },
};

export const Range: Story = {
  args: {
    value: [500, 2500],
    min: 0,
    max: 5000,
    step: 100,
    range: true,
    label: 'Price Range',
  },
};

export const WithoutLabels: Story = {
  args: {
    value: 1200,
    min: 0,
    max: 3000,
    showLabels: false,
    label: 'Budget',
  },
};

export const WithoutValue: Story = {
  args: {
    value: 800,
    min: 0,
    max: 2000,
    showValue: false,
    label: 'Price Limit',
  },
};

export const Disabled: Story = {
  args: {
    value: 1000,
    min: 0,
    max: 3000,
    disabled: true,
    label: 'Locked Price',
  },
};

export const DifferentCurrency: Story = {
  args: {
    value: 150,
    min: 0,
    max: 500,
    step: 10,
    currency: '$',
    label: 'Price in USD',
  },
};

export const SmallRange: Story = {
  args: {
    value: [50, 150],
    min: 0,
    max: 200,
    step: 5,
    range: true,
    currency: '$',
    label: 'Local Delivery',
  },
};

const InteractiveComponent = () => {
  const [singleValue, setSingleValue] = useState(1500);
  const [rangeValue, setRangeValue] = useState([500, 2500]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 400 }}>
      <PriceSlider
        value={singleValue}
        onChange={(value) => setSingleValue(value as number)}
        min={0}
        max={5000}
        step={100}
        label="Maximum Budget"
      />
      <PriceSlider
        value={rangeValue}
        onChange={(value) => setRangeValue(value as number[])}
        min={0}
        max={5000}
        step={100}
        range={true}
        label="Price Range"
      />
    </Box>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveComponent />,
};

export const DeliveryPricing: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 350 }}>
      <PriceSlider
        value={[200, 800]}
        min={0}
        max={1500}
        step={50}
        range={true}
        label="Within City"
        currency="₽"
      />
      <PriceSlider
        value={[500, 2000]}
        min={100}
        max={3000}
        step={100}
        range={true}
        label="Inter City"
        currency="₽"
      />
      <PriceSlider
        value={[1000, 5000]}
        min={500}
        max={8000}
        step={250}
        range={true}
        label="International"
        currency="₽"
      />
    </Box>
  ),
};