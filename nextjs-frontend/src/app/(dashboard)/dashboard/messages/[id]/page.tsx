'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChatRoom } from '@/components/chat/ChatRoom';

export default function ConversationPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col h-full">
      <ChatRoom conversationId={Number(id)} onBack={() => router.push('/dashboard/messages')} />
    </div>
  );
}
