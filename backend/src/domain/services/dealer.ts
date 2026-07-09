import { dealerRepo } from '../../repositories/dealer.js';
import { userRepo } from '../../repositories/user.js';
import { permissionService } from '../../services/permission/index.js';
import { eventBus, AccountUpgraded } from '../events/index.js';
import { AppError } from '../../errors.js';
import type { AuthUser } from '../../middleware/auth.js';

export class DealerService {
  async upgrade(input: { role: 'dealer' | 'agency'; business_name: string; user: AuthUser }) {
    permissionService.requireCapability(
      input.role === 'agency' ? 'account:upgrade-agency' : 'account:upgrade-dealer',
      input.user,
    );

    if (input.user.role !== 'user') {
      throw AppError.resourceConflict('Account already upgraded');
    }

    const existing = await dealerRepo.findByUserId(input.user.id);
    if (existing) {
      throw AppError.resourceConflict('Dealer profile already exists');
    }

    const profile = await dealerRepo.create({
      user_id: input.user.id,
      business_name: input.business_name,
    });

    await userRepo.update(input.user.id, { role: input.role });

    eventBus.publish(AccountUpgraded, { userId: input.user.id, role: input.role });

    return profile;
  }

  async getPublicProfile(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const profile = await dealerRepo.findByUserId(userId);
    const stats = profile ? await dealerRepo.getStats(userId) : null;

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      city: user.city,
      dealer_profile: profile,
      stats,
    };
  }

  async addReview(input: { dealer_id: string; rating: number; comment?: string; user: AuthUser }) {
    const dealer = await userRepo.findById(input.dealer_id);
    if (!dealer || (dealer.role !== 'dealer' && dealer.role !== 'agency')) {
      throw AppError.notFound('Dealer not found');
    }

    if (input.dealer_id === input.user.id) {
      throw AppError.validation('You cannot review yourself');
    }

    const review = await dealerRepo.addReview({
      dealer_id: input.dealer_id,
      user_id: input.user.id,
      rating: input.rating,
      comment: input.comment,
    });

    return review;
  }

  async getStats(user: AuthUser) {
    if (user.role !== 'dealer' && user.role !== 'agency') {
      throw AppError.forbidden('Dealer access required');
    }
    return dealerRepo.getStats(user.id);
  }

  async getSubscription(user: AuthUser) {
    if (user.role !== 'dealer' && user.role !== 'agency') {
      throw AppError.forbidden('Dealer access required');
    }
    const sub = await dealerRepo.getSubscription(user.id);
    if (!sub) throw AppError.notFound('Dealer profile not found');
    return sub;
  }
}

export const dealerService = new DealerService();
