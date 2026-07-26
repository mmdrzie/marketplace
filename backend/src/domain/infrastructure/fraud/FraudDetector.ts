export interface FraudResult {
  isSpam: boolean;
  isScam: boolean;
  isAbuse: boolean;
  reason?: string;
}

export interface FraudDetector {
  evaluate(
    message: { body: string; senderId: string },
    conversation: { id: number; buyerId: string; sellerId: string },
  ): Promise<FraudResult>;
}
