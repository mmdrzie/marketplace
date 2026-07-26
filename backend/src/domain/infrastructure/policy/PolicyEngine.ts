// Policy Engine — قوانین تجاری قابل توسعه

export type PolicyResult = { allowed: true } | { allowed: false; reason: string };

export interface Policy<T = unknown> {
  readonly name: string;
  evaluate(context: T): PolicyResult | Promise<PolicyResult>;
}

export class PolicyEngine {
  private policies = new Map<string, Policy[]>();

  register<T>(domain: string, policy: Policy<T>): void {
    if (!this.policies.has(domain)) this.policies.set(domain, []);
    this.policies.get(domain)!.push(policy);
  }

  async evaluate<T>(domain: string, context: T): Promise<PolicyResult> {
    const policies = this.policies.get(domain) ?? [];
    for (const policy of policies) {
      const result = await policy.evaluate(context);
      if (!result.allowed) return result;
    }
    return { allowed: true };
  }
}

export const policyEngine = new PolicyEngine();

// مثال: Policy نمونه
export class ListingPublishPolicy implements Policy<{ userId: string; phoneVerified: boolean }> {
  readonly name = 'listing:publish';

  async evaluate(context: { userId: string; phoneVerified: boolean }): Promise<PolicyResult> {
    if (!context.phoneVerified) {
      return { allowed: false, reason: 'Phone number must be verified to publish listings' };
    }
    return { allowed: true };
  }
}
