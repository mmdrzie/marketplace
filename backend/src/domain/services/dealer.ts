import type { UserRepository } from '../entities/user/User.repository.js';
import type { DealerRepository } from '../entities/dealer/Dealer.repository.js';
import { UserRepositoryImpl } from '../infrastructure/user/UserRepository.impl.js';
import { DealerRepositoryImpl } from '../infrastructure/dealer/DealerRepository.impl.js';
import { AppError } from '../../errors.js';
import { permissionService } from '../../services/permission/index.js';
import { businessProfileService } from './businessProfileService.js';
import type { AuthUser } from '../../middleware/auth.js';

export class DealerService {
  private userRepo: UserRepository;
  private dealerRepo: DealerRepository;

  constructor(userRepo?: UserRepository, dealerRepo?: DealerRepository) {
    this.userRepo = userRepo ?? new UserRepositoryImpl();
    this.dealerRepo = dealerRepo ?? new DealerRepositoryImpl();
  }

  async upgrade(input: {
    role: 'dealer' | 'agency' | 'store';
    business_name: string;
    user: AuthUser;
    dealer_code?: string;
    business_address?: string;
    business_description?: string;
  }) {
    const capability = input.role === 'agency'
      ? 'account:upgrade-agency'
      : input.role === 'store'
        ? 'account:upgrade-store'
        : 'account:upgrade-dealer';

    const allowed = permissionService.can(capability, input.user);
    if (!allowed) {
      throw AppError.forbidden('You do not have permission to perform this action');
    }

    const existingUser = await this.userRepo.findById(input.user.id);
    if (!existingUser) throw AppError.notFound('User not found');

    const snapshot = existingUser.snapshot();
    const UserEntity = (await import('../entities/user/User.entity.js')).User;
    const updatedUser = UserEntity.fromSnapshot({ ...snapshot, role: input.role, updatedAt: new Date().toISOString() });
    await this.userRepo.save(updatedUser);

    // dealer/agency → dealer_profiles (status='pending', dealer_code persisted);
    // store keeps the user-row only (store_profiles is created via
    // POST /auth/business-profile or the store registration flow).
    if (input.role !== 'store') {
      const profile = await businessProfileService.upsertDealer(input.user.id, input.role, {
        business_name: input.business_name,
        dealer_code: input.dealer_code,
        business_address: input.business_address,
        description: input.business_description,
      });
      return profile.profile;
    }
    return { role: input.role, businessName: input.business_name, status: 'pending' };
  }

  async myListings(userId: string) {
    const dealer = await this.dealerRepo.findByUserId(userId);
    if (!dealer) {
      throw AppError.forbidden('Access denied');
    }
    return [];
  }

  async stats(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    if (user.role !== 'dealer' && user.role !== 'agency' && user.role !== 'store') {
      throw AppError.forbidden('Access denied');
    }
    return { views: 0, contacts: 0 };
  }

  async subscription(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    // Any authenticated user may view subscription info (buying is open to all).
    return { plan: 'free', expiresAt: null };
  }
}

export const dealerService = new DealerService();
