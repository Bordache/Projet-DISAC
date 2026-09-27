import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/hooks/useUnit';
import { inputCls } from '@/components/editor/FieldInput';
import { Image } from '@/components/ui/image';
import { downloadText } from '@/lib/exportMessage';
import { localISO } from '@/lib/format';

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
  const [stampBusy, setStampBusy] = useState(false);
  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const uploadStamp = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStampBusy(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      let url;
      try { ({ signed_url: url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri })); } catch {}
      setForm({ ...form, stamp: file_uri, stampUrl: url });
      toast.success('Cachet ajouté');
    } catch {
      toast.error('Échec du téléversement');
    }
    setStampBusy(false);
  };

  const exportBackup = async () => {
    const [s, v, msg] = await Promise.all([
      base44.entities.UnitSettings.filter({}, { limit: 1 }),
      base44.entities.Vessel.filter({}, { limit: 100 }),
      base44.entities.Message.filter({}, { limit: 1000, sort: '-date' }),
    ]);
    downloadText(`DISAC_sauvegarde_${localISO()}.json`, JSON.stringify({
      settings: s.items[0], vessels: v.items, messages: msg.items, exported: new Date().toISOString(),
    }, null, 2));
    toast.success('Sauvegarde téléchargée');
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(FIELDS.map(([k]) => [k, k === 'next_number' ? Number(form[k] || 1) : form[k] || '']));
    if (form.stamp) data.stamp = form.stamp;
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

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-heading text-xl">Cachet officiel</h2>
        <p className="text-sm text-muted-foreground mt-1">Apparaît sur chaque message et CR de mission.</p>
        <div className="mt-4 flex items-center gap-5">
          <div className="w-24 h-24 rounded-xl border border-dashed border-border grid place-items-center overflow-hidden bg-secondary/30 shrink-0">
            {form.stampUrl ? <Image src={form.stampUrl} alt="Cachet" className="w-full h-full object-contain" fittingType="fit" /> : <span className="text-[10px] text-muted-foreground text-center px-2">Aucun cachet</span>}
          </div>
          <label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:bg-secondary">
            {stampBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {form.stamp ? 'Remplacer' : 'Téléverser'}
            <input type="file" accept="image/*" className="hidden" onChange={uploadStamp} />
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-heading text-xl">Sauvegarde locale</h2>
        <p className="text-sm text-muted-foreground mt-1">Copie complète (messages, flotte, unité) dans un fichier JSON.</p>
        <button onClick={exportBackup} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm"><Download className="w-4 h-4" />Exporter la sauvegarde</button>
      </div>
    </div>
  );
}