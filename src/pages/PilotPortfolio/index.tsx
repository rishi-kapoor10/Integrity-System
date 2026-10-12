import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Pilot, PilotStage, PilotStatus, SolutionType, ScaleReadinessChecklist } from '../../types';
import { evaluateScaleReadiness } from '../../utils/calculations';
import { formatINR, formatPercent, formatDate, getStageClass } from '../../utils/formatting';
import { 
  Layers, 
  Plus, 
  Kanban, 
  Table as TableIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Unlock,
  Sparkles,
  FileText
} from 'lucide-react';

export const PilotPortfolioPage: React.FC = () => {
  const { 
    pilots, 
    opportunities, 
    governanceRecords, 
    createPilot, 
    updatePilot, 
    updateScaleReadiness,
    showToast 
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(pilots[0] || null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Kanban columns
  const kanbanStages: PilotStage[] = [
    'Design',
    'Data Ingestion',
    'Shadow Mode',
    'Active Review',
    'Evaluation',
    'Completed',
  ];

  // Evaluate scale readiness for selected pilot
  const linkedGov = useMemo(() => {
    if (!selectedPilot) return undefined;
    return governanceRecords.find(g => g.opportunityId === selectedPilot.opportunityId);
  }, [governanceRecords, selectedPilot]);

  const scaleGateEvaluation = useMemo(() => {
    if (!selectedPilot) return null;
    return evaluateScaleReadiness(selectedPilot, linkedGov);
  }, [selectedPilot, linkedGov]);

  // Create pilot form state
  const [newPilotForm, setNewPilotForm] = useState({
    title: '',
    opportunityId: opportunities[0]?.id || 'OPP-101',
    solutionType: 'ML Risk Scoring' as SolutionType,
    businessOwner: 'Rishi Kapoor, Innovation Strategy Lead',
    technicalOwner: 'Rahul Deshmukh, Lead Data Scientist',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: '2026-11-30',
    stage: 'Design' as PilotStage,
    status: 'On Track' as PilotStatus,
    budget: 2500000,
    actualSpend: 350000,
    hypothesis: 'Deploying targeted algorithmic pre-pay detection will elevate precision from 40% to >=75% while cutting manual review minutes by 40%.',
    baselineDetection: 40.0,
    targetDetection: 75.0,
    baselineReviewMins: 40,
    targetReviewMins: 20,
    baselineDiscrepancy: 1000000,
    targetDiscrepancy: 3500000,
  });

  const handleCreatePilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPilotForm.title) {
      showToast('Validation Error', 'Pilot title is required.', 'error');
      return;
    }

    const created = createPilot({
      title: newPilotForm.title,
      opportunityId: newPilotForm.opportunityId,
      solutionId: `SOL-${newPilotForm.opportunityId}-CUSTOM`,
      solutionType: newPilotForm.solutionType,
      businessOwner: newPilotForm.businessOwner,
      technicalOwner: newPilotForm.technicalOwner,
      startDate: newPilotForm.startDate,
      targetCompletionDate: newPilotForm.targetCompletionDate,
      stage: newPilotForm.stage,
      status: newPilotForm.status,
      budget: Number(newPilotForm.budget),
      actualSpend: Number(newPilotForm.actualSpend),
      hypothesis: newPilotForm.hypothesis,
      baselineMetrics: {
        detectionRate: Number(newPilotForm.baselineDetection),
        falsePositiveRate: 100 - Number(newPilotForm.baselineDetection),
        reviewTimeMinutes: Number(newPilotForm.baselineReviewMins),
        monthlyIdentifiedDiscrepancy: Number(newPilotForm.baselineDiscrepancy),
      },
      targetMetrics: {
        detectionRate: Number(newPilotForm.targetDetection),
        falsePositiveRate: 100 - Number(newPilotForm.targetDetection),
        reviewTimeMinutes: Number(newPilotForm.targetReviewMins),
        monthlyIdentifiedDiscrepancy: Number(newPilotForm.targetDiscrepancy),
      },
      observedMetrics: {
        detectionRate: null,
        falsePositiveRate: null,
        reviewTimeMinutes: null,
        monthlyIdentifiedDiscrepancy: null,
        claimsProcessed: 0,
      },
      keyFindings: ['Pilot commissioned in sandbox environment.'],
      risks: ['Initial data pipeline ingestion testing.'],
      dependencies: ['Payer EDI feed configuration.'],
      milestones: [
        { id: 'M-1', title: 'Data Ingestion & Pipeline Configuration', targetDate: '2026-10-15', status: 'Pending' },
        { id: 'M-2', title: 'Initial Shadow Adjudication Run', targetDate: '2026-11-01', status: 'Pending' },
      ],
      recommendedDecision: 'Optimize & Iterate',
      decisionRationale: 'Newly commissioned proof-of-concept awaiting initial data validation.',
      scaleReadiness: {
        measurableHypothesisExists: true,
        baselineDataAvailable: true,
        pilotResultsRecorded: false,
        financialAssumptionsReviewed: false,
        relevantRisksDocumented: true,
        governanceApprovalRecorded: false,
        businessOwnerAccepted: true,
      },
    });

    setCreateModalOpen(false);
    setSelectedPilot(created);
  };

  const handleToggleChecklist = (key: keyof ScaleReadinessChecklist, currentVal: boolean) => {
    if (!selectedPilot) return;
    updateScaleReadiness(selectedPilot.id, { [key]: !currentVal });
    setSelectedPilot({
      ...selectedPilot,
      scaleReadiness: {
        ...selectedPilot.scaleReadiness,
        [key]: !currentVal,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#39D6C4]" />
            Pilot Portfolio & Proof-of-Concept Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor empirical pilot experiments, track milestone completion, and enforce strict scale-readiness gates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-[#39D6C4]/15 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-[#39D6C4]/15 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#39D6C4] hover:bg-[#39D6C4]/90 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Commission Pilot</span>
          </button>
        </div>
      </div>

      {/* Main View: Kanban vs Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-2">
          {kanbanStages.map((stage) => {
            const stagePilots = pilots.filter(p => p.stage === stage);
            return (
              <div 
                key={stage}
                className="bg-[#11192B] border border-slate-800/80 rounded-xl p-3 flex flex-col min-w-[200px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/70 text-xs">
                  <span className="font-semibold text-slate-300 font-mono text-[11px] uppercase">
                    {stage}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {stagePilots.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {stagePilots.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-[11px] italic">
                      No pilots in {stage.toLowerCase()}
                    </div>
                  ) : (
                    stagePilots.map((p) => {
                      const isSelected = selectedPilot?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPilot(p)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-[#172238] border-[#39D6C4] shadow-md shadow-[#39D6C4]/10' 
                              : 'bg-[#0B1020]/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span className="font-mono font-semibold text-[#39D6C4]">{p.id}</span>
                            <span className={`px-1.5 py-0.2 rounded font-mono ${getStageClass(p.status)}`}>
                              {p.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-slate-200 mt-1 line-clamp-2">
                            {p.title}
                          </h4>

                          <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400">
                            <div className="flex justify-between">
                              <span>Budget:</span>
                              <span className="font-mono text-slate-300">{formatINR(p.budget, true)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Observed:</span>
                              <span className="font-mono text-[#39D6C4]">
                                {p.observedMetrics.detectionRate !== null ? `${p.observedMetrics.detectionRate}%` : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#11192B] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0B1020] text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-4">Pilot ID</th>
                <th className="py-3 px-4">Title / Hypothesis</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Solution</th>
                <th className="py-3 px-4 text-right">Budget Spend</th>
                <th className="py-3 px-4 text-right">Detection Rate</th>
                <th className="py-3 px-4">Next Milestone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pilots.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPilot(p)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    selectedPilot?.id === p.id ? 'bg-slate-800/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-semibold text-[#39D6C4]">{p.id}</td>
                  <td className="py-3 px-4 max-w-xs">
                    <span className="font-semibold text-slate-200 block truncate">{p.title}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{p.hypothesis}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-300">{p.stage}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${getStageClass(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{p.solutionType}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-200">
                    {formatINR(p.actualSpend, true)} / {formatINR(p.budget, true)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#39D6C4]">
                    {p.observedMetrics.detectionRate !== null ? formatPercent(p.observedMetrics.detectionRate) : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {p.milestones.find(m => m.status === 'Pending')?.title || 'All Completed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Pilot Detail & Strict Scale Gate View */}
      {selectedPilot && (
        <div className="bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-6 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#39D6C4] px-2 py-0.5 rounded bg-[#39D6C4]/10">
                  {selectedPilot.id}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${getStageClass(selectedPilot.stage)}`}>
                  {selectedPilot.stage}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${getStageClass(selectedPilot.status)}`}>
                  {selectedPilot.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedPilot.solutionType}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mt-1.5">
                {selectedPilot.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                {selectedPilot.hypothesis}
              </p>
            </div>

            {/* Budget Utilization Widget */}
            <div className="shrink-0 p-3 rounded-lg bg-[#0B1020]/80 border border-slate-800 text-right min-w-[200px]">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Budget Burn</span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {formatINR(selectedPilot.actualSpend, true)} <span className="text-slate-500 font-normal">/ {formatINR(selectedPilot.budget, true)}</span>
              </span>
              <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, (selectedPilot.actualSpend / selectedPilot.budget) * 100)}%` }} 
                  className={`h-full ${selectedPilot.actualSpend > selectedPilot.budget ? 'bg-rose-500' : 'bg-[#39D6C4]'}`}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                {formatPercent((selectedPilot.actualSpend / selectedPilot.budget) * 100, 0)} utilized
              </span>
            </div>
          </div>

          {/* Baseline vs Target vs Observed Performance Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-3">
              Empirical Performance Validation: Baseline vs Target vs Observed
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Metric 1: Detection Precision */}
              <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Detection Precision</span>
                <div className="mt-2 space-y-1 font-mono">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Baseline:</span>
                    <span>{formatPercent(selectedPilot.baselineMetrics.detectionRate)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Target:</span>
                    <span>{formatPercent(selectedPilot.targetMetrics.detectionRate)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-[#39D6C4] pt-1 border-t border-slate-800">
                    <span>Observed:</span>
                    <span>{selectedPilot.observedMetrics.detectionRate !== null ? formatPercent(selectedPilot.observedMetrics.detectionRate) : 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Metric 2: False Positive Rate */}
              <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">False Positive Rate</span>
                <div className="mt-2 space-y-1 font-mono">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Baseline:</span>
                    <span>{formatPercent(selectedPilot.baselineMetrics.falsePositiveRate)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Target Max:</span>
                    <span>{formatPercent(selectedPilot.targetMetrics.falsePositiveRate)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-amber-400 pt-1 border-t border-slate-800">
                    <span>Observed:</span>
                    <span>{selectedPilot.observedMetrics.falsePositiveRate !== null ? formatPercent(selectedPilot.observedMetrics.falsePositiveRate) : 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Metric 3: Review Time */}
              <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Review Time / Claim</span>
                <div className="mt-2 space-y-1 font-mono">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Baseline:</span>
                    <span>{selectedPilot.baselineMetrics.reviewTimeMinutes} mins</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Target:</span>
                    <span>{selectedPilot.targetMetrics.reviewTimeMinutes} mins</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-400 pt-1 border-t border-slate-800">
                    <span>Observed:</span>
                    <span>{selectedPilot.observedMetrics.reviewTimeMinutes !== null ? `${selectedPilot.observedMetrics.reviewTimeMinutes} mins` : 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Metric 4: Monthly Recovery Identified */}
              <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Identified Leakage / Month</span>
                <div className="mt-2 space-y-1 font-mono">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Baseline:</span>
                    <span>{formatINR(selectedPilot.baselineMetrics.monthlyIdentifiedDiscrepancy, true)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Target:</span>
                    <span>{formatINR(selectedPilot.targetMetrics.monthlyIdentifiedDiscrepancy, true)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-[#39D6C4] pt-1 border-t border-slate-800">
                    <span>Observed:</span>
                    <span>{selectedPilot.observedMetrics.monthlyIdentifiedDiscrepancy !== null ? formatINR(selectedPilot.observedMetrics.monthlyIdentifiedDiscrepancy, true) : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* THE SCALE READINESS GATE (Mandatory Checklist Enforcer) */}
          <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {scaleGateEvaluation?.isScaleReady ? (
                  <Unlock className="w-4 h-4 text-[#39D6C4]" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400" />
                )}
                <div>
                  <h4 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider">
                    Scale-Readiness Gate: Mandatory Governance & Operational Prerequisites
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    A favorable performance score does NOT equal scale readiness. All 7 conditions must pass.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                  scaleGateEvaluation?.isScaleReady
                    ? 'bg-[#39D6C4]/15 text-[#39D6C4] border border-[#39D6C4]/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}>
                  {scaleGateEvaluation?.completedCount} / {scaleGateEvaluation?.totalRequirements} Gates Verified
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {/* Gate 1 */}
              <div 
                onClick={() => handleToggleChecklist('measurableHypothesisExists', selectedPilot.scaleReadiness.measurableHypothesisExists)}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox"
                  checked={selectedPilot.scaleReadiness.measurableHypothesisExists}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#39D6C4]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-200 block">1. Measurable Business Hypothesis</span>
                  <span className="text-[11px] text-slate-400">Clear hypothesis and quantifiable target KPIs agreed in advance.</span>
                </div>
              </div>

              {/* Gate 2 */}
              <div 
                onClick={() => handleToggleChecklist('baselineDataAvailable', selectedPilot.scaleReadiness.baselineDataAvailable)}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox"
                  checked={selectedPilot.scaleReadiness.baselineDataAvailable}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#39D6C4]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-200 block">2. Baseline Historical Data Available</span>
                  <span className="text-[11px] text-slate-400">Pre-pilot audit benchmark error rates and review durations verified.</span>
                </div>
              </div>

              {/* Gate 3 */}
              <div 
                onClick={() => handleToggleChecklist('pilotResultsRecorded', selectedPilot.scaleReadiness.pilotResultsRecorded)}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox"
                  checked={selectedPilot.scaleReadiness.pilotResultsRecorded}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#39D6C4]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-200 block">3. Empirical Pilot Results Recorded</span>
                  <span className="text-[11px] text-slate-400">Observed detection precision and chart review times logged in database.</span>
                </div>
              </div>

              {/* Gate 4 */}
              <div 
                onClick={() => handleToggleChecklist('financialAssumptionsReviewed', selectedPilot.scaleReadiness.financialAssumptionsReviewed)}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox"
                  checked={selectedPilot.scaleReadiness.financialAssumptionsReviewed}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#39D6C4]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-200 block">4. Financial Assumptions Formally Reviewed</span>
                  <span className="text-[11px] text-slate-400">Realization rate, labor capacity, and ongoing OpEx reconciled with finance.</span>
                </div>
              </div>

              {/* Gate 5 */}
              <div 
                onClick={() => handleToggleChecklist('relevantRisksDocumented', selectedPilot.scaleReadiness.relevantRisksDocumented)}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox"
                  checked={selectedPilot.scaleReadiness.relevantRisksDocumented}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#39D6C4]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-200 block">5. Operational & Provider Risks Cataloged</span>
                  <span className="text-[11px] text-slate-400">Provider friction, appeal overturn protocols, and mitigations defined.</span>
                </div>
              </div>

              {/* Gate 6 */}
              <div 
                onClick={() => handleToggleChecklist('governanceApprovalRecorded', selectedPilot.scaleReadiness.governanceApprovalRecorded)}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox"
                  checked={selectedPilot.scaleReadiness.governanceApprovalRecorded}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#39D6C4]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-200 block">6. Formal AI Governance Approval Recorded</span>
                  <span className="text-[11px] text-slate-400">
                    Oversight council clearance with ZERO open Critical governance debt issues.
                  </span>
                </div>
              </div>

              {/* Gate 7 */}
              <div 
                onClick={() => handleToggleChecklist('businessOwnerAccepted', selectedPilot.scaleReadiness.businessOwnerAccepted)}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors md:col-span-2"
              >
                <input 
                  type="checkbox"
                  checked={selectedPilot.scaleReadiness.businessOwnerAccepted}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#39D6C4]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-200 block">7. Accountable Business Owner Formal Sign-Off</span>
                  <span className="text-[11px] text-slate-400">
                    Operational leader ({selectedPilot.businessOwner}) has accepted operational budget and workflow responsibility.
                  </span>
                </div>
              </div>
            </div>

            {/* Unfulfilled Gates Warning Banner */}
            {!scaleGateEvaluation?.isScaleReady && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Production Rollout Locked: {scaleGateEvaluation?.missingRequirements.length} Prerequisite(s) Unfulfilled</span>
                </div>
                <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-[11px] text-amber-300/90">
                  {scaleGateEvaluation?.missingRequirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Strategic Decision Recommendation */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Leadership Recommended Decision</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded ${
                  selectedPilot.recommendedDecision === 'Scale'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : selectedPilot.recommendedDecision === 'Optimize & Iterate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {selectedPilot.recommendedDecision}
                </span>
                <span className="text-xs text-slate-300">{selectedPilot.decisionRationale}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedPilot.recommendedDecision}
                onChange={(e) => {
                  const updated = { ...selectedPilot, recommendedDecision: e.target.value as any };
                  updatePilot(updated);
                  setSelectedPilot(updated);
                }}
                className="bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Scale">Scale to Enterprise</option>
                <option value="Optimize & Iterate">Optimize & Iterate</option>
                <option value="Pause">Pause Pilot</option>
                <option value="Terminate">Terminate Initiative</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Commission Pilot Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#39D6C4]" />
                Commission New Proof-of-Concept / Pilot
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePilotSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Pilot Title *</label>
                <input
                  type="text"
                  required
                  value={newPilotForm.title}
                  onChange={(e) => setNewPilotForm({ ...newPilotForm, title: e.target.value })}
                  placeholder="e.g., Inpatient Rehabilitation Therapy Overreporting Shadow Pilot"
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-[#39D6C4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Linked Opportunity</label>
                  <select
                    value={newPilotForm.opportunityId}
                    onChange={(e) => setNewPilotForm({ ...newPilotForm, opportunityId: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none"
                  >
                    {opportunities.map(o => (
                      <option key={o.id} value={o.id}>{o.id}: {o.title.slice(0, 28)}...</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Solution Architecture</label>
                  <select
                    value={newPilotForm.solutionType}
                    onChange={(e) => setNewPilotForm({ ...newPilotForm, solutionType: e.target.value as any })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none"
                  >
                    <option value="ML Risk Scoring">ML Risk Scoring</option>
                    <option value="Rules & Edits">Rules & Edits</option>
                    <option value="Generative AI">Generative AI</option>
                    <option value="SQL Analytics">SQL Analytics</option>
                    <option value="Hybrid">Hybrid Solution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Testable Business Hypothesis *</label>
                <textarea
                  required
                  rows={2}
                  value={newPilotForm.hypothesis}
                  onChange={(e) => setNewPilotForm({ ...newPilotForm, hypothesis: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-[#39D6C4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pilot Budget (₹)</label>
                  <input
                    type="number"
                    value={newPilotForm.budget}
                    onChange={(e) => setNewPilotForm({ ...newPilotForm, budget: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Detection Precision (%)</label>
                  <input
                    type="number"
                    value={newPilotForm.targetDetection}
                    onChange={(e) => setNewPilotForm({ ...newPilotForm, targetDetection: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#39D6C4] text-slate-950 font-semibold"
                >
                  Commission Pilot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
