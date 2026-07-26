export interface EmailGateway {
  send(to: string, subject: string, body: string): Promise<void>;
}
