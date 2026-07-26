import { Conversation } from './Conversation.entity.js';

export interface ConversationRepository {
  findById(id: number): Promise<Conversation | null>;
  findByListingAndBuyer(listingId: number, buyerId: string): Promise<Conversation | null>;
  findByListingAndSellerBuyer(listingId: number, buyerId: string, sellerId: string): Promise<Conversation | null>;
  findConversationsByUser(userId: string): Promise<Conversation[]>;
  save(conversation: Conversation, expectedVersion: number): Promise<void>;
  delete(id: number, expectedVersion: number): Promise<void>;
}
