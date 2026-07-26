export interface MessageSearch {
  index(message: {
    id: number;
    conversationId: number;
    senderId: string;
    body: string;
    type: string;
    createdAt: Date;
  }): Promise<void>;

  search(
    conversationId: number,
    query: string,
    cursor?: string,
    limit?: number,
  ): Promise<{ id: number; body: string; createdAt: Date }[]>;

  delete(messageId: number): Promise<void>;
}
