import { Hono } from 'hono';
import { paymentRepo } from '../repositories/payment';
import { auth } from '../middleware/auth';

const router = new Hono();

// GET /wallet/transactions — transaction history
router.get('/transactions', auth(), async (c) => {
  const transactions = await paymentRepo.getWalletTransactions(c.get('user').id);
  return c.json({ success: true, data: transactions });
});

export { router as walletRouter };
