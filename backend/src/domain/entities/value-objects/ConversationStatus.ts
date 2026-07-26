export enum ConversationStatus {
  Active = 'active',
  Archived = 'archived',
  Blocked = 'blocked',
}

export function parseConversationStatus(value: string): ConversationStatus {
  switch (value) {
    case 'active': return ConversationStatus.Active;
    case 'archived': return ConversationStatus.Archived;
    case 'blocked': return ConversationStatus.Blocked;
    default: throw new Error(`Invalid ConversationStatus: ${value}`);
  }
}

const VALID_TRANSITIONS: Record<ConversationStatus, ConversationStatus[]> = {
  [ConversationStatus.Active]: [ConversationStatus.Archived, ConversationStatus.Blocked],
  [ConversationStatus.Archived]: [ConversationStatus.Active],
  [ConversationStatus.Blocked]: [],
};

export function canTransitionConversation(from: ConversationStatus, to: ConversationStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
