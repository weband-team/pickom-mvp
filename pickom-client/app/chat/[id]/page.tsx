import { ChatPageClient } from './ChatPageClient';

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return [{ id: "1" }];
}


export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  return <ChatPageClient chatId={id} />;
}
