import type { Meta, StoryObj } from '@storybook/react';
import { ChatRoll, ChatMessage } from './ChatRoll';

const meta: Meta<typeof ChatRoll> = {
  title: 'UI/ChatRoll',
  component: ChatRoll,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: 'number',
    },
    autoScroll: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessages: ChatMessage[] = [
  {
    id: '1',
    text: 'Hi! I need to send a package from Moscow to Saint Petersburg. Can you help?',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    sender: {
      id: 'customer1',
      name: 'John Doe',
      type: 'customer',
    },
    isOwn: true,
  },
  {
    id: '2',
    text: 'Hello! Yes, I can help you with that. What are the package dimensions and weight?',
    timestamp: new Date(Date.now() - 9 * 60 * 1000),
    sender: {
      id: 'picker1',
      name: 'Jane Smith',
      type: 'picker',
    },
    isOwn: false,
  },
  {
    id: '3',
    text: 'The package is about 30x20x15 cm and weighs around 2kg. It\'s electronics.',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    sender: {
      id: 'customer1',
      name: 'John Doe',
      type: 'customer',
    },
    isOwn: true,
  },
  {
    id: '4',
    text: 'Perfect! I can handle that. I\'m traveling to SPb tomorrow evening. My rate is 500₽ for this delivery.',
    timestamp: new Date(Date.now() - 7 * 60 * 1000),
    sender: {
      id: 'picker1',
      name: 'Jane Smith',
      type: 'picker',
    },
    isOwn: false,
  },
  {
    id: '5',
    text: 'That sounds good! When can we meet for pickup?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    sender: {
      id: 'customer1',
      name: 'John Doe',
      type: 'customer',
    },
    isOwn: true,
  },
  {
    id: '6',
    text: 'I can pick it up tomorrow morning between 10-12 AM. Does that work for you?',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    sender: {
      id: 'picker1',
      name: 'Jane Smith',
      type: 'picker',
    },
    isOwn: false,
  },
];

export const Default: Story = {
  args: {
    messages: sampleMessages,
    height: 400,
  },
};

export const Empty: Story = {
  args: {
    messages: [],
    height: 300,
  },
};

export const Short: Story = {
  args: {
    messages: sampleMessages.slice(0, 2),
    height: 200,
  },
};

export const Tall: Story = {
  args: {
    messages: sampleMessages,
    height: 600,
  },
};

export const NoAutoScroll: Story = {
  args: {
    messages: sampleMessages,
    height: 300,
    autoScroll: false,
  },
};