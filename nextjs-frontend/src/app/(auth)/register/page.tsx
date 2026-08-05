'use client';

import { useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, type ZodType } from 'zod';
import { Building2, Mail, Phone, Store, User, UserRound, Wrench } from 'lucide-react';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OtpField } from '@/components/auth/OtpField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { OptionCard } from '@/components/ui/OptionCard';
import { Stepper } from '@/components/ui/Stepper';
import { StatusCard } from '@/components/ui/StatusCard';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import type { AuthRole, BusinessProfileInput, ProfileStatus, WorkshopType } from '@/types';

const inputClass = 'text-left';

type RegisterMethod = 'email' | 'phone';
type Step = 'role' | 'method' | 'form' | 'otp';

interface RegisterValues {
  name: string;
  identifier: string;
  password: string;
  confirmPassword: string;
  business_name?: string;
  dealer_code?: string;
  workshop_name?: string;
  workshop_type?: WorkshopType;
}

const ROLE_OPTIONS: { value: AuthRole; title: string; description: string; icon: React.ReactNode }[] = [
  { value: 'user', title: 'کاربر عادی', description: 'خرید و فروش، چت و امکانات پایه', icon: <User className="h-5 w-5" aria-hidden="true" /> },
  { value: 'dealer', title: 'نمایندگی', description: 'نمایندگی فروش خودرو و ماشین‌آلات', icon: <Building2 className="h-5 w-5" aria-hidden="true" /> },
  { value: 'agency', title: 'نمایشگاه', description: 'نمایشگاه‌دار خودرو', icon: <Building2 className="h-5 w-5" aria-hidden="true" /> },
  { value: 'store', title: 'فروشگاه', description: 'فروشگاه قطعات و تجهیزات', icon: <Store className="h-5 w-5" aria-hidden="true" /> },
  { value: 'workshop', title: 'تعمیرکار / تیونر', description: 'تعمیرگاه، تیونینگ و خدمات فنی', icon: <Wrench className="h-5 w-5" aria-hidden="true" /> },
];

const WORKSHOP_TYPE_OPTIONS: { value: WorkshopType; label: string }[] = [
  { value: 'mechanic', label: 'تعمیرگاه' },
  { value: 'tuner', label: 'تیونر' },
  { value: 'both', label: 'هر دو' },
];

function buildRegisterSchema(role: AuthRole, method: RegisterMethod) {
  const fields = {
    name: z.string().trim().min(2, 'نام و نام خانوادگی را وارد کنید').max(100),
    identifier:
      method === 'email'
        ? z.string().trim().email('ایمیل معتبر وارد کنید')
        : z.string().trim().regex(/^[0-9+]+$/, 'شماره تلفن معتبر وارد کنید').min(10, 'شماره تلفن معتبر وارد کنید'),
    password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد').max(128),
    confirmPassword: z.string(),
  };

  let schema: z.ZodTypeAny;
  if (role === 'workshop') {
    schema = z.object({
      ...fields,
      workshop_name: z.string().trim().min(2, 'نام تعمیرکارگاه را وارد کنید').max(200),
      workshop_type: z.enum(['mechanic', 'tuner', 'both'], { message: 'نوع فعالیت را انتخاب کنید' }),
    });
  } else if (role === 'user') {
    schema = z.object(fields);
  } else {
    schema = z.object({
      ...fields,
      business_name: z.string().trim().min(2, 'نام کسب‌وکار را وارد کنید').max(200),
      dealer_code:
        role === 'dealer'
          ? z.union([z.literal(''), z.string().regex(/^[a-zA-Z0-9_-]{2,50}$/, 'کد نمایندگی معتبر نیست')]).optional()
          : z.undefined().optional(),
    });
  }

  return schema.superRefine((val, ctx) => {
    const v = val as { password: string; confirmPassword: string };
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'رمز عبور و تکرار آن مطابقت ندارند',
      });
    }
  });
}

