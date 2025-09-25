import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const cityOptions = [
  { value: 'moscow', label: 'Moscow' },
  { value: 'spb', label: 'Saint Petersburg' },
  { value: 'kazan', label: 'Kazan' },
  { value: 'novosibirsk', label: 'Novosibirsk' },
  { value: 'ekaterinburg', label: 'Yekaterinburg' },
];

const countryOptions = [
  { value: 'ru', label: 'Russia' },
  { value: 'us', label: 'United States' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'uk', label: 'United Kingdom' },
];

export const Default: Story = {
  args: {
    label: 'Select City',
    options: cityOptions,
    placeholder: 'Choose a city',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Select City',
    options: cityOptions,
    value: 'moscow',
  },
};

export const WithError: Story = {
  args: {
    label: 'Select City',
    options: cityOptions,
    error: true,
    helperText: 'This field is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Select City',
    options: cityOptions,
    disabled: true,
    value: 'moscow',
  },
};

export const WithoutLabel: Story = {
  args: {
    options: cityOptions,
    placeholder: 'Choose a city',
  },
};

export const Countries: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Select country',
  },
};