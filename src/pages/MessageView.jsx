import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Printer, Pencil, Copy, Trash2, Send, Loader2, Download, ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/localDb';
import { useSettings } from '@/hooks/useUnit';
import { MESSAGE_TYPES } from '@/lib/messageTypes';
import { messageToText, downloadText, fileSlug } from '@/lib/exportMessage';
import MessagePreview from '@/components/message/MessagePreview';

const btn = 'inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition';

export default function MessageView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: settings } = useSettings();
  const { data: m } = useQuery({ queryKey: ['message', id], queryFn: () => db.messages.get(id) });

  if (!m) return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mt-20" />;
  const T = MESSAGE_TYPES[m.type];

  const exportTxt = () => downloadText(`${fileSlug(m)}.txt`, messageToText(m, settings));
  const copyText = async () => {
    await navigator.clipboard.writeText(messageToText(m, settings));
    toast.success('Message copié — prêt à coller dans WhatsApp');
  };

  const toggleSent = async () => {
    await db.messages.update(id, { status: m.status === 'envoye' ? 'brouillon' : 'envoye' });
    qc.invalidateQueries();
  };
  const remove = async () => {
    if (!window.confirm('Supprimer ce message ?')) return;
    await db.messages.delete(id);
    qc.invalidateQueries();
    navigate('/historique');
  };

  return (
    <div>
      <div className="print:hidden">
        <Link to="/historique" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Historique</Link>
        <div className="mt-4 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-sm text-primary tracking-wide">{T?.name}</span>
            <h1 className="font-heading text-3xl tracking-tight mt-1">{T?.label}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className={`${btn} bg-primary text-primary-foreground border-primary hover:bg-primary/90`}><Printer className="w-4 h-4" />PDF / Imprimer</button>
            <button onClick={exportTxt} className={btn}><Download className="w-4 h-4" />Exporter .txt</button>
            <button onClick={copyText} className={btn}><ClipboardCopy className="w-4 h-4" />Copier</button>
            <button onClick={toggleSent} className={btn}><Send className="w-4 h-4" />{m.status === 'envoye' ? 'Envoyé ✓' : 'Marquer envoyé'}</button>
            <Link to={`/rediger/${m.type}?id=${id}`} className={btn}><Pencil className="w-4 h-4" />Modifier</Link>
            <Link to={`/rediger/${m.type}?from=${id}`} className={btn}><Copy className="w-4 h-4" />Reprendre</Link>
            <button onClick={remove} className={`${btn} text-destructive`}><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm print:border-0 print:shadow-none print:p-0">
        <MessagePreview message={m} settings={settings} />
      </div>
    </div>
  );
}