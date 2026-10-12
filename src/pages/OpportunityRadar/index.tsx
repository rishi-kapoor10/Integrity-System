import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Opportunity, OpportunityStage, SolutionType } from '../../types';
import { calculatePriorityScore, generateWhyThisWhyNow } from '../../utils/calculations';
import { formatINR, formatPercent, getStageClass, formatDate } from '../../utils/formatting';
import { 
  Radar, 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  Edit3, 
  Trash2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const OpportunityRadarPage: React.FC = () => {
  const { 
    opportunities, 
    prioritizationWeights, 
    updatePrioritizationWeights, 
    createOpportunity, 
    updateOpportunity, 
    deleteOpportunity,
    setSelectedOpportunityId,
    showToast
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'value' | 'readiness' | 'alignment'>('score');
  
  // UI Panels state
  const [isWeightPanelOpen, setWeightPanelOpen] = useState(false);
  const [selectedOppForDrawer, setSelectedOppForDrawer] = useState<Opportunity | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [oppToDelete, setOppToDelete] = useState<Opportunity | null>(null);

  // Local weights draft
  const [localWeights, setLocalWeights] = useState(prioritizationWeights);

  // Weight validation
  const sumLocalWeights = 
    localWeights.businessImpact + 
    localWeights.feasibility + 
    localWeights.dataReadiness + 
    localWeights.strategicAlignment + 
    localWeights.timeToValue;

  const handleSaveWeights = () => {
    if (sumLocalWeights !== 100) {
      showToast('Invalid Weights', 'The prioritization weights must sum to exactly 100%.', 'error');
      return;
    }
    updatePrioritizationWeights(localWeights);
    setWeightPanelOpen(false);
  };

  // Filtered & Scored Opportunities
  const scoredOpportunities = useMemo(() => {
    return opportunities.map(opp => {
      const scoreData = calculatePriorityScore(opp, prioritizationWeights);
      const whyNow = generateWhyThisWhyNow(opp);
      return {
        ...opp,
        calculatedScore: scoreData.totalScore,
        scoreBreakdown: scoreData.breakdown,
        dynamicWhyNow: whyNow,
      };
    });
  }, [opportunities, prioritizationWeights]);

  const filteredList = useMemo(() => {
    return scoredOpportunities.filter(o => {
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.businessProblem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.owner.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = stageFilter === 'all' || o.stage === stageFilter;
      const matchesRisk = riskFilter === 'all' || o.riskRating === riskFilter;

      return matchesSearch && matchesStage && matchesRisk;
    }).sort((a, b) => {
      if (sortBy === 'score') return b.calculatedScore - a.calculatedScore;
      if (sortBy === 'value') return b.estimatedFinancialOpportunity - a.estimatedFinancialOpportunity;
      if (sortBy === 'readiness') return b.dataReadiness - a.dataReadiness;
      if (sortBy === 'alignment') return b.strategicAlignment - a.strategicAlignment;
      return 0;
    });
  }, [scoredOpportunities, searchQuery, stageFilter, riskFilter, sortBy]);

  // Form state for Create / Edit Opportunity
  const [formData, setFormData] = useState({
    title: '',
    businessProblem: '',
    payerContext: 'Commercial Network Claims',
    supportingEvidence: '',
    annualClaimVolume: 25000,
    baselineErrorRate: 5.0,
    avgDiscrepancy: 45000,
    currentManualAuditHours: 5000,
    operationalImpact: 'Medium' as 'High' | 'Medium' | 'Low',
    dataReadiness: 75,
    technicalFeasibility: 80,
    implementationEffort: 'Medium' as 'Low' | 'Medium' | 'High',
    riskRating: 'Medium' as 'Low' | 'Medium' | 'High',
    strategicAlignment: 85,
    businessImpact: 80,
    timeToValue: 70,
    suggestedSolutions: ['ML Risk Scoring', 'Rules & Edits'] as SolutionType[],
    owner: 'Rishi Kapoor, Innovation Strategy Lead',
    stage: 'Identified' as OpportunityStage,
    nextAction: 'Initiate 50-claim exploratory retrospective audit.',
    evidenceValidated: false,
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.businessProblem) {
      showToast('Validation Error', 'Title and business problem description are required.', 'error');
      return;
    }

    const estimatedFinancialOpportunity = Math.round(
      formData.annualClaimVolume * (formData.baselineErrorRate / 100) * formData.avgDiscrepancy
    );

    const created = createOpportunity({
      title: formData.title,
      businessProblem: formData.businessProblem,
      payerContext: formData.payerContext,
      supportingEvidence: formData.supportingEvidence || 'Preliminary estimation pending formal chart audit.',
      baselineMetrics: {
        annualClaimVolume: Number(formData.annualClaimVolume),
        baselineErrorRate: Number(formData.baselineErrorRate),
        avgDiscrepancy: Number(formData.avgDiscrepancy),
        currentManualAuditHours: Number(formData.currentManualAuditHours),
      },
      estimatedFinancialOpportunity,
      operationalImpact: formData.operationalImpact,
      dataReadiness: Number(formData.dataReadiness),
      technicalFeasibility: Number(formData.technicalFeasibility),
      implementationEffort: formData.implementationEffort,
      riskRating: formData.riskRating,
      strategicAlignment: Number(formData.strategicAlignment),
      businessImpact: Number(formData.businessImpact),
      timeToValue: Number(formData.timeToValue),
      suggestedSolutions: formData.suggestedSolutions,
      owner: formData.owner,
      stage: formData.stage,
      nextAction: formData.nextAction,
      evidenceValidated: formData.evidenceValidated,
    });

    setCreateModalOpen(false);
    setSelectedOppForDrawer(created as any);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Radar className="w-4 h-4 text-[#39D6C4]" />
            Opportunity Radar & Prioritization Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate, score, and rank payment leakage problems using a transparent 5-factor weighted model.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setWeightPanelOpen(!isWeightPanelOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#39D6C4]" />
            <span>Formula Weights</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#39D6C4] hover:bg-[#39D6C4]/90 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* Transparent Weight Adjuster Panel (Collapsible) */}
      {isWeightPanelOpen && (
        <div className="bg-[#11192B] border border-[#39D6C4]/30 rounded-xl p-4 shadow-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-2">
                <span>Transparent Prioritization Formula:</span>
                <span className="text-slate-400 font-normal">
                  Score = (0.{localWeights.businessImpact}×Impact) + (0.{localWeights.feasibility}×Feasibility) + (0.{localWeights.dataReadiness}×Data) + (0.{localWeights.strategicAlignment}×Strategy) + (0.{localWeights.timeToValue}×Time)
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono font-bold ${sumLocalWeights === 100 ? 'text-[#39D6C4]' : 'text-rose-400'}`}>
                Sum: {sumLocalWeights}% / 100%
              </span>
              <button
                onClick={handleSaveWeights}
                disabled={sumLocalWeights !== 100}
                className="px-3 py-1 rounded bg-[#39D6C4] disabled:opacity-50 text-slate-950 font-semibold text-xs"
              >
                Apply Weights
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Business Impact:</span>
                <span className="font-mono text-[#39D6C4]">{localWeights.businessImpact}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={localWeights.businessImpact}
                onChange={(e) => setLocalWeights({ ...localWeights, businessImpact: Number(e.target.value) })}
                className="w-full accent-[#39D6C4]"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Tech Feasibility:</span>
                <span className="font-mono text-[#39D6C4]">{localWeights.feasibility}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={localWeights.feasibility}
                onChange={(e) => setLocalWeights({ ...localWeights, feasibility: Number(e.target.value) })}
                className="w-full accent-[#39D6C4]"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Data Readiness:</span>
                <span className="font-mono text-[#39D6C4]">{localWeights.dataReadiness}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={localWeights.dataReadiness}
                onChange={(e) => setLocalWeights({ ...localWeights, dataReadiness: Number(e.target.value) })}
                className="w-full accent-[#39D6C4]"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Strategic Alignment:</span>
                <span className="font-mono text-[#39D6C4]">{localWeights.strategicAlignment}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={localWeights.strategicAlignment}
                onChange={(e) => setLocalWeights({ ...localWeights, strategicAlignment: Number(e.target.value) })}
                className="w-full accent-[#39D6C4]"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Time to Value:</span>
                <span className="font-mono text-[#39D6C4]">{localWeights.timeToValue}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={localWeights.timeToValue}
                onChange={(e) => setLocalWeights({ ...localWeights, timeToValue: Number(e.target.value) })}
                className="w-full accent-[#39D6C4]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#11192B] border border-slate-800">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunity title, business problem, or owner..."
              className="w-full bg-[#0B1020] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#39D6C4]/50"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-[#0B1020] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="Identified">Identified</option>
            <option value="Under analysis">Under analysis</option>
            <option value="In testing">In testing</option>
            <option value="Pilot in progress">Pilot in progress</option>
            <option value="Ready for scale">Ready for scale</option>
            <option value="Governance review">Governance review</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#0B1020] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Risk Tiers</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0B1020] border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium"
          >
            <option value="score">Priority Score (High to Low)</option>
            <option value="value">Financial Exposure (High to Low)</option>
            <option value="readiness">Data Readiness (High to Low)</option>
            <option value="alignment">Strategic Alignment (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="space-y-3">
        {filteredList.map((opp) => (
          <div
            key={opp.id}
            className="bg-[#11192B] border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all shadow-md"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              {/* Left Column: Title, Problem, Context */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#39D6C4] px-1.5 py-0.5 rounded bg-[#39D6C4]/10 border border-[#39D6C4]/20">
                    {opp.id}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded ${getStageClass(opp.stage)}`}>
                    {opp.stage}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {opp.payerContext}
                  </span>
                  {opp.evidenceValidated ? (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Validated Evidence
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Baseline Pending
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-slate-100 hover:text-[#39D6C4] cursor-pointer transition-colors"
                  onClick={() => setSelectedOppForDrawer(opp)}
                >
                  {opp.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {opp.businessProblem}
                </p>

                {/* Why This, Why Now summary kicker */}
                <div className="p-2.5 rounded-lg bg-[#0B1020]/80 border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="font-semibold text-[#39D6C4] font-mono">Why This, Why Now? </span>
                  <span>{opp.dynamicWhyNow.summary}</span>
                </div>
              </div>

              {/* Right Column: Priority Score + Contribution Breakdown */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-end gap-3 lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-3 lg:pt-0 lg:pl-4">
                <div className="w-full flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-[10px] text-slate-400 uppercase font-mono">Priority Score</span>
                    <span className="text-2xl font-bold font-mono text-[#39D6C4] tabular-nums">
                      {opp.calculatedScore.toFixed(1)}
                      <span className="text-xs text-slate-500 font-normal"> / 100</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 uppercase font-mono">Gross Exposure</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      {formatINR(opp.estimatedFinancialOpportunity, true)}
                    </span>
                  </div>
                </div>

                {/* Score Contribution Mini Bar */}
                <div className="w-full space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Impact ({opp.scoreBreakdown.businessImpactContribution} pts)</span>
                    <span>Data ({opp.scoreBreakdown.dataReadinessContribution} pts)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${opp.scoreBreakdown.businessImpactContribution}%` }} className="bg-[#39D6C4]" title="Impact" />
                    <div style={{ width: `${opp.scoreBreakdown.feasibilityContribution}%` }} className="bg-[#789BFF]" title="Feasibility" />
                    <div style={{ width: `${opp.scoreBreakdown.dataReadinessContribution}%` }} className="bg-emerald-400" title="Data Readiness" />
                    <div style={{ width: `${opp.scoreBreakdown.strategicAlignmentContribution}%` }} className="bg-purple-400" title="Strategic Fit" />
                    <div style={{ width: `${opp.scoreBreakdown.timeToValueContribution}%` }} className="bg-amber-400" title="Time to Value" />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 w-full justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedOpportunityId(opp.id);
                      setSelectedOppForDrawer(opp);
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setOppToDelete(opp)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Opportunity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Opportunity Detail Drawer */}
      {selectedOppForDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedOppForDrawer(null)}
          />

          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-[#11192B] border-l border-slate-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0B1020]/80">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#39D6C4] px-1.5 py-0.5 rounded bg-[#39D6C4]/10">
                  {selectedOppForDrawer.id}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${getStageClass(selectedOppForDrawer.stage)}`}>
                  {selectedOppForDrawer.stage}
                </span>
              </div>
              <button
                onClick={() => setSelectedOppForDrawer(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {selectedOppForDrawer.title}
                </h3>
                <p className="text-slate-400 mt-1">{selectedOppForDrawer.payerContext}</p>
              </div>

              {/* Business Problem */}
              <div className="space-y-1">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                  Business Problem
                </span>
                <p className="text-slate-300 leading-relaxed bg-[#0B1020]/60 p-3 rounded-lg border border-slate-800/80">
                  {selectedOppForDrawer.businessProblem}
                </p>
              </div>

              {/* Supporting Evidence */}
              <div className="space-y-1">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                  Supporting Audit Evidence
                </span>
                <p className="text-slate-300 leading-relaxed bg-[#0B1020]/60 p-3 rounded-lg border border-slate-800/80">
                  {selectedOppForDrawer.supportingEvidence}
                </p>
              </div>

              {/* Baseline Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Annual Volume</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedOppForDrawer.baselineMetrics.annualClaimVolume.toLocaleString()} claims
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Baseline Error Rate</span>
                  <span className="font-mono font-bold text-rose-400">
                    {formatPercent(selectedOppForDrawer.baselineMetrics.baselineErrorRate)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Avg Discrepancy</span>
                  <span className="font-mono font-bold text-amber-400">
                    {formatINR(selectedOppForDrawer.baselineMetrics.avgDiscrepancy)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Manual Audit Hours</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedOppForDrawer.baselineMetrics.currentManualAuditHours.toLocaleString()} hrs/yr
                  </span>
                </div>
              </div>

              {/* Why This, Why Now Details */}
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-[#39D6C4] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prioritization Assessment: Why This, Why Now?</span>
                </div>
                <p className="text-slate-300 italic">{selectedOppForDrawer.whyThisWhyNow.summary}</p>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="font-semibold text-emerald-400 block mb-1">Supporting Factors:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {selectedOppForDrawer.whyThisWhyNow.supportingFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                {selectedOppForDrawer.whyThisWhyNow.cautionFactors.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="font-semibold text-amber-400 block mb-1">Reasons for Caution:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {selectedOppForDrawer.whyThisWhyNow.cautionFactors.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Status & Next Action Update */}
              <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800 space-y-3">
                <span className="font-semibold text-slate-300 font-mono uppercase text-[10px]">
                  Lifecycle Governance
                </span>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Opportunity Stage:</label>
                  <select
                    value={selectedOppForDrawer.stage}
                    onChange={(e) => {
                      const updated = { ...selectedOppForDrawer, stage: e.target.value as OpportunityStage };
                      updateOpportunity(updated);
                      setSelectedOppForDrawer(updated);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="Identified">Identified</option>
                    <option value="Under analysis">Under analysis</option>
                    <option value="Proposed">Proposed</option>
                    <option value="In testing">In testing</option>
                    <option value="Governance review">Governance review</option>
                    <option value="Approved for pilot">Approved for pilot</option>
                    <option value="Pilot in progress">Pilot in progress</option>
                    <option value="Validated">Validated</option>
                    <option value="Ready for scale">Ready for scale</option>
                    <option value="Paused">Paused</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Immediate Next Action:</label>
                  <input
                    type="text"
                    value={selectedOppForDrawer.nextAction}
                    onChange={(e) => {
                      const updated = { ...selectedOppForDrawer, nextAction: e.target.value };
                      updateOpportunity(updated);
                      setSelectedOppForDrawer(updated);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0B1020]/80 flex justify-between items-center text-xs">
              <span className="text-slate-400">Owner: {selectedOppForDrawer.owner}</span>
              <button
                onClick={() => setSelectedOppForDrawer(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#39D6C4]" />
                Register New Payment Integrity Opportunity
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Inpatient Rehabilitation Facility Therapy Minute Overreporting"
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-[#39D6C4]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Business Problem Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.businessProblem}
                  onChange={(e) => setFormData({ ...formData, businessProblem: e.target.value })}
                  placeholder="Describe the clinical billing irregularity, coding discrepancy, or duplicate pattern..."
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-[#39D6C4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payer / Network Context</label>
                  <input
                    type="text"
                    value={formData.payerContext}
                    onChange={(e) => setFormData({ ...formData, payerContext: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Operational Impact</label>
                  <select
                    value={formData.operationalImpact}
                    onChange={(e) => setFormData({ ...formData, operationalImpact: e.target.value as any })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none"
                  >
                    <option value="High">High (High manual nurse review overhead)</option>
                    <option value="Medium">Medium (Moderate audit friction)</option>
                    <option value="Low">Low (Automated exception handling)</option>
                  </select>
                </div>
              </div>

              {/* Baseline Metrics Inputs */}
              <div className="p-3 bg-[#0B1020]/70 rounded-lg border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 font-mono uppercase text-[10px]">Baseline Claim Estimates</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Annual Volume</label>
                    <input
                      type="number"
                      value={formData.annualClaimVolume}
                      onChange={(e) => setFormData({ ...formData, annualClaimVolume: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Error Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.baselineErrorRate}
                      onChange={(e) => setFormData({ ...formData, baselineErrorRate: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Avg Discrepancy (₹)</label>
                    <input
                      type="number"
                      value={formData.avgDiscrepancy}
                      onChange={(e) => setFormData({ ...formData, avgDiscrepancy: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Scoring parameters */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Impact (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.businessImpact}
                    onChange={(e) => setFormData({ ...formData, businessImpact: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded p-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Feasibility (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.technicalFeasibility}
                    onChange={(e) => setFormData({ ...formData, technicalFeasibility: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded p-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Data Ready (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.dataReadiness}
                    onChange={(e) => setFormData({ ...formData, dataReadiness: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded p-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Strategic Fit (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.strategicAlignment}
                    onChange={(e) => setFormData({ ...formData, strategicAlignment: Number(e.target.value) })}
                    className="w-full bg-[#0B1020] border border-slate-800 rounded p-1.5 text-slate-200"
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
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(oppToDelete)}
        title="Delete Opportunity?"
        message={`Are you sure you want to delete ${oppToDelete?.id} ("${oppToDelete?.title}")? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (oppToDelete) {
            deleteOpportunity(oppToDelete.id);
            setOppToDelete(null);
          }
        }}
        onCancel={() => setOppToDelete(null)}
      />
    </div>
  );
};
