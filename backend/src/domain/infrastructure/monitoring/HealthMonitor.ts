export interface HealthMonitor {
  recordWorkerLag(workerName: string, lagMs: number): void;
  recordProjectionLag(projectionName: string, lagEvents: number): void;
  recordDeadLetter(eventType: string, reason: string): void;
  getMetrics(): Promise<{
    workerLag: Record<string, number>;
    projectionLag: Record<string, number>;
    deadLetterCount: number;
  }>;
}
