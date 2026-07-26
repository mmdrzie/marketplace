export interface PushGateway {
  send(userId: string, title: string, body: string, data?: Record<string, unknown>): Promise<void>;
}
