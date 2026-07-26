import { ParticipantState } from '../value-objects/ParticipantState.js';

export type ParticipantRole = 'buyer' | 'seller';

export class ConversationParticipant {
  constructor(
    public readonly userId: string,
    public readonly role: ParticipantRole,
    public readonly state: ParticipantState = new ParticipantState(),
  ) {}

  isArchived(): boolean {
    return this.state.isArchived;
  }

  isBlocked(): boolean {
    return this.state.isBlocked;
  }

  isDeleted(): boolean {
    return this.state.isDeleted;
  }

  archive(): void {
    this.state.archive();
  }

  unarchive(): void {
    this.state.unarchive();
  }

  block(): void {
    this.state.block();
  }

  unblock(): void {
    this.state.unblock();
  }

  markRead(at?: Date): void {
    this.state.markRead(at);
  }

  pin(): void {
    this.state.pin();
  }

  unpin(): void {
    this.state.unpin();
  }
}
