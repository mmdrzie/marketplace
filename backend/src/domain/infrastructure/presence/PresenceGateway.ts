export interface PresenceGateway {
  isOnline(userId: string): boolean;
  lastSeen(userId: string): Date | null;
  setOnline(userId: string): void;
  setOffline(userId: string): void;
  subscribe(conversationId: number, callback: (userId: string, online: boolean) => void): () => void;
}
