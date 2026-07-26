export interface SmsGateway {
  send(phone: string, message: string): Promise<void>;
}
