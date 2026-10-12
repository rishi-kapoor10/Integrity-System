import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { X, AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const { isNotificationsOpen, setNotificationsOpen, executiveInsights, governanceDebt } = useApp();
  const navigate = useNavigate();

  if (!isNotificationsOpen) return null;

  const handleActionClick = (route: string) => {
    setNotificationsOpen(false);
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setNotificationsOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#11192B] border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0B1020]/70">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Action Items & Strategic Alerts
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#39D6C4]/10 text-[#39D6C4] font-mono">
                {executiveInsights.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Deterministic operational signals from active claims & pilots
            </p>
          </div>
          <button
            onClick={() => setNotificationsOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1"
            aria-label="Close notifications drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Governance Debt Quick Banner */}
        <div className="p-3.5 mx-4 mt-4 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Portfolio Governance Debt</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
              governanceDebt.criticalCount > 0 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {governanceDebt.severitySummary} Status
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
            <div className="p-1.5 rounded bg-slate-800/60">
              <span className="block font-mono font-bold text-rose-400">{governanceDebt.criticalCount}</span>
              <span className="text-[10px] text-slate-400">Critical</span>
            </div>
            <div className="p-1.5 rounded bg-slate-800/60">
              <span className="block font-mono font-bold text-amber-400">{governanceDebt.highCount}</span>
              <span className="text-[10px] text-slate-400">High</span>
            </div>
            <div className="p-1.5 rounded bg-slate-800/60">
              <span className="block font-mono font-bold text-slate-300">{governanceDebt.totalOpenIssues}</span>
              <span className="text-[10px] text-slate-400">Total Open</span>
            </div>
          </div>
        </div>

        {/* Insights list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {executiveInsights.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No outstanding alerts. All pilots and governance gates are on track.
            </div>
          ) : (
            executiveInsights.map((insight) => {
              let Icon = Info;
              let border = 'border-sky-500/20 bg-sky-500/5';
              let badgeColor = 'text-sky-400';

              if (insight.type === 'critical') {
                Icon = AlertCircle;
                border = 'border-rose-500/30 bg-rose-500/5';
                badgeColor = 'text-rose-400';
              } else if (insight.type === 'warning') {
                Icon = AlertTriangle;
                border = 'border-amber-500/30 bg-amber-500/5';
                badgeColor = 'text-amber-400';
              } else {
                badgeColor = 'text-[#39D6C4]';
                border = 'border-[#39D6C4]/20 bg-[#39D6C4]/5';
              }

              return (
                <div
                  key={insight.id}
                  className={`p-3.5 rounded-lg border ${border} transition-all duration-150 flex flex-col gap-2`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={`w-4 h-4 ${badgeColor} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 leading-snug">
                        {insight.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {insight.observation}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#0B1020]/60 border border-slate-800/80 text-[11px] text-slate-300">
                    <span className="font-semibold text-slate-200">Recommended Action: </span>
                    {insight.suggestedAction}
                  </div>

                  <button
                    onClick={() => handleActionClick(insight.targetRoute)}
                    className="self-end inline-flex items-center gap-1.5 text-xs text-[#39D6C4] hover:text-[#39D6C4]/80 font-medium transition-colors pt-1"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0B1020]/70 text-center text-[11px] text-slate-500">
          Synthetic Evaluation Environment · AI Innovation Operations
        </div>
      </div>
    </div>
  );
};
