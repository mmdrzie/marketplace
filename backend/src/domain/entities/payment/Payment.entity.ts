export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentGateway = 'zarinpal' | 'internal';

export interface PaymentSnapshot {
  id: number;
  userId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  provider: string | null;
  status: PaymentStatus;
  referenceId: string | null;
  providerId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class Payment {
  private constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly amount: number,
    public currency: string,
    public readonly gateway: PaymentGateway,
    public provider: string | null,
    public status: PaymentStatus,
    public referenceId: string | null,
    public providerId: string | null,
    public description: string | null,
    public metadata: Record<string, unknown> | null,
    public paidAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static fromSnapshot(s: PaymentSnapshot): Payment {
    return new Payment(
      s.id, s.userId, s.amount, s.currency, s.gateway, s.provider, s.status,
      s.referenceId, s.providerId, s.description, s.metadata,
      s.paidAt ? new Date(s.paidAt) : null,
      new Date(s.createdAt), new Date(s.updatedAt),
    );
  }

  snapshot(): PaymentSnapshot {
    return {
      id: this.id, userId: this.userId, amount: this.amount,
      currency: this.currency, gateway: this.gateway, provider: this.provider,
      status: this.status,
      referenceId: this.referenceId, providerId: this.providerId,
      description: this.description, metadata: this.metadata,
      paidAt: this.paidAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  complete(referenceId: string): void {
    if (this.status !== 'pending') throw new Error('Only pending payments can be completed');
    this.status = 'completed';
    this.referenceId = referenceId;
    (this as any).paidAt = new Date();
    this.updatedAt = new Date();
  }

  fail(): void {
    if (this.status !== 'pending') throw new Error('Only pending payments can fail');
    this.status = 'failed';
    this.updatedAt = new Date();
  }

  refund(): void {
    if (this.status !== 'completed') throw new Error('Only completed payments can be refunded');
    this.status = 'refunded';
    this.updatedAt = new Date();
  }
}
