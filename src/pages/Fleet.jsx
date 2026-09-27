import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useVessels } from '@/hooks/useUnit';
import VesselDialog from '@/components/fleet/VesselDialog';

export default function Fleet() {
  const { data: vessels = [] } = useVessels();
  const qc = useQueryClient();
  const [edit, setEdit] = useState(undefined);

  const save = async (data) => {
    if (edit) await base44.entities.Vessel.update(edit.id, data);
    else await base44.entities.Vessel.create(data);
    qc.invalidateQueries({ queryKey: ['vessels'] });
    setEdit(undefined);
  };
  const remove = async (v) => {
    if (!window.confirm(`Supprimer ${v.name} ?`)) return;
    await base44.entities.Vessel.delete(v.id);
    qc.invalidateQueries({ queryKey: ['vessels'] });
  };

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-4xl tracking-tight">Flotte</h1>
          <p className="text-muted-foreground mt-2 text-sm">Ces états pré-remplissent le CRHSBE et le CRHTER.</p>
        </div>
        <button onClick={() => setEdit(null)} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm"><Plus className="w-4 h-4" />Ajouter</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {vessels.map((v) => (
          <div key={v.id} onClick={() => setEdit(v)} className="cursor-pointer rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-heading text-2xl">{v.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{v.category}{v.code ? ` · ${v.code}` : ''}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); remove(v); }} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <span className={`text-[11px] px-2.5 py-1 rounded-full ${v.status === 'disponible' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{v.status === 'disponible' ? 'Disponible' : 'Indisponible'}</span>
              <span className="font-mono text-xs text-muted-foreground">VB {v.vb ?? 0} %</span>
            </div>
            {v.situation && <p className="text-sm mt-3 uppercase text-foreground/80">{v.situation}</p>}
          </div>
        ))}
      </div>
      <VesselDialog open={edit !== undefined} vessel={edit} onClose={() => setEdit(undefined)} onSave={save} />
    </div>
  );
}