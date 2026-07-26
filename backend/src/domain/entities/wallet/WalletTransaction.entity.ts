export interface WalletTransactionSnapshot {
  id: number;
  userId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: number | null;
  description: string;
  createdAt: string;
}

export class WalletTransaction {
  private constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly type: string,
    public readonly amount: number,
    public readonly balanceBefore: number,
    public readonly balanceAfter: number,
    public readonly referenceType: string | null,
    public readonly referenceId: number | null,
    public readonly description: string,
    public readonly createdAt: Date,
  ) {}

  static fromSnapshot(s: WalletTransactionSnapshot): WalletTransaction {
    return new WalletTransaction(
      s.id, s.userId, s.type, s.amount,
      s.balanceBefore, s.balanceAfter,
      s.referenceType, s.referenceId, s.description,
      new Date(s.createdAt),
    );
  }

  snapshot(): WalletTransactionSnapshot {
    return {
      id: this.id, userId: this.userId, type: this.type,
      amount: this.amount, balanceBefore: this.balanceBefore,
      balanceAfter: this.balanceAfter,
      referenceType: this.referenceType, referenceId: this.referenceId,
      description: this.description, createdAt: this.createdAt.toISOString(),
    };
  }
}
