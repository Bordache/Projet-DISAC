import { useEffect, useState } from 'react';
import { Loader2, FolderDown } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/localDb';
import { MESSAGE_TYPES } from '@/lib/messageTypes';
import { useSettings } from '@/hooks/useUnit';
import { exportToFolder } from '@/lib/exportMessage';
import MessageRow from '@/components/MessageRow';

export default function History() {
  const [type, setType] = useState('all');
  const [items, setItems] = useState(null);
  const [next, setNext] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { data: settings } = useSettings();

  const exportAll = async () => {
    setExporting(true);
    try {
      const all = [];
      let cursor;
      do {
        const page = await db.messages.filter({}, { sort: '-date', limit: 100, cursor });
        all.push(...page.items);
        cursor = page.has_more ? page.next_cursor : null;
      } while (cursor);
      const res = await exportToFolder(all, settings);
      if (res?.aborted) return;
      toast.success(res.folder ? `${res.count} messages enregistrés dans le dossier` : `${res.count} messages téléchargés`);
    } finally {
      setExporting(false);
    }
  };

  const load = async (cursor) => {
    const page = await db.messages.filter(type === 'all' ? {} : { type }, { sort: '-date', limit: 30, cursor });
    setItems((prev) => (cursor ? [...prev, ...page.items] : page.items));
    setNext(page.has_more ? page.next_cursor : null);
  };

  useEffect(() => { setItems(null); load(); }, [type]);

  const chip = (k, label) => (
    <button key={k} onClick={() => setType(k)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-mono transition ${type === k ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>{label}</button>
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-heading text-4xl tracking-tight">Historique</h1>
        <button onClick={exportAll} disabled={exporting} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm disabled:opacity-60">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderDown className="w-4 h-4" />}
          <span className="hidden sm:inline">Exporter dans un dossier</span>
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto mt-6 pb-2 -mx-5 px-5">
        {chip('all', 'TOUS')}
        {Object.entries(MESSAGE_TYPES).map(([k, t]) => chip(k, t.name))}
      </div>
      <div className="rounded-2xl border border-border bg-card px-5 py-2 mt-4">
        {!items && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto my-10" />}
        {items?.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">Aucun message.</p>}
        {items?.map((m) => <MessageRow key={m.id} m={m} />)}
      </div>
      {next && <button onClick={() => load(next)} className="mt-4 mx-auto block text-sm rounded-full border border-border px-5 py-2 hover:bg-secondary">Charger plus</button>}
    </div>
  );
}