'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.wallet,
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const res = await api.get('/wallet/transactions');
      return res.data.data as Array<{ id: number; amount: number; type: string; description: string; created_at: string; status: string }>;
    },
    enabled: showHistory,
  });

  const depositMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payments/deposit', { amount: Number(depositAmount) });
      const paymentUrl = res.data.data?.payment_url || res.data.payment_url;
      if (paymentUrl) window.location.href = paymentUrl;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.wallet });
      setShowDepositModal(false);
      setDepositAmount('');
    },
  });

  const balance = profile?.wallet_balance ?? 0;

  return (
    <div className="relative z-10 space-y-8">
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br bg-gradient-accent items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">کیف پول</h1>
          <p className="text-muted-foreground text-sm md:text-base">مدیریت موجودی و شارژ کیف پول</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl max-w-lg">
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center text-accent-blue">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground mb-2">موجودی فعلی</p>
              <p className="text-4xl font-black text-foreground mb-1">
                {balance.toLocaleString('fa-IR')}
                <span className="text-base font-normal text-muted-foreground mr-2">تومان</span>
              </p>
              <p className="text-xs text-muted-foreground mt-4">برای ویژه کردن آگهی‌ها و دریافت خدمات ویژه استفاده کنید</p>
            </div>

            <div className="mt-8 space-y-3">
              <button onClick={() => setShowDepositModal(true)} className="w-full py-3.5 btn btn-primary">
                شارژ کیف پول
              </button>
              <button onClick={() => setShowHistory(!showHistory)} className="w-full py-3.5 btn btn-glass">
                {showHistory ? 'بستن تاریخچه' : 'تاریخچه تراکنش‌ها'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDepositModal(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm border border-border-subtle shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">شارژ کیف پول</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">مبلغ (تومان)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-lg text-foreground text-center"
                  placeholder="مثال: ۵۰۰,۰۰۰"
                  min="1000"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[100000, 500000, 1000000, 2000000, 5000000, 10000000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(String(amount))}
                    className="py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs text-foreground font-medium transition-colors"
                  >
                    {amount.toLocaleString('fa-IR')}
                  </button>
                ))}
              </div>
              {depositMutation.isError && (
                <p className="text-destructive text-xs">خطا در ایجاد تراکنش. دوباره تلاش کنید.</p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDepositModal(false)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
              <button
                onClick={() => depositMutation.mutate()}
                disabled={!depositAmount || Number(depositAmount) < 1000 || depositMutation.isPending}
                className="flex-1 py-2.5 btn btn-primary"
              >
                {depositMutation.isPending ? 'در حال اتصال به درگاه...' : 'پرداخت'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {showHistory && (
        <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl">
          <h3 className="text-lg font-bold text-foreground mb-4">تاریخچه تراکنش‌ها</h3>
          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">تراکنشی ثبت نشده است</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-2">
                  <div>
                    <p className="text-sm text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('fa-IR')}</p>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-success' : 'text-destructive'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString('fa-IR')}
                    </p>
                    <span className={`text-[10px] ${tx.status === 'completed' ? 'text-success' : tx.status === 'pending' ? 'text-warning' : 'text-destructive'}`}>
                      {tx.status === 'completed' ? 'موفق' : tx.status === 'pending' ? 'در انتظار' : 'ناموفق'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
