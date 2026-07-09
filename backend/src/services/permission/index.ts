import { ErrorCode } from '../../shared';
import { AppError } from '../../errors';

type Capability =
  | 'listing:publish'
  | 'listing:submit'
  | 'conversation:start'
  | 'account:upgrade-dealer'
  | 'account:upgrade-agency'
  | 'admin:access';

interface CapabilityRequirement {
  phoneVerified: boolean;
  roles?: string[];
}

const CAPABILITY_REQUIREMENTS: Record<Capability, CapabilityRequirement> = {
  'listing:publish': { phoneVerified: true },
  'listing:submit': { phoneVerified: true },
  'conversation:start': { phoneVerified: true },
  'account:upgrade-dealer': { phoneVerified: true, roles: ['user'] },
  'account:upgrade-agency': { phoneVerified: true, roles: ['user'] },
  'admin:access': { phoneVerified: false, roles: ['admin'] },
};

export class PermissionService {
  can(capability: Capability, user: { phoneVerified: boolean; role: string }): boolean {
    const req = CAPABILITY_REQUIREMENTS[capability];
    if (!req) return false;

    if (req.phoneVerified && !user.phoneVerified) return false;
    if (req.roles && !req.roles.includes(user.role)) return false;

    return true;
  }

  requireCapability(capability: Capability, user: { phoneVerified: boolean; role: string }): void {
    const req = CAPABILITY_REQUIREMENTS[capability];
    if (!req) {
      throw AppError.forbidden(`Unknown capability: ${capability}`);
    }

    if (req.phoneVerified && !user.phoneVerified) {
      throw new AppError(ErrorCode.PHONE_VERIFICATION_REQUIRED, 'Phone verification required for this action');
    }

    if (req.roles && !req.roles.includes(user.role)) {
      throw AppError.forbidden('You do not have permission to perform this action');
    }
  }
}

export const permissionService = new PermissionService();
