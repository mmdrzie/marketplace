interface OutboxRow {
  id: number;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: Record<string, unknown>;
}

interface BroadcastTarget {
  channel: string;
  event: string;
  payload: Record<string, unknown>;
}

export function routeOutboxEvent(row: OutboxRow): BroadcastTarget | null {
  switch (row.event_type) {
    case 'conversation.started': {
      const { conversationId, buyerId, sellerId } = row.payload;
      return {
        channel: `conversation:${conversationId}`,
        event: 'conversation.started',
        payload: row.payload,
      };
    }

    case 'message.sent': {
      const { conversationId } = row.payload;
      return {
        channel: `conversation:${conversationId}`,
        event: 'message.sent',
        payload: row.payload,
      };
    }

    default:
      return null;
  }
}
