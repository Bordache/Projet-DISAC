import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MESSAGE_TYPES } from '@/lib/messageTypes';
import { fmtDate, pad3 } from '@/lib/format';

export default function MessageRow({ m }) {
  const T = MESSAGE_TYPES[m.type];
  return (
    <Link to={`/message/${m.id}`} className="group flex items-center gap-4 py-4 px-1 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors rounded-lg">
      <div className="w-20 sm:w-24 shrink-0">
        <span className="inline-block font-mono text-[11px] tracking-wide px-2 py-1 rounded-md bg-primary/5 text-primary">{T?.name || m.type}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm truncate">{T?.label}</div>
        <div className="text-xs text-muted-foreground font-mono mt-0.5">
          NR {pad3(m.number)} · {fmtDate(m.date)}{m.vessel ? ` · ${m.vessel}` : ''}
        </div>
      </div>
      <span className={`hidden sm:inline text-[11px] px-2 py-0.5 rounded-full ${m.status === 'envoye' ? 'bg-success/10 text-success' : 'bg-accent/15 text-accent-foreground'}`}>
        {m.status === 'envoye' ? 'Envoyé' : 'Brouillon'}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}