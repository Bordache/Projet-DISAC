import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '@/lib/localDb';
import { useSettings, useVessels } from '@/hooks/useUnit';
import { MESSAGE_TYPES } from '@/lib/messageTypes';
import { localISO, nowLocal } from '@/lib/format';
import FieldInput from '@/components/editor/FieldInput';
import HeaderFields from '@/components/editor/HeaderFields';
import MessagePreview from '@/components/message/MessagePreview';

export default function Editor() {
  const { type } = useParams();
  const T = MESSAGE_TYPES[type];
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const from = params.get('from');
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: settings, isLoading } = useSettings();
  const { data: vessels } = useVessels();
  const [header, setHeader] = useState(null);
  const [fields, setFields] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings || !vessels || !T) return;
    (async () => {
      const src = id || from ? await db.messages.get(id || from) : null;
      const weekly = T.recipients === 'weekly';
      setHeader({
        number: id ? src.number : settings.next_number || 1,
        date: id ? src.date : localISO(),
        gdh: id ? src.gdh : T.defaultTime ? `${localISO()}T${T.defaultTime}` : nowLocal(),
        classification: src?.classification || T.classification,
        urgency: src?.urgency || T.urgency,
        to: src?.to ?? (weekly ? settings.weekly_to : settings.movement_to) ?? '',
        info: src?.info ?? (weekly ? settings.weekly_info : settings.movement_info) ?? '',
      });
      setFields(src ? { ...src.fields } : T.initial({ vessels }));
    })();
  }, [settings, vessels, type]);

  if (!T) return <p>Type de message inconnu.</p>;
  if (!isLoading && !settings) return <p className="text-muted-foreground">Renseignez d'abord votre unité dans <Link className="underline" to="/parametres">Paramètres</Link>.</p>;
  if (!header || !fields) return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mt-20" />;

  const save = async () => {
    setSaving(true);
    const data = { type, ...header, fields, vessel: fields.vessel || '' };
    let msgId = id;
    if (id) await db.messages.update(id, data);
    else {
      msgId = (await db.messages.create({ ...data, status: 'brouillon' })).id;
      await db.settings.update(settings.id, { next_number: header.number + 1 });
    }
    qc.invalidateQueries();
    navigate(`/message/${msgId}`);
  };

  const message = { type, ...header, fields };
  return (
    <div>
      <Link to={id ? `/message/${id}` : '/rediger'} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Retour</Link>
      <div className="mt-4 mb-8">
        <span className="font-mono text-sm text-primary tracking-wide">{T.name}</span>
        <h1 className="font-heading text-3xl md:text-4xl tracking-tight mt-1">{T.label}</h1>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-8 items-start">
        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-card p-5"><HeaderFields header={header} setHeader={setHeader} isDoc={T.kind === 'document'} /></div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
            {T.fields.map((f) => (
              <FieldInput key={f.key} field={f} value={fields[f.key]} vessels={vessels} onChange={(v) => setFields({ ...fields, [f.key]: v })} />
            ))}
          </div>
          <button onClick={save} disabled={saving} className="w-full rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:opacity-90 disabled:opacity-60 transition inline-flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}Enregistrer le message
          </button>
        </div>
        <div className="lg:sticky lg:top-24">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Aperçu officiel</div>
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm"><MessagePreview message={message} settings={settings} /></div>
        </div>
      </div>
    </div>
  );
}