import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { inputCls } from '@/components/editor/FieldInput';

const EMPTY = { name: '', code: '', category: '', status: 'disponible', vb: 0, situation: '' };

export default function VesselDialog({ open, vessel, onClose, onSave }) {
  const [v, setV] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setV(vessel ? { ...EMPTY, ...vessel } : EMPTY); }, [open, vessel]);
  const set = (k) => (e) => setV({ ...v, [k]: k === 'vb' ? Number(e.target.value) : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { name, code, category, status, vb, situation } = v;
    await onSave({ name, code, category, status, vb, situation });
    setSaving(false);
  };

  const L = ({ label, children }) => <label className="block"><span className="text-xs text-muted-foreground">{label}</span>{children}</label>;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle className="font-heading text-2xl font-normal">{vessel ? 'Modifier' : 'Nouveau bâtiment'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <L label="Nom"><input required value={v.name} onChange={set('name')} className={inputCls} /></L>
          <L label="Abréviation (messages)"><input value={v.code} onChange={set('code')} className={`${inputCls} uppercase`} /></L>
          <L label="Type"><input value={v.category} onChange={set('category')} placeholder="Vedette, patrouilleur…" className={inputCls} /></L>
          <L label="VB (%)"><input type="number" value={v.vb} onChange={set('vb')} className={inputCls} /></L>
          <div className="col-span-2"><L label="Disponibilité">
            <select value={v.status} onChange={set('status')} className={inputCls}><option value="disponible">Disponible</option><option value="indisponible">Indisponible</option></select>
          </L></div>
          <div className="col-span-2"><L label="Situation particulière"><input value={v.situation} onChange={set('situation')} className={`${inputCls} uppercase`} /></L></div>
          <button disabled={saving} className="col-span-2 rounded-full bg-primary text-primary-foreground py-3 text-sm disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}