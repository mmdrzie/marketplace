import { Slug } from '../value-objects/Slug.js';

export type UserRole = 'user' | 'dealer' | 'agency' | 'store' | 'admin';
export type UserStatus = 'active' | 'banned' | 'suspended';

export interface UserSnapshot {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  publicId: string | null;
  passwordHash: string | null;
  city: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class User {
  private constructor(
    public readonly id: string,
    public email: string,
    public name: string | null,
    public phone: string | null,
    public role: UserRole,
    public status: UserStatus,
    public avatar: string | null,
    public publicId: string | null,
    public passwordHash: string | null,
    public city: string | null,
    public emailVerified: boolean,
    public phoneVerified: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static fromSnapshot(s: UserSnapshot): User {
    return new User(
      s.id, s.email, s.name, s.phone, s.role, s.status,
      s.avatar, s.publicId, s.passwordHash, s.city,
      s.emailVerified, s.phoneVerified,
      new Date(s.createdAt), new Date(s.updatedAt),
      s.deletedAt ? new Date(s.deletedAt) : null,
    );
  }

  snapshot(): UserSnapshot {
    return {
      id: this.id, email: this.email, name: this.name,
      phone: this.phone, role: this.role, status: this.status,
      avatar: this.avatar, publicId: this.publicId,
      passwordHash: this.passwordHash, city: this.city,
      emailVerified: this.emailVerified, phoneVerified: this.phoneVerified,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  verifyPhone(): void {
    this.phoneVerified = true;
    this.updatedAt = new Date();
  }

  ban(): void {
    this.status = 'banned';
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status === 'active' && this.deletedAt === null;
  }

  canPublishListing(): boolean {
    return this.isActive() && this.phoneVerified;
  }
}
