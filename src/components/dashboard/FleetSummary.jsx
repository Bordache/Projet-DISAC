import { Link } from 'react-router-dom';
import { useVessels } from '@/hooks/useUnit';

export default function FleetSummary() {
  const { data: vessels = [] } = useVessels();
  return (
    <section className="rounded-2xl bg-primary text-primary-foreground p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-xl">Flotte</h2>
        <Link to="/flotte" className="text-xs opacity-70 hover:opacity-100">Gérer →</Link>
      </div>
      <div className="mt-5 space-y-4">
        {vessels.length === 0 && <p className="text-sm opacity-70">Aucun bâtiment enregistré.</p>}
        {vessels.map((v) => (
          <div key={v.id} className="flex items-start gap-3">
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${v.status === 'disponible' ? 'bg-success' : 'bg-destructive'}`} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <span className="font-medium">{v.name}</span>
                <span className="font-mono text-xs opacity-70">VB {v.vb ?? 0}%</span>
              </div>
              <div className="text-xs opacity-65 truncate">{v.situation || (v.status === 'disponible' ? 'Disponible' : 'Indisponible')}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}