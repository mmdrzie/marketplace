export interface PhoneVerificationSnapshot {
  id: string;
  userId: string;
  phone: string;
  otpHash: string;
  expiresAt: string;
  verifiedAt: string | null;
  createdAt: string;
}

export class PhoneVerification {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly phone: string,
    public readonly otpHash: string,
    public readonly expiresAt: Date,
    public verifiedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    phone: string;
    otpHash: string;
    expiresAt: Date;
  }): PhoneVerification {
    return new PhoneVerification(
      props.id, props.userId, props.phone, props.otpHash,
      props.expiresAt, null, new Date(),
    );
  }

  static fromSnapshot(s: PhoneVerificationSnapshot): PhoneVerification {
    return new PhoneVerification(
      s.id, s.userId, s.phone, s.otpHash,
      new Date(s.expiresAt),
      s.verifiedAt ? new Date(s.verifiedAt) : null,
      new Date(s.createdAt),
    );
  }

  snapshot(): PhoneVerificationSnapshot {
    return {
      id: this.id,
      userId: this.userId,
      phone: this.phone,
      otpHash: this.otpHash,
      expiresAt: this.expiresAt.toISOString(),
      verifiedAt: this.verifiedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }

  markVerified(): void {
    this.verifiedAt = new Date();
  }

  get isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  get isVerified(): boolean {
    return this.verifiedAt !== null;
  }
}