function businessPayload(role: AuthRole, values: RegisterValues): BusinessProfileInput | undefined {
  switch (role) {
    case 'workshop':
      return { workshop_name: values.workshop_name, workshop_type: values.workshop_type };
    case 'dealer':
      return { business_name: values.business_name, dealer_code: values.dealer_code || undefined };
    case 'agency':
    case 'store':
      return { business_name: values.business_name };
    default:
      return undefined;
  }
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get('redirect');
  const { sendRegisterOtp, registerWithOtp, loading, error } = useAuth();
  const [accountRole, setAccountRole] = useState<AuthRole>('user');
  const [method, setMethod] = useState<RegisterMethod>('email');
  const [step, setStep] = useState<Step>('role');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);

  const isBusiness = accountRole !== 'user';

  const schema = useMemo(() => buildRegisterSchema(accountRole, method), [accountRole, method]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema as ZodType<RegisterValues>),
    mode: 'onTouched',
  });

  const workshopType = useWatch<RegisterValues>({ control, name: 'workshop_type' });
  const identifier = useWatch<RegisterValues>({ control, name: 'identifier' });

  const steps = isBusiness
    ? [{ label: 'نوع حساب' }, { label: 'روش ثبت‌نام' }, { label: 'اطلاعات' }]
    : [{ label: 'نوع حساب' }, { label: 'اطلاعات' }];
  const currentStep = step === 'role' ? 0 : !isBusiness ? 1 : step === 'method' ? 1 : 2;

  const startResendTimer = () => {
    setResendTimer(120);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const selectRole = (role: AuthRole) => {
    setAccountRole(role);
    setLocalError(null);
    setStep(role === 'user' ? 'form' : 'method');
  };

  const selectMethod = (m: RegisterMethod | 'google') => {
    setLocalError(null);
    if (m === 'google') {
      // ثبت‌نام با گوگل برای کسب‌وکار — پس از نشست، به فرم پروفایل کسب‌وکار می‌رود
      window.location.href = buildGoogleUrl(accountRole);
      return;
    }
    setMethod(m);
    setStep('form');
  };

  const handleSendOtp = handleSubmit(async (values) => {
    setLocalError(null);
    try {
      await sendRegisterOtp(values.identifier.trim(), method);
      setStep('otp');
      startResendTimer();
    } catch {
      // error handled by hook
    }
  });

  const handleRegister = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setLocalError('کد تایید را کامل وارد کنید');
      return;
    }
    setLocalError(null);
    const values = getValues();
    try {
      const { profileStatus: status } = await registerWithOtp(
        values.identifier.trim(),
        method,
        otp,
        values.password,
        values.name.trim(),
        accountRole,
        businessPayload(accountRole, values),
      );
      if (!isBusiness) {
        router.push(redirectTo || '/');
        return;
      }
      setProfileStatus(status ?? 'pending');
    } catch {
      // error handled by hook
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await sendRegisterOtp(getValues('identifier').trim(), method);
      setCode(['', '', '', '', '', '']);
      startResendTimer();
    } catch {
      // error handled by hook
    } finally {
      setResendLoading(false);
    }
  };

  const displayError = localError || error;
  const formVisible = step === 'form' || step === 'otp';

  return (
    <FadeIn>
      <AuthHeader
        icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
        title="ایجاد حساب کاربری"
        subtitle="نوع حساب خود را انتخاب کنید و در چند قدم ثبت‌نام کنید"
      />

      {formVisible && <Stepper steps={steps} current={currentStep} className="mb-8" />}

      {step === 'role' && (
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-3">
          {ROLE_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={accountRole === opt.value}
              onSelect={() => selectRole(opt.value)}
              title={opt.title}
              description={opt.description}
              icon={opt.icon}
            />
          ))}
          <p className="text-center text-sm text-muted-foreground font-light pt-3">
            حساب کاربری دارید؟{' '}
            <Link href="/login" className="text-primary font-medium hover:underline transition-colors">
              ورود به حساب
            </Link>
          </p>
        </div>
      )}

      {step === 'method' && (
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-3">
          <OptionCard
            selected={false}
            onSelect={() => selectMethod('google')}
            title="ثبت‌نام با گوگل"
            description="سریع‌ترین روش — پس از ورود، پروفایل کسب‌وکار را تکمیل کنید"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            }
          />
          <OptionCard
            selected={method === 'email'}
            onSelect={() => selectMethod('email')}
            title="ایمیل"
            description="ثبت‌نام با آدرس ایمیل و کد تایید"
            icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          />
          <OptionCard
            selected={method === 'phone'}
            onSelect={() => selectMethod('phone')}
            title="شماره تلفن"
            description="ثبت‌نام با شماره همراه و کد پیامکی"
            icon={<Phone className="h-5 w-5" aria-hidden="true" />}
          />
          <button
            type="button"
            onClick={() => setStep('role')}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-light pt-2"
          >
            بازگشت به انتخاب نوع حساب
          </button>
        </div>
      )}

      {formVisible && (
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-6">
          {!isBusiness && (
            <>
              <GoogleButton label="ثبت‌نام با گوگل" redirect={redirectTo} />
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-xs text-muted-foreground">یا با ایمیل و تلفن</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
            </>
          )}

          {/* روش ثبت‌نام (email/phone) */}
          <div className="flex bg-surface-2/40 rounded-xl p-1 border border-border/50" role="group" aria-label="روش دریافت کد تایید">
            {([
              { value: 'email' as const, label: 'ایمیل' },
              { value: 'phone' as const, label: 'شماره تلفن' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={method === opt.value}
                onClick={() => {
                  setMethod(opt.value);
                  setCode(['', '', '', '', '', '']);
                }}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                  method === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {step === 'form' && (
            <div className="space-y-5">
              <FormField label="نام و نام خانوادگی" htmlFor="register-name" error={errors.name?.message} required>
                <Input id="register-name" placeholder="نام خود را وارد کنید" autoComplete="name" invalid={!!errors.name} {...register('name')} />
              </FormField>

              <FormField
                label={method === 'email' ? 'ایمیل' : 'شماره تلفن'}
                htmlFor="register-identifier"
                error={errors.identifier?.message}
                required
              >
                <Input
                  id="register-identifier"
                  type={method === 'email' ? 'email' : 'tel'}
                  inputMode={method === 'email' ? undefined : 'tel'}
                  placeholder={method === 'email' ? 'example@email.com' : '۰۹۱۲۳۴۵۶۷۸۹'}
                  autoComplete={method === 'email' ? 'email' : 'tel'}
                  invalid={!!errors.identifier}
                  className={inputClass}
                  {...register('identifier')}
                />
              </FormField>

              <FormField label="رمز عبور" htmlFor="register-password" error={errors.password?.message} required hint="حداقل ۸ کاراکتر">
                <PasswordField
                  id="register-password"
                  placeholder="رمز عبور خود را وارد کنید"
                  autoComplete="new-password"
                  invalid={!!errors.password}
                  {...register('password')}
                />
              </FormField>

              <FormField label="تکرار رمز عبور" htmlFor="register-confirm" error={errors.confirmPassword?.message} required>
                <PasswordField
                  id="register-confirm"
                  placeholder="رمز عبور را دوباره وارد کنید"
                  autoComplete="new-password"
                  invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
              </FormField>

              {/* فیلدهای کسب‌وکار */}
              {accountRole === 'workshop' && (
                <>
                  <FormField label="نام تعمیرکارگاه" htmlFor="register-workshop-name" error={errors.workshop_name?.message} required>
                    <Input
                      id="register-workshop-name"
                      placeholder="نام تعمیرگاه یا تیونینگ"
                      invalid={!!errors.workshop_name}
                      {...register('workshop_name')}
                    />
                  </FormField>
                  <FormField label="نوع فعالیت" error={errors.workshop_type?.message} required>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="نوع فعالیت تعمیرکارگاه">
                      {WORKSHOP_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={workshopType === opt.value}
                          onClick={() => {
                            setValue('workshop_type', opt.value, { shouldValidate: true, shouldDirty: true });
                          }}
                          className={cn(
                            'py-2.5 text-sm font-medium rounded-xl border transition-all',
                            workshopType === opt.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border-subtle bg-surface-2/30 text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FormField>
                </>
              )}

              {(accountRole === 'dealer' || accountRole === 'agency' || accountRole === 'store') && (
                <>
                  <FormField label="نام کسب‌وکار" htmlFor="register-business-name" error={errors.business_name?.message} required>
                    <Input
                      id="register-business-name"
                      placeholder="نام نمایندگی / نمایشگاه / فروشگاه"
                      autoComplete="organization"
                      invalid={!!errors.business_name}
                      {...register('business_name')}
                    />
                  </FormField>
                  {accountRole === 'dealer' && (
                    <FormField label="کد نمایندگی" htmlFor="register-dealer-code" error={errors.dealer_code?.message} hint="اختیاری — در صورت داشتن کد از طرف سازنده">
                      <Input
                        id="register-dealer-code"
                        placeholder="مثلاً HONDA-THR-01"
                        invalid={!!errors.dealer_code}
                        className={inputClass}
                        {...register('dealer_code')}
                      />
                    </FormField>
                  )}
                </>
              )}
            </div>
          )}

          {displayError && <Alert tone="error">{displayError}</Alert>}

          {step === 'form' && (
            <>
              <Button type="button" onClick={handleSendOtp} size="lg" loading={loading || isSubmitting} className="w-full py-4">
                ارسال کد تایید
              </Button>
              {isBusiness && (
                <button
                  type="button"
                  onClick={() => setStep('method')}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                >
                  بازگشت به انتخاب روش ثبت‌نام
                </button>
              )}
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  کد ۶ رقمی به {method === 'email' ? 'ایمیل' : 'شماره تلفن'} زیر ارسال شد
                </p>
                <p className="text-sm font-medium text-foreground mb-6" dir="ltr">
                  {identifier}
                </p>
                <div className="mb-6">
                  <OtpField value={code} onChange={setCode} disabled={loading || resendLoading} autoFocus invalid={!!error} />
                </div>
                <div className="text-xs text-muted-foreground mb-6">
                  {resendTimer > 0 ? (
                    <span>ارسال مجدد پس از {resendTimer} ثانیه</span>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={resendLoading} className="text-primary hover:underline disabled:opacity-50">
                      ارسال مجدد کد
                    </button>
                  )}
                </div>
              </div>

              <Button type="button" onClick={handleRegister} size="lg" loading={loading} disabled={code.join('').length !== 6} className="w-full py-4">
                تایید و ثبت‌نام
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setLocalError(null);
                }}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
              >
                بازگشت به فرم ثبت‌نام
              </button>
            </>
          )}

          {!profileStatus && (
            <p className="text-center text-sm text-muted-foreground font-light">
              حساب کاربری دارید؟ <Link href="/login" className="text-primary font-medium hover:underline transition-colors">ورود به حساب</Link>
            </p>
          )}
        </div>
      )}

      {profileStatus && isBusiness && (
        <div className="space-y-6">
          <StatusCard status={profileStatus} />
          <Button type="button" size="lg" className="w-full" onClick={() => router.push('/')}>
            رفتن به صفحه اصلی
          </Button>
        </div>
      )}
    </FadeIn>
  );
}

function buildGoogleUrl(role: AuthRole): string {
  const base = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/google/authorize`;
  const params = new URLSearchParams();
  params.set('role', role);
  params.set('redirect', '/business-profile');
  return `${base}?${params.toString()}`;
}
