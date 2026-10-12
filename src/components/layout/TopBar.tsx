import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Bell, RotateCcw, Menu, Shield, User } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { 
    title: 'Executive Innovation Command Center', 
    subtitle: 'Strategic overview of payment integrity leakage, active pilots, and value realization' 
  },
  '/opportunities': { 
    title: 'Opportunity Radar', 
    subtitle: 'Discovery, transparent prioritization, and weighted scoring of payment integrity leakage' 
  },
  '/claims': { 
    title: 'Claim Intelligence Workbench', 
    subtitle: 'Investigate synthetic claims, model risk signals, audit feature triggers, and take actions' 
  },
  '/solutions': { 
    title: 'Solution Lab', 
    subtitle: 'Evaluate competing architectures: Rules vs Automation vs ML vs Document AI vs Hybrid' 
  },
  '/pilots': { 
    title: 'Pilot Portfolio & Proof-of-Concepts', 
    subtitle: 'Track live pilots, milestone completion, budget utilization, and enforce the scale gate' 
  },
  '/value': { 
    title: 'Value Realization Studio', 
    subtitle: 'Interactive commercial financial model, multi-year NPV, and detection sensitivity' 
  },
  '/governance': { 
    title: 'AI Governance & Risk Docket', 
    subtitle: 'Responsible AI oversight, model limitations, human-in-the-loop controls, and governance debt' 
  },
  '/briefing': { 
    title: 'Executive Briefing Generator', 
    subtitle: 'Deterministic leadership memos, investment committee decks, and scale recommendations' 
  },
  '/settings': { 
    title: 'System Settings & Methodology', 
    subtitle: 'Calibrate prioritization weights, configure currency formatting, and manage demo data' 
  },
};

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const { 
    setSearchOpen, 
    setNotificationsOpen, 
    executiveInsights, 
    governanceDebt,
    resetDemoData,
    currencyMode,
    setCurrencyMode 
  } = useApp();
  
  const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  const currentMeta = SECTION_TITLES[location.pathname] || {
    title: 'Integrity OS',
    subtitle: 'Payment Integrity Innovation Platform',
  };

  return (
    <>
      <header className="h-16 bg-[#11192B]/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Left: Mobile Toggle + Breadcrumb Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-100 truncate flex items-center gap-2">
              <span>{currentMeta.title}</span>
              <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-600" />
              <span className="hidden md:inline-block text-xs font-normal text-slate-400 truncate">
                {currentMeta.subtitle}
              </span>
            </h1>
          </div>
        </div>

        {/* Right: Actions, Search, Alerts, Reset, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
            title="Global Search (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search records</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Currency compact toggle */}
          <button
            onClick={() => setCurrencyMode(currencyMode === 'INR_COMPACT' ? 'INR_FULL' : 'INR_COMPACT')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 font-mono transition-colors"
            title="Toggle compact currency format"
          >
            <span>₹</span>
            <span className="text-[10px] text-slate-400">{currencyMode === 'INR_COMPACT' ? 'Compact' : 'Full'}</span>
          </button>

          {/* Notifications & Review Alert Button */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            aria-label="View notifications and action items"
          >
            <Bell className="w-4 h-4" />
            {executiveInsights.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-mono font-bold text-slate-950 flex items-center justify-center shadow-md">
                {executiveInsights.length}
              </span>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-xs transition-colors"
            title="Reset to initial synthetic dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Reset Data</span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-800"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-[#39D6C4]/30 flex items-center justify-center text-xs font-semibold text-[#39D6C4] border border-[#39D6C4]/30">
                RK
              </div>
              <div className="hidden lg:block text-left text-xs leading-none">
                <span className="font-semibold text-slate-200 block">Rishi Kapoor</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">AI Strategy Lead</span>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#11192B] border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs animate-in fade-in duration-100">
                <div className="border-b border-slate-800 pb-2 mb-2">
                  <p className="font-semibold text-slate-100">Rishi Kapoor</p>
                  <p className="text-[11px] text-slate-400">Assistant Manager — AI Strategy & Innovation</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Payment Integrity Excellence</p>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex items-center justify-between py-1">
                    <span>Role Access:</span>
                    <span className="font-mono text-[#39D6C4]">Innovation Lead</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Governance Status:</span>
                    <span className="font-mono text-amber-400">{governanceDebt.severitySummary}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Data Classification:</span>
                    <span className="font-mono text-slate-400">Synthetic Only</span>
                  </div>
                </div>
                <div className="border-t border-slate-800 mt-2 pt-2 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setResetConfirmOpen(true);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Reset Demo State
                  </button>
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Demo Environment?"
        message="This will restore all opportunities, synthetic claims, pilots, governance records, and financial assumptions to the initial default state. Any changes saved to your browser's local storage will be overwritten."
        confirmLabel="Reset All Data"
        cancelLabel="Keep Current State"
        isDestructive={true}
        onConfirm={() => {
          resetDemoData();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </>
  );
};
