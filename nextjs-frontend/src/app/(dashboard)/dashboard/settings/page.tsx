'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from '@/components/common/Toast';
import { FadeIn } from '@/components/common/MotionDiv';
import Image from 'next/image';

function Svg({ d, className }: { d: string; className?: string }) {
  return <svg className={className || 'h-4 w-4'} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d={d} /></svg>;
}

function Field({ label, icon, children, required, hint }: { label: string; icon: React.ReactNode; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
        {required && <span className="text-destructive">*</span>}
        {label}
      </label>
      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
        </span>
        {children}
      </div>
      {hint && <p className="mt-1.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  user: '????? ????',
  dealer: '??????? ????',
  agency: '?????',
  admin: '???? ?????',
};

const ROLE_COLORS: Record<string, string> = {
  user: 'bg-surface-2 text-muted-foreground border-border',
  dealer: 'bg-primary/10 text-primary border-primary/20',
  agency: 'bg-success/10 text-success border-success/20',
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
};

const I = {
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  bio: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  map: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z',
  camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
  building: 'M3 21h18M3 7v14M21 7v14M6 11h4M10 11h4M14 11h4M6 15h4M10 15h4M14 15h4M6 19h4M10 19h4M14 19h4M3 7l9-4 9 4',
  hash: 'M9 3v18M15 3v18M3 9h18M3 15h18',
  check: 'M20 6 9 17l-5-5',
};

const inputClass = "w-full h-12 pr-12 pl-4 rounded-xl bg-surface-2/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300";
const textareaClass = "w-full pr-12 pl-4 pt-3 rounded-xl bg-surface-2/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 resize-none";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const avatarUrlRef = useRef<string | null>(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [city, setCity] = useState(user?.profile?.city || user?.city || '');

  const isDealer = user?.role === 'dealer' || user?.role === 'agency';
  const [businessName, setBusinessName] = useState(user?.dealer_profile?.business_name || '');
  const [dealerCode, setDealerCode] = useState(user?.dealer_profile?.dealer_code || '');
  const [businessAddress, setBusinessAddress] = useState(user?.dealer_profile?.address || '');
  const [businessDesc, setBusinessDesc] = useState(user?.dealer_profile?.description || '');

  useEffect(() => {
    return () => { if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name, phone, email };
      if (bio) payload.bio = bio;
      if (city) payload.city = city;
      if (isDealer) {
        payload.business_name = businessName;
        payload.dealer_code = dealerCode;
        payload.business_address = businessAddress;
        if (businessDesc) payload.business_description = businessDesc;
      }
      const res = await api.put('/auth/me', payload);
      setUser(res.data.data);
      toast({ type: 'success', title: '??????? ?? ?????? ????? ??' });
    } catch (e) {
      console.error('Failed to save settings', e);
      toast({ type: 'error', title: '??? ?? ????? ???????' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    const url = URL.createObjectURL(file);
    avatarUrlRef.current = url;
    setAvatarPreview(url);
    setAvatarUploading(true);
    try {
      const presigned = await api.post('/upload/presigned', { filename: file.name, content_type: file.type, size: file.size });
      const { upload_url, object_key } = presigned.data.data;
      await fetch(upload_url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      const res = await api.post('/me/avatar', { object_key });
      setUser(res.data.data);
      setAvatarPreview(null);
      toast({ type: 'success', title: '????? ??????? ????? ??' });
    } catch {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
      avatarUrlRef.current = null;
      setAvatarPreview(null);
      toast({ type: 'error', title: '??? ?? ????? ???' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const currentAvatar = user?.avatar || null;

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* ???????? ???????? ?????? */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto w-full px-4 py-12 md:py-16 space-y-8">
          
          {/* ??? ???? */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
                ACCOUNT SETTINGS
              </span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">??????? ????</h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base font-light">??????? ? ??????? ??? ?? ?????? ????.</p>
            </div>
          </div>

          {/* ???? ??? ???? */}
          <div className="glass rounded-3xl p-6 md:p-10 shadow-xl border border-border-subtle">
            
            {/* ??? ????? ?????? */}
            <div className="mb-10 flex flex-col items-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full p-1 bg-primary/10 shadow-lg">
                  <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center relative">
                    {(avatarPreview || currentAvatar) ? (
                      <Image src={avatarPreview || currentAvatar || ''} alt="" width={112} height={112} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-muted-foreground">{user?.name?.[0] || '?'}</span>
                    )}
                    {!avatarUploading && (
                      <button type="button" onClick={() => inputRef.current?.click()} className="absolute inset-0 bg-overlay/60 backdrop-blur-sm flex flex-col items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1">
                        <Svg d={I.camera} className="h-6 w-6" />
                        <span className="text-[10px] font-medium">????? ???</span>
                      </button>
                    )}
                    {avatarUploading && (
                      <div className="absolute inset-0 bg-overlay/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="follow-the-leader scale-75 text-primary-foreground"><div></div><div></div><div></div><div></div><div></div></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              {!avatarUploading && (
                <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                  ????? ????? ???????
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-2">???????? ????: JPG, PNG, WEBP</p>
              {user?.role && (
                <span className={'mt-3 text-[10px] font-bold px-3 py-1 rounded-full border ' + (ROLE_COLORS[user.role] || ROLE_COLORS.user)}>
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              )}
            </div>

            {/* ??? ??????? */}
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ??????? ???? */}
              <div className="border-b border-border pb-8">
                <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                  <Svg d={I.user} className="w-4 h-4 text-primary" />
                  ??????? ????
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="??? ? ??? ????????" icon={<Svg d={I.user} />} required>
                    <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="??? ??? ?? ???? ????" />
                  </Field>
                  <Field label="????? ??????" icon={<Svg d={I.phone} />} required hint="?? ???? ?????? ????? ???? ???? ????? ???">
                    <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="???????????" />
                  </Field>
                  <Field label="?????" icon={<Svg d={I.mail} />}>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputClass} placeholder="example@email.com" />
                  </Field>
                  <Field label="???" icon={<Svg d={I.map} />}>
                    <input value={city} onChange={e => setCity(e.target.value)} className={inputClass} placeholder="?????" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="?????? ??" icon={<Svg d={I.bio} />}>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className={textareaClass} placeholder="????? ?????? ?????? ??????..." />
                    </Field>
                  </div>
                </div>
              </div>

              {/* ??????? ???????? */}
              {isDealer && (
                <div className="border-b border-border pb-8">
                  <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                    <Svg d={I.building} className="w-4 h-4 text-primary" />
                    ??????? ????????
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="??? ????????" icon={<Svg d={I.building} />} required>
                      <input value={businessName} onChange={e => setBusinessName(e.target.value)} className={inputClass} placeholder="???????? ..." />
                    </Field>
                    <Field label="?? ????????" icon={<Svg d={I.hash} />} required hint="?? ??????? ????????">
                      <input value={dealerCode} onChange={e => setDealerCode(e.target.value)} className={inputClass} placeholder="????: DL-???" />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="????" icon={<Svg d={I.map} />} required>
                        <input value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} className={inputClass} placeholder="???? ????????" />
                      </Field>
                    </div>
                    <div className="md:col-span-2">
                      <Field label="???????" icon={<Svg d={I.bio} />}>
                        <textarea value={businessDesc} onChange={e => setBusinessDesc(e.target.value)} rows={3} className={textareaClass} placeholder="??????? ?????? ????????..." />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* ???? ?? ??????? ????? */}
              <div className="pt-2 pb-6 border-b border-border mb-6">
                <a href="/dashboard/settings/notifications" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  ??????? ????????
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </a>
              </div>

              {/* ???? ????? */}
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="h-12 px-8 rounded-xl btn btn-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                  {saving ? (
                    <><div className="follow-the-leader scale-50"><div></div><div></div><div></div><div></div><div></div></div> ?? ??? ?????...</>
                  ) : (
                    <><Svg d={I.check} className="h-4 w-4" /> ????? ???????</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}