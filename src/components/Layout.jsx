import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PenLine, Archive, Ship, Settings, Anchor, HelpCircle } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Tableau', icon: LayoutDashboard },
  { to: '/rediger', label: 'Rédiger', icon: PenLine },
  { to: '/historique', label: 'Historique', icon: Archive },
  { to: '/flotte', label: 'Flotte', icon: Ship },
  { to: '/parametres', label: 'Unité', icon: Settings },
  { to: '/aide', label: 'Aide', icon: HelpCircle },
];

const linkCls = ({ isActive }) =>
  `flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-full text-[11px] md:text-sm transition-colors ${
    isActive ? 'text-primary md:bg-primary md:text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
  }`;

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="print:hidden sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center">
              <Anchor className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="font-heading text-lg tracking-tight">DISAC</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Registre des messages</div>
            </div>
          </div>
          <nav className="hidden md:flex gap-1">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={linkCls}>
                <n.icon className="w-4 h-4" />{n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 pt-8 pb-28 md:pb-16 print:p-0 print:max-w-none">
        <Outlet />
      </main>
      <nav className="print:hidden md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border flex justify-around py-1.5">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={linkCls}>
            <n.icon className="w-5 h-5" />{n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}