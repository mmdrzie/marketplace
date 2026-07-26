export enum ConversationLifecycle {
  Created = 'created',
  Active = 'active',
  Locked = 'locked',
  Deleted = 'deleted',
}

const VALID_TRANSITIONS: Record<ConversationLifecycle, ConversationLifecycle[]> = {
  [ConversationLifecycle.Created]: [ConversationLifecycle.Active, ConversationLifecycle.Deleted],
  [ConversationLifecycle.Active]: [ConversationLifecycle.Locked, ConversationLifecycle.Deleted],
  [ConversationLifecycle.Locked]: [ConversationLifecycle.Active, ConversationLifecycle.Deleted],
  [ConversationLifecycle.Deleted]: [],
};

export function parseConversationLifecycle(value: string): ConversationLifecycle {
  switch (value) {
    case 'created': return ConversationLifecycle.Created;
    case 'active': return ConversationLifecycle.Active;
    case 'locked': return ConversationLifecycle.Locked;
    case 'deleted': return ConversationLifecycle.Deleted;
    default: return ConversationLifecycle.Active;
  }
}

export function canTransitionLifecycle(from: ConversationLifecycle, to: ConversationLifecycle): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionOrThrow(from: ConversationLifecycle, to: ConversationLifecycle): void {
  if (!canTransitionLifecycle(from, to)) {
    throw new Error(`Cannot transition conversation from ${from} to ${to}`);
  }
}
