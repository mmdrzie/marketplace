import { createClient } from '@supabase/supabase-js';
import { config } from '../../../config/index.js';

interface BroadcastEvent {
  channel: string;
  event: string;
  payload: Record<string, unknown>;
}

export class RealtimeBroadcaster {
  private readonly supabase = createClient(config.supabase.url, config.supabase.anonKey);

  async broadcast(events: BroadcastEvent[]): Promise<void> {
    for (const { channel, event, payload } of events) {
      try {
        await this.supabase.channel(channel).send({
          type: 'broadcast',
          event,
          payload,
        });
      } catch (err) {
        console.error(`[realtime] broadcast error on channel ${channel} event ${event}:`, err);
      }
    }
  }
}

export const realtimeBroadcaster = new RealtimeBroadcaster();
