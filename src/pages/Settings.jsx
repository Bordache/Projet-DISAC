import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/hooks/useUnit';
import { inputCls } from '@/components/editor/FieldInput';

const FIELDS = [
  ['unit_name', 'Nom de l\'unité'], ['place', 'Lieu (pour « Fait à »)'], ['origin', 'Autorité origine'],
  ['ref_suffix', 'Suffixe de référence', '/DNFD/CDT/OPS/1'], ['commander', 'Grade, nom et prénoms du Commandant'],
  ['tel', 'Téléphone'], ['email', 'Email'],
  ['weekly_to', 'CR hebdo — Pour action'], ['weekly_info', 'CR hebdo — Pour information'],
  ['movement_to', 'Mouvement — Pour action'], ['movement_info', 'Mouvement — Pour information'],
  ['next_number', 'Prochain numéro NR'],
];

export default function Settings() {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(FIELDS.map(([k]) => [k, k === 'next_number' ? Number(form[k] || 1) : form[k] || '']));
    if (settings) await base44.entities.UnitSettings.update(settings.id, data);
    else await base44.entities.UnitSettings.create(data);
    qc.invalidateQueries({ queryKey: ['settings'] });
    setSaving(false);
    toast.success('Paramètres enregistrés');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-4xl tracking-tight">Unité</h1>
      <p className="text-muted-foreground mt-2 text-sm">Ces informations remplissent automatiquement chaque message.</p>
      <form onSubmit={save} className="mt-8 rounded-2xl border border-border bg-card p-6 grid sm:grid-cols-2 gap-5">
        {FIELDS.map(([k, label, ph]) => (
          <label key={k} className={`block ${['unit_name', 'commander'].includes(k) ? 'sm:col-span-2' : ''}`}>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <input type={k === 'next_number' ? 'number' : 'text'} value={form[k] ?? ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inputCls} />
          </label>
        ))}
        <button disabled={saving} className="sm:col-span-2 rounded-full bg-primary text-primary-foreground py-3 text-sm disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form>
    </div>
  );
}