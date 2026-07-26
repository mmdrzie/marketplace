export type PolicyResult = { allowed: true } | { allowed: false; reason: string };

export interface Policy<T = unknown> {
  readonly name: string;
  evaluate(context: T): PolicyResult | Promise<PolicyResult>;
}

export class PolicyPipeline<T> {
  private policies: Policy<T>[] = [];

  add(policy: Policy<T>): void {
    this.policies.push(policy);
  }

  async execute(context: T): Promise<PolicyResult> {
    for (const policy of this.policies) {
      const result = await policy.evaluate(context);
      if (!result.allowed) return result;
    }
    return { allowed: true };
  }
}
