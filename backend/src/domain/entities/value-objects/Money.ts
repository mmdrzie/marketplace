export class Money {
  private constructor(readonly amount: number) {
    if (!Number.isFinite(amount)) throw new Error('Money must be a finite number');
    if (amount < 0) throw new Error('Money cannot be negative');
  }

  static fromToman(amount: number): Money {
    return new Money(Math.round(amount));
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toJSON(): number {
    return this.amount;
  }
}
