import { inputCls } from '@/components/editor/FieldInput';
import { CLASSIFICATIONS, URGENCIES } from '@/lib/messageTypes';

function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

export default function HeaderFields({ header, setHeader, isDoc }) {
  const set = (k) => (e) => setHeader({ ...header, [k]: k === 'number' ? Number(e.target.value) : e.target.value });
  return (
    <div className="grid grid-cols-2 gap-4">
      <F label="Numéro (NR)"><input type="number" value={header.number} onChange={set('number')} className={inputCls} /></F>
      <F label="Date du message"><input type="date" value={header.date} onChange={set('date')} className={inputCls} /></F>
      {!isDoc && (
        <>
          <F label="Groupe date-heure" className="col-span-2"><input type="datetime-local" value={header.gdh} onChange={set('gdh')} className={inputCls} /></F>
          <F label="Classification">
            <select value={header.classification} onChange={set('classification')} className={inputCls}>
              {CLASSIFICATIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </F>
          <F label="Urgence">
            <select value={header.urgency} onChange={set('urgency')} className={inputCls}>
              {URGENCIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </F>
          <F label="Pour action" className="col-span-2"><input value={header.to} onChange={set('to')} className={`${inputCls} uppercase`} /></F>
          <F label="Pour information" className="col-span-2"><input value={header.info} onChange={set('info')} className={`${inputCls} uppercase`} /></F>
        </>
      )}
    </div>
  );
}