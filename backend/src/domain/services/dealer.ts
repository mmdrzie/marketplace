import type { UserRepository } from '../entities/user/User.repository.js';
import type { DealerRepository } from '../entities/dealer/Dealer.repository.js';
import { UserRepositoryImpl } from '../infrastructure/user/UserRepository.impl.js';
import { DealerRepositoryImpl } from '../infrastructure/dealer/DealerRepository.impl.js';
import { AppError } from '../../errors.js';
import { permissionService } from '../../services/permission/index.js';
import type { AuthUser } from '../../middleware/auth.js';

export class DealerService {
  private userRepo: UserRepository;
  private dealerRepo: DealerRepository;

  constructor(userRepo?: UserRepository, dealerRepo?: DealerRepository) {
    this.userRepo = userRepo ?? new UserRepositoryImpl();
    this.dealerRepo = dealerRepo ?? new DealerRepositoryImpl();
  }

  async upgrade(input: { role: 'dealer' | 'agency' | 'store'; business_name: string; user: AuthUser }) {
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

    let existingDealer = await this.dealerRepo.findByUserId(input.user.id);
    if (existingDealer) {
      existingDealer.businessName = input.business_name;
      existingDealer.updatedAt = new Date();
      await this.dealerRepo.save(existingDealer);
    } else {
      const DealerEntity = (await import('../entities/dealer/Dealer.entity.js')).Dealer;
      const displayName = snapshot.name ?? snapshot.email;
      existingDealer = DealerEntity.fromSnapshot({
        id: 0, userId: input.user.id, name: displayName,
        slug: displayName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        businessName: input.business_name, logo: null,
        description: null, phone: existingUser.phone ?? null,
        address: null, latitude: null, longitude: null,
        dealerCode: null, subscriptionPlan: null,
        subscriptionExpiresAt: null, listingsLimit: null,
        isVerified: false, isActive: true, rating: 0,
        reviewCount: 0, publicId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await this.dealerRepo.save(existingDealer);
    }
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
    if (user.role !== 'dealer' && user.role !== 'agency' && user.role !== 'store') {
      throw AppError.forbidden('Access denied');
    }
    return { plan: 'free', expiresAt: null };
  }
}

export const dealerService = new DealerService();
