// Health Check — بررسی سلامت سرویس‌های وابسته

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckItem[];
  timestamp: string;
}

export interface HealthCheckItem {
  name: string;
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
}

export type HealthCheckFn = () => Promise<HealthCheckItem>;

export class HealthChecker {
  private checks: HealthCheckFn[] = [];

  addCheck(name: string, fn: () => Promise<boolean>): void {
    this.checks.push(async () => {
      const start = Date.now();
      try {
        const ok = await fn();
        return { name, status: ok ? 'healthy' : 'unhealthy', latency: Date.now() - start };
      } catch (err) {
        return {
          name, status: 'unhealthy', latency: Date.now() - start,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });
  }

  async check(): Promise<HealthCheckResult> {
    const results = await Promise.all(this.checks.map(fn => fn()));
    const allHealthy = results.every(r => r.status === 'healthy');
    return {
      status: allHealthy ? 'healthy' : results.some(r => r.status === 'healthy') ? 'degraded' : 'unhealthy',
      checks: results,
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthChecker = new HealthChecker();
