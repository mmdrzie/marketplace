export interface RateLimiter {
  allow(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  remaining(key: string, limit: number, windowSeconds: number): Promise<number>;
}
