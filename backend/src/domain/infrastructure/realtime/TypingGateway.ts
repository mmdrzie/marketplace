export interface TypingGateway {
  onTyping(conversationId: number, userId: string): void;
  subscribeTyping(conversationId: number, callback: (userId: string) => void): () => void;
}
