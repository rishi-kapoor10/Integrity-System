import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Opportunity, SolutionOption, SolutionType } from '../../types';
import { formatINR, formatPercent } from '../../utils/formatting';
import { 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Layers,
  Sparkles,
  Sliders,
  ChevronDown
} from 'lucide-react';

export const SolutionLabPage: React.FC = () => {
  const { opportunities, solutions, selectedOpportunityId, setSelectedOpportunityId, showToast } = useApp();

  const [activeOppId, setActiveOppId] = useState<string>(selectedOpportunityId || opportunities[0].id);

  const activeOpp = useMemo(() => {
    return opportunities.find(o => o.id === activeOppId) || opportunities[0];
  }, [opportunities, activeOppId]);

  // Solutions associated with this opportunity
  const oppSolutions = useMemo(() => {
    const list = solutions.filter(s => s.opportunityId === activeOpp.id);
    if (list.length > 0) return list;

    // If none explicitly linked, generate standard competing alternatives for the opportunity
    const genericOptions: SolutionOption[] = [
      {
        id: `SOL-${activeOpp.id}-RULES`,
        opportunityId: activeOpp.id,
        name: 'Deterministic Clearinghouse Rules & Policy Edits',
        type: 'Rules & Edits',
        businessObjective: 'Deploy hardcoded code-pair logic and policy edits at claim clearinghouse ingestion to pend or reject non-compliant submissions.',
        technicalFeasibility: 95,
        dataPrerequisites: ['Standard 837 claim stream', 'Payer policy lookup table'],
        implementationEffort: 'Low',
        estimatedImplementationCost: 850000,
        estimatedAnnualOperatingCost: 220000,
        timeToValueWeeks: 4,
        expectedBenefits: ['Immediate pre-pay interception', 'Zero complex infrastructure', 'Clear regulatory justification'],
        risksAndLimitations: ['High false-positive rate on complex multi-diagnosis cases', 'Provider appeals surge if clinical nuance is missing'],
        humanOversightLevel: 'Exception-only',
        successMetrics: ['Auto-adjudication accuracy > 92%', 'Appeal overturn rate < 8%'],
        isRecommended: activeOpp.id === 'OPP-102',
        recommendationRationale: activeOpp.id === 'OPP-102' 
          ? 'Recommended: Pure deterministic rules outperform AI for high-volume standard coding unbundling with zero model hallucination.' 
          : 'Simple baseline, but lacks the clinical flexibility needed for nuanced diagnostic severity determination.',
      },
      {
        id: `SOL-${activeOpp.id}-SQL`,
        opportunityId: activeOpp.id,
        name: 'SQL Analytics & Post-Pay Trend Monitoring',
        type: 'SQL Analytics',
        businessObjective: 'Execute scheduled analytical queries on historical claims warehouse to detect provider billing anomalies and retrospective recovery targets.',
        technicalFeasibility: 90,
        dataPrerequisites: ['Adjudicated claims data warehouse', 'Provider billing benchmarks'],
        implementationEffort: 'Low',
        estimatedImplementationCost: 1200000,
        estimatedAnnualOperatingCost: 350000,
        timeToValueWeeks: 6,
        expectedBenefits: ['Comprehensive retrospective audit coverage', 'Low operational risk', 'Transparent query logic'],
        risksAndLimitations: ['Post-pay recovery friction ("chasing" paid claims)', 'Provider abrasion during clawbacks', 'Inability to stop funds pre-payment'],
        humanOversightLevel: 'Sample-based',
        successMetrics: ['Audit yield > 70%', 'Recovery collection rate > 65%'],
        isRecommended: false,
        recommendationRationale: 'Effective for historical auditing, but post-pay recovery incurs high administrative recovery friction compared to pre-pay detection.',
      },
      {
        id: `SOL-${activeOpp.id}-ML`,
        opportunityId: activeOpp.id,
        name: 'Supervised ML Risk Scoring & Anomaly Detection',
        type: 'ML Risk Scoring',
        businessObjective: 'Train gradient-boosted trees on historical claim features, provider specialty benchmarks, and clinical severity to score claim leakage probability.',
        technicalFeasibility: 85,
        dataPrerequisites: ['3 years of audited claims', 'Provider profile master', 'GMLOS benchmark tables'],
        implementationEffort: 'Medium',
        estimatedImplementationCost: 2800000,
        estimatedAnnualOperatingCost: 650000,
        timeToValueWeeks: 10,
        expectedBenefits: ['Precision in top decile > 80%', 'Dynamic risk prioritization', 'Significant reduction in wasted nurse review hours'],
        risksAndLimitations: ['Requires feature store maintenance', 'Periodic retraining for annual ICD/CPT code updates'],
        humanOversightLevel: 'Sample-based',
        successMetrics: ['AUC-ROC > 0.88', 'Detection precision > 80%', 'Audit throughput lift > 40%'],
        isRecommended: activeOpp.id === 'OPP-101' || activeOpp.id === 'OPP-103',
        recommendationRationale: activeOpp.id === 'OPP-101' || activeOpp.id === 'OPP-103'
          ? 'Recommended: Best balance of high precision (82% vs 45% for pure rules) and automated risk triage for multi-variable clinical problems.'
          : 'High performance candidate, but requires sufficient cleansed training data to prevent overfitting.',
      },
      {
        id: `SOL-${activeOpp.id}-HYBRID`,
        opportunityId: activeOpp.id,
        name: 'Hybrid: Deterministic Pre-Pay Gates + ML Clinical Triage',
        type: 'Hybrid',
        businessObjective: 'Combine deterministic rule filters for obvious coding violations with ML risk scoring for borderline clinical severity claims requiring chart review.',
        technicalFeasibility: 80,
        dataPrerequisites: ['837 claim stream', 'Provider registry', 'GMLOS benchmark tables'],
        implementationEffort: 'High',
        estimatedImplementationCost: 3800000,
        estimatedAnnualOperatingCost: 900000,
        timeToValueWeeks: 14,
        expectedBenefits: ['Highest total financial capture', 'Fast-lane clearance for low-risk claims', 'Defensible dual-layer audit trail'],
        risksAndLimitations: ['Dual-system orchestration complexity', 'Higher initial integration timeline'],
        humanOversightLevel: 'Human-in-the-loop (100% review)',
        successMetrics: ['Overall recovery lift > 45%', 'False-positive rate < 15%'],
        isRecommended: false,
        recommendationRationale: 'Recommended for Phase 2 enterprise expansion after the core ML risk scoring engine proves out in pilot.',
      },
    ];

    return genericOptions;
  }, [solutions, activeOpp]);

  // Selected solution for focused deep dive
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>(
    oppSolutions.find(s => s.isRecommended)?.id || oppSolutions[0].id
  );

  const selectedSolution = useMemo(() => {
    return oppSolutions.find(s => s.id === selectedSolutionId) || oppSolutions[0];
  }, [oppSolutions, selectedSolutionId]);

  // Scoring trade-offs table
  const solutionCriteriaBreakdown = useMemo(() => {
    return oppSolutions.map(sol => {
      // Deterministic scoring calculation
      let score = 0;
      score += (sol.technicalFeasibility / 100) * 30;
      score += sol.implementationEffort === 'Low' ? 25 : sol.implementationEffort === 'Medium' ? 18 : 10;
      score += (sol.estimatedImplementationCost < 1500000 ? 25 : sol.estimatedImplementationCost < 3000000 ? 18 : 10);
      score += (sol.timeToValueWeeks <= 6 ? 20 : sol.timeToValueWeeks <= 12 ? 14 : 8);

      return {
        ...sol,
        calculatedScore: Math.round(score),
      };
    });
  }, [oppSolutions]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#39D6C4]" />
            Solution Lab — Architectural Comparison & Trade-off Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Objectively evaluate Rules vs Automation vs ML vs Generative AI against feasibility, cost, time-to-value, and human oversight.
          </p>
        </div>

        {/* Opportunity Switcher */}
        <div className="flex items-center gap-2">
          <label htmlFor="solution-opp-select" className="text-xs text-slate-400 whitespace-nowrap">Problem Context:</label>
          <select
            id="solution-opp-select"
            value={activeOppId}
            onChange={(e) => {
              setActiveOppId(e.target.value);
              setSelectedOpportunityId(e.target.value);
            }}
            className="bg-[#11192B] border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#39D6C4]/50 font-medium"
          >
            {opportunities.map(o => (
              <option key={o.id} value={o.id}>
                {o.id}: {o.title.slice(0, 36)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Problem Context Banner */}
      <div className="p-4 rounded-xl bg-[#11192B] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#39D6C4] px-1.5 py-0.5 rounded bg-[#39D6C4]/10">
              {activeOpp.id}
            </span>
            <h3 className="text-sm font-semibold text-slate-100">
              {activeOpp.title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
            {activeOpp.businessProblem}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-4 text-xs font-mono text-right border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-4">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Financial Exposure</span>
            <span className="font-bold text-emerald-400 text-sm">
              {formatINR(activeOpp.estimatedFinancialOpportunity, true)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Data Readiness</span>
            <span className="font-bold text-[#39D6C4] text-sm">
              {activeOpp.dataReadiness}%
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Solution Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {oppSolutions.map((sol) => {
          const isSelected = selectedSolutionId === sol.id;
          return (
            <div
              key={sol.id}
              onClick={() => setSelectedSolutionId(sol.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                sol.isRecommended 
                  ? 'bg-[#172238] border-[#39D6C4]/50 shadow-lg shadow-[#39D6C4]/5' 
                  : 'bg-[#11192B] border-slate-800/80 hover:border-slate-700'
              } ${isSelected ? 'ring-2 ring-[#39D6C4]' : ''}`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {sol.type}
                  </span>
                  {sol.isRecommended && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#39D6C4]/15 text-[#39D6C4] border border-[#39D6C4]/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> RECOMMENDED
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2">
                  {sol.name}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                  {sol.businessObjective}
                </p>

                {/* Key Metrics Strip */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/70 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Technical Feasibility:</span>
                    <span className="font-mono text-slate-200 font-semibold">{sol.technicalFeasibility}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated CapEx:</span>
                    <span className="font-mono text-slate-200 font-semibold">{formatINR(sol.estimatedImplementationCost, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annual OpEx:</span>
                    <span className="font-mono text-slate-200 font-semibold">{formatINR(sol.estimatedAnnualOperatingCost, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time to Value:</span>
                    <span className="font-mono text-[#39D6C4] font-semibold">{sol.timeToValueWeeks} wks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Oversight Model:</span>
                    <span className="text-[10px] text-purple-300 font-medium truncate max-w-[110px]" title={sol.humanOversightLevel}>
                      {sol.humanOversightLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation Rationale */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                  {sol.recommendationRationale}
                </p>
                <div className="mt-2 text-right">
                  <span className={`text-[11px] font-medium ${isSelected ? 'text-[#39D6C4]' : 'text-slate-500'}`}>
                    {isSelected ? 'Inspecting Details →' : 'Click to inspect'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Solution Deep Dive Comparison Panel */}
      {selectedSolution && (
        <div className="bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#39D6C4] px-2 py-0.5 rounded bg-[#39D6C4]/10">
                  {selectedSolution.id}
                </span>
                <h3 className="text-sm font-semibold text-slate-100">
                  {selectedSolution.name} ({selectedSolution.type})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedSolution.businessObjective}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0B1020] border border-slate-800 text-slate-300">
                Human Oversight: <strong className="text-purple-400">{selectedSolution.humanOversightLevel}</strong>
              </span>
            </div>
          </div>

          {/* 3-Column Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Column 1: Expected Benefits & Success Metrics */}
            <div className="p-3.5 rounded-lg bg-[#0B1020]/80 border border-slate-800 space-y-2.5">
              <span className="font-semibold text-emerald-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Expected Benefits
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {selectedSolution.expectedBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="font-semibold text-slate-300 text-[11px] block mb-1">Target Success Metrics:</span>
                <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                  {selectedSolution.successMetrics.map((m, i) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Risks, Limitations & Caveats */}
            <div className="p-3.5 rounded-lg bg-[#0B1020]/80 border border-slate-800 space-y-2.5">
              <span className="font-semibold text-amber-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Risks & Limitations
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {selectedSolution.risksAndLimitations.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Data Prerequisites:</span>
                <ul className="space-y-1">
                  {selectedSolution.dataPrerequisites.map((dp, i) => (
                    <li key={i}>• {dp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3: Strategic Rationale & Judgment */}
            <div className="p-3.5 rounded-lg bg-[#0B1020]/80 border border-slate-800 space-y-2.5">
              <span className="font-semibold text-[#39D6C4] font-mono text-[11px] uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Architectural Business Judgment
              </span>
              <p className="text-slate-300 leading-relaxed italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                "{selectedSolution.recommendationRationale}"
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Why Not Blindly Pick ML/GenAI?</span>
                <p className="leading-relaxed">
                  In healthcare payment integrity, simplicity and explainability matter: if deterministic rules can intercept 90%+ of leakage with zero risk of model drift or hallucination, rules are the superior architectural decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
