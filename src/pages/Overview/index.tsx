import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { InnovationDecisionGraph } from '../../components/decisionGraph/InnovationDecisionGraph';
import { formatINR, formatPercent, getStageClass } from '../../utils/formatting';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid, Legend
} from 'recharts';
import { 
  TrendingUp, 
  Layers, 
  FlaskConical, 
  ShieldAlert, 
  CheckCircle, 
  ArrowUpRight, 
  AlertTriangle, 
  AlertCircle,
  FileCheck2,
  DollarSign
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { 
    kpis, 
    opportunities, 
    pilots, 
    executiveInsights, 
    governanceDebt,
    currencyMode 
  } = useApp();

  const navigate = useNavigate();
  const isCompact = currencyMode === 'INR_COMPACT';

  // Chart 1: Pipeline by Stage
  const pipelineStageData = [
    { stage: 'Identified', count: opportunities.filter(o => o.stage === 'Identified').length },
    { stage: 'Analysis', count: opportunities.filter(o => o.stage === 'Under analysis').length },
    { stage: 'Proposed', count: opportunities.filter(o => o.stage === 'Proposed').length },
    { stage: 'Testing', count: opportunities.filter(o => o.stage === 'In testing').length },
    { stage: 'Gov Review', count: opportunities.filter(o => o.stage === 'Governance review').length },
    { stage: 'Active Pilot', count: opportunities.filter(o => o.stage === 'Pilot in progress' || o.stage === 'Approved for pilot').length },
    { stage: 'Ready / Scale', count: opportunities.filter(o => o.stage === 'Ready for scale' || o.stage === 'Validated').length },
  ];

  // Chart 2: Pilot Discrepancy Recovery by Month (Synthetic Trend)
  const pilotTrendData = [
    { month: 'Jun 26', baseline: 12.0, target: 38.0, observed: 18.5 },
    { month: 'Jul 26', baseline: 12.0, target: 38.0, observed: 29.0 },
    { month: 'Aug 26', baseline: 12.0, target: 38.0, observed: 41.2 },
    { month: 'Sep 26 (Est)', baseline: 12.0, target: 38.0, observed: 44.5 },
  ];

  // Chart 3: Estimated vs Validated Financial Value (in INR Crores)
  const valueComparisonData = [
    { 
      name: 'DRG Upcoding (OPP-101)', 
      estimated: 5.4, 
      validated: 4.12 * 12 / 100, // annualized pilot rate ~4.94 Cr
    },
    { 
      name: 'Modifier -25 (OPP-102)', 
      estimated: 7.79, 
      validated: 5.64 * 12 / 100, // annualized pilot rate ~6.77 Cr
    },
    { 
      name: 'Specialty Injectable (OPP-103)', 
      estimated: 13.98, 
      validated: 2.5, // preliminary lab testing
    },
    { 
      name: 'Clinical GenAI (OPP-106)', 
      estimated: 3.64, 
      validated: 1.45 * 12 / 100, // ~1.74 Cr
    },
  ];

  // Chart 4: Solution Architecture Mix
  const solutionMixData = [
    { name: 'ML Risk Scoring', value: 3, color: '#39D6C4' },
    { name: 'Rules & Edits', value: 2, color: '#789BFF' },
    { name: 'Generative AI', value: 1, color: '#C084FC' },
    { name: 'SQL Analytics', value: 2, color: '#FBBF24' },
    { name: 'Hybrid Models', value: 2, color: '#34D399' },
  ];

  // Chart 5: Risk vs Expected Value Matrix
  const riskValueData = opportunities.map(o => ({
    id: o.id,
    name: o.title.slice(0, 24),
    xValue: o.riskRating === 'High' ? 80 : o.riskRating === 'Medium' ? 50 : 25, // Risk
    yValue: Math.round(o.estimatedFinancialOpportunity / 10000000 * 10) / 10, // ₹ Cr
    zScore: o.strategicAlignment,
    stage: o.stage,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Opportunities */}
        <div 
          onClick={() => navigate('/opportunities')}
          className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Opportunities</span>
            <Layers className="w-3.5 h-3.5 text-[#39D6C4]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
              {kpis.totalOpportunities}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Identified pipeline</span>
          </div>
        </div>

        {/* Under Evaluation */}
        <div 
          onClick={() => navigate('/opportunities')}
          className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>In Evaluation</span>
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {kpis.opportunitiesUnderEvaluation}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Discovery & design</span>
          </div>
        </div>

        {/* Active Pilots */}
        <div 
          onClick={() => navigate('/pilots')}
          className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Pilots</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#789BFF]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-[#789BFF] tabular-nums">
              {kpis.activePilots}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">In shadow/trial</span>
          </div>
        </div>

        {/* Pilots Ready for Decision */}
        <div 
          onClick={() => navigate('/pilots')}
          className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ready for Scale</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#39D6C4]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-[#39D6C4] tabular-nums">
              {pilots.filter(p => p.stage === 'Completed' || p.recommendedDecision === 'Scale').length}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Empirical proof logged</span>
          </div>
        </div>

        {/* Est. Gross Benefit */}
        <div 
          onClick={() => navigate('/value')}
          className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Annual Gross</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {formatINR(kpis.totalEstimatedGrossBenefit, true)}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Est. gross exposure</span>
          </div>
        </div>

        {/* Est. Net Benefit */}
        <div 
          onClick={() => navigate('/value')}
          className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Annual Net</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#39D6C4]" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-[#39D6C4] tabular-nums">
              {formatINR(kpis.totalEstimatedNetBenefit, true)}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Post-CapEx/OpEx</span>
          </div>
        </div>

        {/* Governance Reviews */}
        <div 
          onClick={() => navigate('/governance')}
          className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Gov. Reviews</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {kpis.initiativesAwaitingGovernance}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Gated / Debt open</span>
          </div>
        </div>
      </div>

      {/* Signature Feature: The Innovation Decision Graph */}
      <InnovationDecisionGraph />

      {/* Executive Insight Panel: "What Needs Attention?" */}
      <div className="bg-[#11192B] border border-slate-800/80 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wider">
                What Needs Attention? (Operational Signal Engine)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic diagnostic insights dynamically generated from actual claim data, pilot metrics, and open governance debt.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {executiveInsights.length} Active Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
          {executiveInsights.map((insight) => {
            let Icon = AlertTriangle;
            let cardBg = 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700';
            let tagColor = 'text-amber-400 bg-amber-400/10';

            if (insight.type === 'critical') {
              Icon = AlertCircle;
              cardBg = 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700/60';
              tagColor = 'text-rose-400 bg-rose-500/10';
            } else if (insight.type === 'info') {
              Icon = CheckCircle;
              cardBg = 'bg-[#39D6C4]/5 border-[#39D6C4]/20 hover:border-[#39D6C4]/40';
              tagColor = 'text-[#39D6C4] bg-[#39D6C4]/10';
            }

            return (
              <div 
                key={insight.id}
                onClick={() => navigate(insight.targetRoute)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${cardBg}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${tagColor} font-semibold uppercase`}>
                      {insight.type}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                  
                  <h4 className="text-xs font-semibold text-slate-200 mt-2 line-clamp-2">
                    {insight.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {insight.observation}
                  </p>

                  <div className="mt-2.5 p-2 rounded bg-[#0B1020]/80 text-[11px] text-slate-300 border border-slate-800/60">
                    <span className="font-semibold text-slate-200">Why it matters: </span>
                    {insight.whyItMatters}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-[#39D6C4]">
                  <span className="font-medium">Take Action</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Interactive Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pipeline by Stage */}
        <div className="bg-[#11192B] border border-slate-800/80 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Opportunity Pipeline by Stage
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Distribution of candidate payment integrity initiatives
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500">COUNT BY STAGE</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="stage" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11192B', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: '#1E293B', opacity: 0.4 }}
                />
                <Bar dataKey="count" name="Opportunities" fill="#39D6C4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pilot Performance Over Time */}
        <div className="bg-[#11192B] border border-slate-800/80 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Pilot Discrepancy Identification (Monthly ₹ Lakhs)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Observed recovery lift vs baseline historical audit benchmark
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#39D6C4]">PLT-201 (DRG ML)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pilotTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="L" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11192B', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="baseline" name="Baseline (Random Sample)" stroke="#64748B" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="target" name="Pilot Target" stroke="#789BFF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="observed" name="Observed Recovery" stroke="#39D6C4" strokeWidth={2.5} dot={{ r: 4, fill: '#39D6C4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Estimated vs Validated Financial Value */}
        <div className="bg-[#11192B] border border-slate-800/80 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Estimated vs Validated Financial Value (₹ Crores)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Reconciliation of pre-pilot projections against empirical pilot run-rates
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500">ANNUALIZED</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} unit=" Cr" />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} width={130} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11192B', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: '#1E293B', opacity: 0.4 }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="estimated" name="Estimated Opportunity" fill="#789BFF" radius={[0, 4, 4, 0]} />
                <Bar dataKey="validated" name="Pilot-Validated Run-Rate" fill="#39D6C4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Solution Architecture Mix & Trade-offs */}
        <div className="bg-[#11192B] border border-slate-800/80 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Technology Solution Mix
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Balanced portfolio: Deterministic rules, ML scoring, and Document AI
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500">NO AI-ONLY BIAS</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={solutionMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                  fontSize={10}
                >
                  {solutionMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11192B', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
