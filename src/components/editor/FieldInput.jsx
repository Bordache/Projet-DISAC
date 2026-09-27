export const inputCls =
  'mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring/40';

export default function FieldInput({ field, value, onChange, vessels = [] }) {
  const common = { value: value ?? '', onChange: (e) => onChange(e.target.value), placeholder: field.hint };
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
      {field.type === 'textarea' && (
        <textarea rows={3} {...common} className={`${inputCls} font-mono text-[13px] uppercase placeholder:normal-case`} />
      )}
      {field.type === 'vessel' && (
        <select {...common} className={inputCls}>
          <option value="">— Choisir —</option>
          {vessels.map((v) => <option key={v.id} value={v.code || v.name}>{v.name}</option>)}
        </select>
      )}
      {['text', 'date', 'number'].includes(field.type) && (
        <input
          type={field.type}
          {...common}
          onChange={(e) => onChange(field.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value)}
          className={`${inputCls} ${field.type === 'text' ? 'uppercase placeholder:normal-case' : ''}`}
        />
      )}
    </label>
  );
}