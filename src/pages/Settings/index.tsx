import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_WEIGHTS } from '../../utils/calculations';
import { formatINR } from '../../utils/formatting';
import { 
  Settings, 
  RotateCcw, 
  Sliders, 
  DollarSign, 
  ShieldAlert, 
  Info, 
  BookOpen, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const SettingsPage: React.FC = () => {
  const { 
    prioritizationWeights, 
    updatePrioritizationWeights, 
    currencyMode, 
    setCurrencyMode, 
    resetDemoData, 
    showToast 
  } = useApp();

  const [weightsDraft, setWeightsDraft] = useState(prioritizationWeights);
  const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);

  const sumWeights = 
    weightsDraft.businessImpact + 
    weightsDraft.feasibility + 
    weightsDraft.dataReadiness + 
    weightsDraft.strategicAlignment + 
    weightsDraft.timeToValue;

  const handleSaveWeights = () => {
    if (sumWeights !== 100) {
      showToast('Validation Error', 'Weights must sum to exactly 100%.', 'error');
      return;
    }
    updatePrioritizationWeights(weightsDraft);
    showToast('Settings Saved', 'Prioritization weights updated.', 'success');
  };

  const handleResetWeightsToDefault = () => {
    setWeightsDraft(DEFAULT_WEIGHTS);
    updatePrioritizationWeights(DEFAULT_WEIGHTS);
    showToast('Default Restored', 'Restored default 30-20-20-15-15 weights.', 'info');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#39D6C4]" />
          System Settings, Methodology & Data Management
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure model parameters, scoring weight distribution, review methodology formulas, and reset sandbox data.
        </p>
      </div>

      {/* Section 1: Prioritization Weights Engine */}
      <div className="bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#39D6C4]" />
              Opportunity Scoring Formula Weights
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              The engine ranks candidate initiatives using a normalized linear combination. Weights must sum to 100%.
            </p>
          </div>
          <span className={`text-xs font-mono font-bold ${sumWeights === 100 ? 'text-[#39D6C4]' : 'text-rose-400'}`}>
            Total: {sumWeights}% / 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Business Impact:</span>
              <span className="font-mono text-[#39D6C4]">{weightsDraft.businessImpact}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={weightsDraft.businessImpact}
              onChange={(e) => setWeightsDraft({ ...weightsDraft, businessImpact: Number(e.target.value) })}
              className="w-full accent-[#39D6C4]"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Tech Feasibility:</span>
              <span className="font-mono text-[#39D6C4]">{weightsDraft.feasibility}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={weightsDraft.feasibility}
              onChange={(e) => setWeightsDraft({ ...weightsDraft, feasibility: Number(e.target.value) })}
              className="w-full accent-[#39D6C4]"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Data Readiness:</span>
              <span className="font-mono text-[#39D6C4]">{weightsDraft.dataReadiness}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={weightsDraft.dataReadiness}
              onChange={(e) => setWeightsDraft({ ...weightsDraft, dataReadiness: Number(e.target.value) })}
              className="w-full accent-[#39D6C4]"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Strategic Alignment:</span>
              <span className="font-mono text-[#39D6C4]">{weightsDraft.strategicAlignment}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={weightsDraft.strategicAlignment}
              onChange={(e) => setWeightsDraft({ ...weightsDraft, strategicAlignment: Number(e.target.value) })}
              className="w-full accent-[#39D6C4]"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Time to Value:</span>
              <span className="font-mono text-[#39D6C4]">{weightsDraft.timeToValue}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={weightsDraft.timeToValue}
              onChange={(e) => setWeightsDraft({ ...weightsDraft, timeToValue: Number(e.target.value) })}
              className="w-full accent-[#39D6C4]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            onClick={handleResetWeightsToDefault}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSaveWeights}
            disabled={sumWeights !== 100}
            className="px-4 py-1.5 rounded-lg bg-[#39D6C4] disabled:opacity-50 text-slate-950 font-semibold text-xs"
          >
            Save Formula
          </button>
        </div>
      </div>

      {/* Section 2: Preferences & Formatting */}
      <div className="bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
          <DollarSign className="w-3.5 h-3.5 text-[#39D6C4]" />
          Display Preferences & Currency Formatting
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#0B1020] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block">Currency Notation:</span>
              <span className="text-[11px] text-slate-400">Indian Rupee (INR) format across all modules</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setCurrencyMode('INR_COMPACT')}
                className={`px-2.5 py-1 rounded text-xs font-mono ${currencyMode === 'INR_COMPACT' ? 'bg-[#39D6C4] text-slate-950 font-semibold' : 'text-slate-400'}`}
              >
                ₹ Lakhs / Cr
              </button>
              <button
                onClick={() => setCurrencyMode('INR_FULL')}
                className={`px-2.5 py-1 rounded text-xs font-mono ${currencyMode === 'INR_FULL' ? 'bg-[#39D6C4] text-slate-950 font-semibold' : 'text-slate-400'}`}
              >
                ₹ Full Numbers
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1020] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block">Risk Banding Cutoffs:</span>
              <span className="text-[11px] text-slate-400">High: ≥ 75 | Medium: 45-74 | Low: &lt; 45</span>
            </div>
            <span className="text-xs font-mono text-[#39D6C4]">Deterministic Thresholds</span>
          </div>
        </div>
      </div>

      {/* Section 3: Methodology Documentation & Core Principles */}
      <div className="bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
          <BookOpen className="w-3.5 h-3.5 text-[#39D6C4]" />
          Integrity OS Methodology & Five Executive Questions
        </h3>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-lg bg-[#0B1020] border border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-[#39D6C4] font-mono">The Core Product Principle:</h4>
            <p>
              <strong>"Every AI initiative must connect a business problem, an evidence trail, a measurable hypothesis, an accountable owner, and a scale-or-stop decision."</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0B1020] border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 font-mono">1. Where are the opportunities?</span>
              <p className="text-slate-400 text-[11px]">
                Discovered via historical audit discrepancies, clearinghouse claim velocity outliers, and unbundling pattern analysis in Claim Intelligence.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0B1020] border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 font-mono">2. Which to solve first?</span>
              <p className="text-slate-400 text-[11px]">
                Ranked via transparent weighted scoring (Impact 30%, Feasibility 20%, Data 20%, Strategy 15%, Time 15%), documented with clear "Why this, why now?" trade-offs.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0B1020] border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 font-mono">3. Which solution is most suitable?</span>
              <p className="text-slate-400 text-[11px]">
                Rules vs Automation vs SQL vs ML vs Document AI vs Hybrid. Simple deterministic rules are preferred whenever adequate, avoiding unnecessary AI complexity.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0B1020] border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 font-mono">4. Is it delivering measurable value?</span>
              <p className="text-slate-400 text-[11px]">
                Empirical pilots test baseline vs target vs observed metrics. Value Realization separates potential opportunity, modeled net savings, and realized in-bank yield.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Data Management & Reset Sandbox */}
      <div className="bg-[#11192B] border border-rose-900/40 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-semibold text-rose-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              Demo Data Lifecycle & Environment Reset
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Reset all synthetic opportunities, claims, pilots, and governance records stored in your browser's local storage.
            </p>
          </div>
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Section 5: Synthetic Data & Non-Affiliation Disclaimer */}
      <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold font-mono">
          <ShieldAlert className="w-4 h-4 text-[#39D6C4]" />
          <span>PORTFOLIO DEMO PROTOTYPE DISCLAIMER</span>
        </div>
        <p className="leading-relaxed">
          <strong>Integrity OS</strong> is an independent frontend product prototype created for portfolio demonstration of the Assistant Manager — AI Strategy & Innovation role within Healthcare Payment Integrity.
        </p>
        <p className="leading-relaxed text-[11px] text-slate-500">
          • All organizations (Aegis Health Plan), hospital providers, patient claims, diagnoses, amounts, model scores, and pilot metrics are purely fictional and synthetic.<br />
          • Contains zero real Protected Health Information (PHI) or patient identifiable records.<br />
          • Does not represent an official EXL product or endorse specific commercial results or clinical findings.<br />
          • Runs entirely on client-side state without external paid APIs or cloud databases.
        </p>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Entire Demo State?"
        message="Are you sure you want to restore the initial synthetic dataset? All newly created opportunities, claim edits, pilot updates, and governance issues stored in your browser will be overwritten."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Current State"
        isDestructive={true}
        onConfirm={() => {
          resetDemoData();
          setWeightsDraft(DEFAULT_WEIGHTS);
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
};
