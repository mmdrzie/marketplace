export type RegistrationOtpType = 'email' | 'phone';

export interface RegistrationOtpSnapshot {
  id: string;
  identifier: string;
  type: RegistrationOtpType;
  otpHash: string;
  expiresAt: string;
  verifiedAt: string | null;
  createdAt: string;
}

export class RegistrationOtp {
  private constructor(
    public readonly id: string,
    public readonly identifier: string,
    public readonly type: RegistrationOtpType,
    public readonly otpHash: string,
    public readonly expiresAt: Date,
    public verifiedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    identifier: string;
    type: RegistrationOtpType;
    otpHash: string;
    expiresAt: Date;
  }): RegistrationOtp {
    return new RegistrationOtp(
      props.id, props.identifier, props.type, props.otpHash,
      props.expiresAt, null, new Date(),
    );
  }

  static fromSnapshot(s: RegistrationOtpSnapshot): RegistrationOtp {
    return new RegistrationOtp(
      s.id, s.identifier, s.type, s.otpHash,
      new Date(s.expiresAt),
      s.verifiedAt ? new Date(s.verifiedAt) : null,
      new Date(s.createdAt),
    );
  }

  snapshot(): RegistrationOtpSnapshot {
    return {
      id: this.id,
      identifier: this.identifier,
      type: this.type,
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
