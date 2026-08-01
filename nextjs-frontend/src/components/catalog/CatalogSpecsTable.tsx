'use client';

interface TuningSpecs {
  schema_version?: number;
  stage_label?: string;
  horsepower_gain?: { min?: number; max?: number };
  torque_gain?: { min?: number; max?: number };
  performance_metrics?: Record<string, any>;
  dyno_charts?: any[];
  ecu_required?: boolean;
  professional_install?: boolean;
  notes?: string;
  [key: string]: any;
}

interface Props {
  specs: TuningSpecs | null | undefined;
}

function Range({ value, unit }: { value?: { min?: number; max?: number }; unit: string }) {
  if (!value || (value.min === undefined && value.max === undefined)) return null;
  const hasMin = value.min !== undefined;
  const hasMax = value.max !== undefined;
  const text = hasMin && hasMax
    ? `${value.min} - ${value.max} ${unit}`
    : hasMin
      ? `حداقل ${value.min} ${unit}`
      : `حداکثر ${value.max} ${unit}`;
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-subtle last:border-b-0">
      <span className="text-sm text-muted-foreground">{unit === 'HP' ? 'افزایش قدرت' : 'افزایش گشتاور'}</span>
      <span className="text-sm font-bold text-foreground tracking-tighter">{text}</span>
    </div>
  );
}

function MetricRows({ metrics }: { metrics?: Record<string, any> }) {
  if (!metrics || Object.keys(metrics).length === 0) return null;
  return (
    <>
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-b-0">
          <span className="text-sm text-muted-foreground">{key}</span>
          <span className="text-sm font-bold text-foreground font-mono" dir="ltr">
            {typeof value === 'object' && value !== null
              ? JSON.stringify(value)
              : String(value)}
          </span>
        </div>
      ))}
    </>
  );
}

function YesNo({ label, value }: { label: string; value?: boolean }) {
  if (value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-subtle last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${value ? 'text-primary' : 'text-muted-foreground'}`}>
        {value ? 'بله' : 'خیر'}
      </span>
    </div>
  );
}

export function CatalogSpecsTable({ specs }: Props) {
  if (!specs) return null;
  const dynoCount = Array.isArray(specs.dyno_charts) ? specs.dyno_charts.length : 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-2 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">مشخصات فنی تیونینگ</h3>
        {specs.stage_label && (
          <span className="text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
            {specs.stage_label}
          </span>
        )}
      </div>

      <div className="divide-y divide-border-subtle">
        <Range value={specs.horsepower_gain} unit="HP" />
        <Range value={specs.torque_gain} unit="Nm" />
        <MetricRows metrics={specs.performance_metrics} />
        {dynoCount > 0 && (
          <div className="flex items-center justify-between py-3 border-b border-border-subtle">
            <span className="text-sm text-muted-foreground">نمودار داینو</span>
            <span className="text-sm font-bold text-foreground">{dynoCount.toLocaleString('fa-IR')} نمودار</span>
          </div>
        )}
        <YesNo label="نیاز به ریمپ (ECU Tuning)" value={specs.ecu_required} />
        <YesNo label="نصب تخصصی" value={specs.professional_install} />
        {specs.notes && (
          <div className="py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{specs.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
