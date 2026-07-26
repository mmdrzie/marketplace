import { User } from './User.entity.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  save(user: User): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}
