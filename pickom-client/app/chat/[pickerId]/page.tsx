import { mockPickers } from '../../../data/mockPickers';
import { ChatPageClient } from './ChatPageClient';

interface ChatPageProps {
  params: Promise<{
    pickerId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { pickerId } = await params;

  // Find the picker by ID (in real app, this would be fetched from API)
  const picker = mockPickers.find(p => p.id === pickerId) || mockPickers[0];

  return <ChatPageClient picker={picker} pickerId={pickerId} />;
}