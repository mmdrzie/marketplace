import { conversationRepo } from '../../repositories/conversation';
import { listingRepo } from '../../repositories/listing';
import { permissionService } from '../../services/permission';
import { eventBus, ConversationStarted, MessageSent } from '../events';
import { AppError } from '../../errors';
import type { AuthUser } from '../../middleware/auth';

export class ConversationService {
  async list(user: AuthUser) {
    return conversationRepo.findByUser(user.id);
  }

  async getById(id: number, user: AuthUser) {
    const conversation = await conversationRepo.findById(id);
    if (!conversation) throw AppError.notFound('Conversation not found');
    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      throw AppError.forbidden('You are not a participant in this conversation');
    }

    const messages = await conversationRepo.findMessages(id);
    return { ...conversation, messages };
  }

  async start(input: { listing_id: number; message: string; user: AuthUser }) {
    permissionService.requireCapability('conversation:start', input.user);

    const listing = await listingRepo.findById(input.listing_id);
    if (!listing) throw AppError.notFound('Listing not found');

    if (listing.user_id === input.user.id) {
      throw AppError.validation('You cannot start a conversation with yourself');
    }

    const existing = await conversationRepo.findByListingAndBuyer(input.listing_id, input.user.id);
    if (existing) {
      await conversationRepo.addMessage(existing.id, input.user.id, input.message);
      const messages = await conversationRepo.findMessages(existing.id);
      eventBus.publish(MessageSent, {
        conversationId: String(existing.id),
        senderId: input.user.id,
        body: input.message,
      });
      return { ...existing, messages };
    }

    const conversation = await conversationRepo.create({
      listing_id: input.listing_id,
      buyer_id: input.user.id,
      seller_id: listing.user_id,
    });

    await conversationRepo.addMessage(conversation.id, input.user.id, input.message);
    const messages = await conversationRepo.findMessages(conversation.id);

    eventBus.publish(ConversationStarted, {
      conversationId: String(conversation.id),
      listingId: String(input.listing_id),
      buyerId: input.user.id,
      sellerId: listing.user_id,
    });

    return { ...conversation, messages };
  }

  async sendMessage(input: { conversationId: number; body: string; user: AuthUser }) {
    const conversation = await conversationRepo.findById(input.conversationId);
    if (!conversation) throw AppError.notFound('Conversation not found');
    if (conversation.buyer_id !== input.user.id && conversation.seller_id !== input.user.id) {
      throw AppError.forbidden('You are not a participant in this conversation');
    }

    const message = await conversationRepo.addMessage(input.conversationId, input.user.id, input.body);

    eventBus.publish(MessageSent, {
      conversationId: String(input.conversationId),
      senderId: input.user.id,
      body: input.body,
    });

    return message;
  }

  async markRead(conversationId: number, user: AuthUser) {
    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) throw AppError.notFound('Conversation not found');
    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      throw AppError.forbidden('You are not a participant in this conversation');
    }

    await conversationRepo.markRead(conversationId, user.id);
  }

  async getUnreadCount(user: AuthUser) {
    return conversationRepo.getUnreadCount(user.id);
  }
}

export const conversationService = new ConversationService();
