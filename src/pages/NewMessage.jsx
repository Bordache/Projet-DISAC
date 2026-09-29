import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { GROUPS, MESSAGE_TYPES } from '@/lib/messageTypes';

export default function NewMessage() {
  return (
    <div>
      <h1 className="font-heading text-4xl tracking-tight">Rédiger</h1>
      <p className="text-muted-foreground mt-2">Choisissez le type de message prévu par la DISAC.</p>
      <div className="mt-10 space-y-10">
        {GROUPS.map((g) => (
          <section key={g.key}>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="font-heading text-xl">{g.title}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(MESSAGE_TYPES).filter(([, t]) => t.group === g.key).map(([code, t]) => (
                <Link key={code} to={`/rediger/${code}`} className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-sm tracking-wide text-primary">{t.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-sm mt-3">{t.label}</div>
                  {t.due && <div className="text-xs text-muted-foreground mt-2">Tous les {t.due.toLowerCase()}s</div>}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
