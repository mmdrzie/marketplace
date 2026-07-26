import { Message } from './Message.entity.js';

export interface MessageCursorResult {
  messages: Message[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface MessageRepository {
  findById(id: number): Promise<Message | null>;
  findByConversation(
    conversationId: number,
    cursor?: number,
    limit?: number,
    before?: boolean,
  ): Promise<MessageCursorResult>;
  addMessage(message: Message): Promise<Message>;
  save(message: Message, expectedVersion: number): Promise<void>;
  markRead(conversationId: number, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  getUnreadCountForConversation(conversationId: number, userId: string): Promise<number>;
}
