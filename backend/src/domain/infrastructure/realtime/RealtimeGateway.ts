export interface RealtimeGateway {
  broadcast(channel: string, event: string, payload: Record<string, unknown>): Promise<void>;
}
