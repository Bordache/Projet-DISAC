import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PenLine } from 'lucide-react';
import { db } from '@/lib/localDb';
import { useSettings } from '@/hooks/useUnit';
import Deadlines from '@/components/dashboard/Deadlines';
import FleetSummary from '@/components/dashboard/FleetSummary';
import MessageRow from '@/components/MessageRow';

export default function Dashboard() {
  const { data: settings } = useSettings();
  const { data: recent = [] } = useQuery({
    queryKey: ['recent'],
    queryFn: async () => (await db.messages.filter({}, { sort: '-created_date', limit: 5 })).items,
  });
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{settings?.origin || 'Commandant'}</div>
          <h1 className="font-heading text-4xl md:text-5xl tracking-tight mt-2">{settings?.unit_name || 'Tableau de bord'}</h1>
        </div>
        <Link to="/rediger" className="inline-flex items-center gap-2 self-start rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm hover:opacity-90 transition">
          <PenLine className="w-4 h-4" /> Nouveau message
        </Link>
      </div>
      <Deadlines />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="min-w-0 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-heading text-xl">Derniers messages</h2>
            <Link to="/historique" className="text-xs text-muted-foreground hover:text-foreground">Tout voir →</Link>
          </div>
          {recent.length === 0 ? <p className="text-sm text-muted-foreground py-6">Aucun message pour l'instant.</p> : recent.map((m) => <MessageRow key={m.id} m={m} />)}
        </section>
        <FleetSummary />
      </div>
    </div>
  );
}