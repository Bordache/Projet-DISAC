import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Clock } from 'lucide-react';
import { db } from '@/lib/localDb';
import { MESSAGE_TYPES } from '@/lib/messageTypes';
import { weekRange, fmtDate } from '@/lib/format';

const DUE = ['CRHSBE', 'CRHTER', 'CRHAS'];

export default function Deadlines() {
  const { monday, sunday } = weekRange();
  const { data: counts } = useQuery({
    queryKey: ['deadlines', monday],
    queryFn: () => Promise.all(DUE.map((type) => db.messages.count({ type, date: { $gte: monday, $lte: sunday } }))),
  });
  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-heading text-xl">Cette semaine</h2>
        <span className="text-xs text-muted-foreground font-mono">{fmtDate(monday)} → {fmtDate(sunday)}</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {DUE.map((type, i) => {
          const T = MESSAGE_TYPES[type];
          const done = counts?.[i] > 0;
          return (
            <Link key={type} to={`/rediger/${type}`} className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm tracking-wide text-primary">{T.name}</span>
                {counts && (done
                  ? <span className="flex items-center gap-1 text-[11px] text-success"><Check className="w-3.5 h-3.5" />Établi</span>
                  : <span className="flex items-center gap-1 text-[11px] text-accent"><Clock className="w-3.5 h-3.5" />À établir</span>)}
              </div>
              <div className="text-sm mt-3 leading-snug">{T.label}</div>
              <div className="text-xs text-muted-foreground mt-2">Échéance : {T.due}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}