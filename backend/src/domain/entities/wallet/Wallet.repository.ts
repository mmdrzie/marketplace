import { WalletTransaction } from './WalletTransaction.entity.js';

export interface AddTransactionInput {
  userId: string;
  type: string;
  amount: number;
  description: string;
  referenceType: string;
  referenceId: number;
}

export interface WalletRepository {
  addAtomicTransaction(input: AddTransactionInput): Promise<WalletTransaction | null>;
  hasReference(referenceType: string, referenceId: number): Promise<boolean>;
  getBalance(userId: string): Promise<number>;
  getTransactions(userId: string): Promise<WalletTransaction[]>;
}
