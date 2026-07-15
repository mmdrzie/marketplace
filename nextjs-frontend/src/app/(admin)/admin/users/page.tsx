'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassSelect } from '@/components/common/GlassSelect';
import api from '@/lib/api';
import type { User } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/components/common/Toast';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [addForm, setAddForm] = useState({ name: '', phone: '', password: '', role: 'user' as User['role'] });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users(search, roleFilter),
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { search: search || undefined, role: roleFilter || undefined } });
      return res.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string | number; role: string }) => { await api.put(`/admin/users/${id}/role`, { role }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }); toast({ type: 'success', title: 'نقش کاربر تغییر کرد' }); },
    onError: () => { toast({ type: 'error', title: 'خطا', message: 'تغییر نقش با مشکل مواجه شد' }); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string | number; status: string }) => { await api.put(`/admin/users/${id}/status`, { status }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }); toast({ type: 'success', title: 'وضعیت کاربر تغییر کرد' }); },
    onError: () => { toast({ type: 'error', title: 'خطا', message: 'تغییر وضعیت با مشکل مواجه شد' }); },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; password: string; role: string }) => { await api.post('/admin/users', data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }); setShowAddModal(false); setAddForm({ name: '', phone: '', password: '', role: 'user' }); toast({ type: 'success', title: 'کاربر ایجاد شد' }); },
    onError: () => { toast({ type: 'error', title: 'خطا', message: 'ایجاد کاربر با مشکل مواجه شد' }); },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string | number) => { await api.delete(`/admin/users/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }); setDeleteTarget(null); toast({ type: 'success', title: 'کاربر حذف شد' }); },
    onError: () => { toast({ type: 'error', title: 'خطا', message: 'حذف کاربر با مشکل مواجه شد' }); },
  });

  const users = useMemo(() => data?.data || [], [data]);

  const exportCSV = useCallback(() => {
    const headers = ['id', 'نام', 'موبایل', 'نقش', 'وضعیت', 'تاریخ عضویت'];
    const rows = (users as User[]).map((u: User) => [`${u.id}`, u.name || '', u.phone || '', u.role, u.status || 'active', u.created_at ? new Date(u.created_at).toLocaleDateString('fa-IR') : '']);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">کاربران</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn btn-ghost text-sm gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="11 3 11 16 7 12 11 16 15 12 11 3" /></svg>
            خروجی CSV
          </button>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          افزودن کاربر
        </button>
        </div>
      </div>

      <div className="flex gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی کاربر..." className="flex-1 px-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" />
        <GlassSelect
          value={roleFilter}
          onChange={(val) => setRoleFilter(val)}
          options={[
            { value: '', label: 'همه نقش‌ها' },
            { value: 'user', label: 'کاربر عادی' },
            { value: 'dealer', label: 'نمایندگی' },
            { value: 'agency', label: 'بنگاه' },
            { value: 'admin', label: 'مدیر' },
          ]}
          placeholder="همه نقش‌ها"
          className="w-44"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-surface-2 rounded-xl motion-safe:animate-pulse" />)}</div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-foreground">نام</th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">موبایل</th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">نقش</th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">وضعیت</th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">تاریخ ثبت</th>
                  <th className="px-4 py-3 font-medium text-foreground">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(users as User[]).map((user) => (
                  <tr key={user.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-foreground">{user.name || '---'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{user.phone}</td>
                    <td className="px-4 py-3">
                      <select value={user.role} onChange={(e) => updateRoleMutation.mutate({ id: user.id, role: e.target.value })} className="text-xs glass-input rounded-lg px-2 py-1 text-foreground">
                        <option value="user">کاربر عادی</option>
                        <option value="dealer">نمایندگی</option>
                        <option value="agency">بنگاه</option>
                        <option value="admin">مدیر</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                        user.status === 'active' ? 'bg-success/10 text-success' :
                        user.status === 'suspended' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {user.status === 'active' ? 'فعال' : user.status === 'suspended' ? 'تعلیق' : 'مسدود'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select value={user.status ?? ''} onChange={(e) => updateStatusMutation.mutate({ id: user.id, status: e.target.value })} className="text-xs glass-input rounded-lg px-2 py-1 text-foreground">
                          <option value="active">فعال</option>
                          <option value="suspended">تعلیق</option>
                          <option value="banned">مسدود</option>
                        </select>
                        <button onClick={() => setDeleteTarget(user)} className="btn btn-danger btn-sm">
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-md border border-border-subtle shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-5">افزودن کاربر جدید</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">نام و نام خانوادگی</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" placeholder="نام کاربر" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">شماره موبایل</label>
                <input type="tel" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })} className="w-full px-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" placeholder="09123456789" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">رمز عبور</label>
                <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" placeholder="حداقل ۶ کاراکتر" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">نقش کاربری</label>
                <GlassSelect
                  value={addForm.role}
                  onChange={(val) => setAddForm({ ...addForm, role: val as User['role'] })}
                  options={[
                    { value: 'user', label: 'کاربر عادی' },
                    { value: 'dealer', label: 'نمایندگی' },
                    { value: 'agency', label: 'بنگاه' },
                    { value: 'admin', label: 'مدیر' },
                  ]}
                  placeholder="انتخاب نقش"
                />
              </div>
              {createUserMutation.isError && (
                <p className="text-destructive text-sm">{(createUserMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'خطا در ایجاد کاربر'}</p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
              <button onClick={() => createUserMutation.mutate(addForm)} disabled={!addForm.name || !addForm.phone || !addForm.password || createUserMutation.isPending} className="flex-1 btn btn-primary">
                {createUserMutation.isPending ? 'در حال ایجاد...' : 'ایجاد کاربر'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm border border-border-subtle shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">حذف کاربر</h3>
            <p className="text-sm text-muted-foreground mb-1">آیا از حذف کاربر <span className="font-medium text-foreground">{deleteTarget.name || 'بدون نام'}</span> اطمینان دارید؟</p>
            <p className="text-xs text-destructive mb-5">این عمل قابل بازگشت نیست</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
              <button onClick={() => deleteUserMutation.mutate(deleteTarget.id)} disabled={deleteUserMutation.isPending} className="flex-1 py-2.5 btn btn-danger">
                {deleteUserMutation.isPending ? 'در حال حذف...' : 'حذف کاربر'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
