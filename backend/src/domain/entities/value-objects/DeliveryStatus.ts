export enum DeliveryStatus {
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read',
}

export function parseDeliveryStatus(value: string): DeliveryStatus {
  switch (value) {
    case 'sent': return DeliveryStatus.Sent;
    case 'delivered': return DeliveryStatus.Delivered;
    case 'read': return DeliveryStatus.Read;
    default: return DeliveryStatus.Sent;
  }
}

const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.Sent]: [DeliveryStatus.Delivered],
  [DeliveryStatus.Delivered]: [DeliveryStatus.Read],
  [DeliveryStatus.Read]: [],
};

export function canTransitionDelivery(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
