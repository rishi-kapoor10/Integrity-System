import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Radar, 
  FileSearch, 
  FlaskConical, 
  Layers, 
  Calculator, 
  ShieldCheck, 
  FileText, 
  Settings, 
  Activity,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { opportunities, claims, pilots, governanceDebt } = useApp();

  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/opportunities',
      label: 'Opportunity Radar',
      icon: Radar,
      badge: opportunities.length,
    },
    {
      to: '/claims',
      label: 'Claim Intelligence',
      icon: FileSearch,
      badge: `${claims.length}`,
    },
    {
      to: '/solutions',
      label: 'Solution Lab',
      icon: FlaskConical,
      badge: null,
    },
    {
      to: '/pilots',
      label: 'Pilot Portfolio',
      icon: Layers,
      badge: pilots.length,
    },
    {
      to: '/value',
      label: 'Value Realization',
      icon: Calculator,
      badge: null,
    },
    {
      to: '/governance',
      label: 'AI Governance',
      icon: ShieldCheck,
      badge: governanceDebt.totalOpenIssues > 0 ? `${governanceDebt.totalOpenIssues} debt` : null,
      badgeColor: governanceDebt.criticalCount > 0 ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10',
    },
    {
      to: '/briefing',
      label: 'Executive Briefing',
      icon: FileText,
      badge: 'Brief',
      badgeColor: 'text-[#39D6C4] bg-[#39D6C4]/10',
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#11192B] border-r border-slate-800/80 flex flex-col h-full select-none">
      {/* Brand & Wordmark */}
      <div className="px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#39D6C4] to-[#789BFF] flex items-center justify-center shadow-lg shadow-[#39D6C4]/10 shrink-0">
            <Activity className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-100 text-sm">INTEGRITY OS</span>
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded text-[#39D6C4] bg-[#39D6C4]/10 border border-[#39D6C4]/20">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wide font-mono truncate mt-0.5">
              PAYMENT INTEGRITY INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Demo environment pill */}
        <div className="mt-3 py-1 px-2 rounded bg-[#0B1020]/90 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            SYNTHETIC DATA
          </span>
          <span className="font-mono text-slate-500">DEMO ENV</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Innovation Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#39D6C4]/15 text-[#39D6C4] border border-[#39D6C4]/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  item.badgeColor || 'text-slate-400 bg-slate-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Strategic Focus Box at Bottom */}
      <div className="p-3.5 m-3 rounded-lg bg-[#0B1020]/80 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-[#39D6C4] font-semibold text-[11px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Assistant Manager Portfolio</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          AI Strategy & Innovation Decision Support · EXL Healthcare Payment Integrity Context
        </p>
      </div>
    </aside>
  );
};
