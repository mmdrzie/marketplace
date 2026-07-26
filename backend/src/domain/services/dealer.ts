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

    const check = permissionService.check(capability, input.user);
    if (!check.allowed) {
      throw AppError.forbidden(check.reason);
    }

    const existingUser = await this.userRepo.findById(input.user.id);
    if (!existingUser) throw AppError.notFound('User not found');

    existingUser.role = input.role;
    existingUser.updatedAt = new Date();
    await this.userRepo.save(existingUser);

    const existingDealer = await this.dealerRepo.findByUserId(input.user.id);
    if (existingDealer) {
      existingDealer.businessName = input.business_name;
      existingDealer.updatedAt = new Date();
      await this.dealerRepo.save(existingDealer);
    } else {
      await this.dealerRepo.create({
        user_id: input.user.id,
        business_name: input.business_name,
        dealer_code: undefined,
        phone: existingUser.phone ?? undefined,
        address: undefined,
        description: undefined,
      });
    }
  }

  async myListings(userId: string) {
    const dealer = await this.dealerRepo.findByUserId(userId);
    if (!dealer || (dealer.role !== 'dealer' && dealer.role !== 'agency' && dealer.role !== 'store')) {
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
