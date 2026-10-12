import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ValueAssumptions } from '../../types';
import { 
  calculateValueModel, 
  generateSensitivityMatrix 
} from '../../utils/calculations';
import { formatINR, formatPercent } from '../../utils/formatting';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Sliders, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';

export const ValueRealizationPage: React.FC = () => {
  const { valueAssumptions, updateValueAssumptions, showToast } = useApp();

  const [formValues, setFormValues] = useState<ValueAssumptions>(valueAssumptions);
  const [activeScenario, setActiveScenario] = useState<'conservative' | 'base' | 'optimistic'>('base');

  // Recalculate financial outputs dynamically
  const valueResult = useMemo(() => {
    return calculateValueModel(formValues);
  }, [formValues]);

  // Sensitivity Matrix
  const sensitivityMatrix = useMemo(() => {
    return generateSensitivityMatrix(formValues);
  }, [formValues]);

  // Scenarios handler
  const handleApplyScenario = (scenario: 'conservative' | 'base' | 'optimistic') => {
    setActiveScenario(scenario);
    if (scenario === 'conservative') {
      const updated = {
        ...formValues,
        expectedDetectionImprovement: 30,
        realizationRate: 55,
        adoptionRate: 70,
        confidenceLevel: 90,
      };
      setFormValues(updated);
      updateValueAssumptions(updated);
    } else if (scenario === 'base') {
      const updated = {
        ...formValues,
        expectedDetectionImprovement: 45,
        realizationRate: 72,
        adoptionRate: 85,
        confidenceLevel: 80,
      };
      setFormValues(updated);
      updateValueAssumptions(updated);
    } else if (scenario === 'optimistic') {
      const updated = {
        ...formValues,
        expectedDetectionImprovement: 60,
        realizationRate: 85,
        adoptionRate: 95,
        confidenceLevel: 70,
      };
      setFormValues(updated);
      updateValueAssumptions(updated);
    }
    showToast('Scenario Applied', `Calibrated financial model to ${scenario.toUpperCase()} assumptions.`, 'info');
  };

  const handleInputChange = (field: keyof ValueAssumptions, value: number) => {
    const updated = { ...formValues, [field]: value };
    setFormValues(updated);
    updateValueAssumptions(updated);
  };

  // Print executive summary
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#39D6C4]" />
            Value Realization Studio & Commercial Financial Model
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive multi-year ROI model distinguishing Potential Exposure, Estimated Benefit, Validated Run-Rates, and Net Capacity Value.
          </p>
        </div>

        {/* Scenarios & Print Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => handleApplyScenario('conservative')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeScenario === 'conservative' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Conservative
            </button>
            <button
              onClick={() => handleApplyScenario('base')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeScenario === 'base' ? 'bg-[#39D6C4]/20 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Base Case
            </button>
            <button
              onClick={() => handleApplyScenario('optimistic')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeScenario === 'optimistic' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Optimistic
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Model</span>
          </button>
        </div>
      </div>

      {/* 4-Stage Value Realization Funnel (Crucial Distinction) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tier 1: Potential Opportunity */}
        <div className="p-4 rounded-xl bg-[#11192B] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-[10px] uppercase">1. Potential Exposure</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">Gross Ceiling</span>
          </div>
          <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {formatINR(valueResult.potentialAnnualExposure, true)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Annual Claim Volume ({valueResult.annualClaimVolume.toLocaleString()}) × Baseline Error Rate ({formValues.baselineErrorRate}%) × Avg Discrepancy ({formatINR(formValues.avgDiscrepancyINR)}).
          </p>
        </div>

        {/* Tier 2: Estimated Net Benefit */}
        <div className="p-4 rounded-xl bg-[#11192B] border border-[#789BFF]/30 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-[10px] uppercase text-[#789BFF]">2. Modeled Net Benefit</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#789BFF]/15 text-[#789BFF] font-mono">Pre-Pilot Model</span>
          </div>
          <span className="text-xl font-bold font-mono text-[#789BFF] tabular-nums">
            {formatINR(valueResult.annualNetBenefit, true)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Accounting for {formValues.expectedDetectionImprovement}% detection lift, {formValues.realizationRate}% realization, and {formValues.adoptionRate}% adoption minus OpEx.
          </p>
        </div>

        {/* Tier 3: Pilot-Validated Run-Rate */}
        <div className="p-4 rounded-xl bg-[#172238] border border-[#39D6C4]/40 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-[10px] uppercase text-[#39D6C4]">3. Pilot-Validated Run-Rate</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#39D6C4]/15 text-[#39D6C4] font-mono">Empirical</span>
          </div>
          <span className="text-xl font-bold font-mono text-[#39D6C4] tabular-nums">
            {formatINR(4120000 * 12, true)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Extrapolated from ₹41.2L confirmed monthly discrepancy identification during active DRG ML shadow pilot (PLT-201).
          </p>
        </div>

        {/* Tier 4: Realized Financial Yield */}
        <div className="p-4 rounded-xl bg-[#11192B] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-[10px] uppercase text-emerald-400">4. Realized In-Bank</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono">Settled</span>
          </div>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatINR(28500000, true)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Actual pre-pay offsets and post-pay check recoveries executed in clearinghouse remittances year-to-date.
          </p>
        </div>
      </div>

      {/* Main Working Grid: Inputs vs Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Financial Assumptions Sliders & Inputs */}
        <div className="lg:col-span-5 bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider">
                Financial Model Assumptions
              </h3>
              <p className="text-[11px] text-slate-400">
                Calibrate baseline claim volumes, error benchmarks, and technology costs.
              </p>
            </div>
            <Sliders className="w-4 h-4 text-[#39D6C4]" />
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Monthly Volume */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Monthly Claim Volume:</span>
                <span className="font-mono text-slate-200 font-bold">{formValues.monthlyClaimVolume.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={formValues.monthlyClaimVolume}
                onChange={(e) => handleInputChange('monthlyClaimVolume', Number(e.target.value))}
                className="w-full accent-[#39D6C4]"
              />
            </div>

            {/* Baseline Error Rate */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Baseline Error Rate (%):</span>
                <span className="font-mono text-rose-400 font-bold">{formValues.baselineErrorRate}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.2"
                value={formValues.baselineErrorRate}
                onChange={(e) => handleInputChange('baselineErrorRate', Number(e.target.value))}
                className="w-full accent-[#39D6C4]"
              />
            </div>

            {/* Average Overpayment */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Avg Overpayment / Error (₹):</span>
                <span className="font-mono text-amber-400 font-bold">{formatINR(formValues.avgDiscrepancyINR)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="300000"
                step="5000"
                value={formValues.avgDiscrepancyINR}
                onChange={(e) => handleInputChange('avgDiscrepancyINR', Number(e.target.value))}
                className="w-full accent-[#39D6C4]"
              />
            </div>

            {/* Expected Detection Improvement */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Detection Improvement Lift (%):</span>
                <span className="font-mono text-[#39D6C4] font-bold">+{formValues.expectedDetectionImprovement}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="5"
                value={formValues.expectedDetectionImprovement}
                onChange={(e) => handleInputChange('expectedDetectionImprovement', Number(e.target.value))}
                className="w-full accent-[#39D6C4]"
              />
            </div>

            {/* Realization Rate */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Recovery Realization Rate (%):</span>
                <span className="font-mono text-[#789BFF] font-bold">{formValues.realizationRate}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={formValues.realizationRate}
                onChange={(e) => handleInputChange('realizationRate', Number(e.target.value))}
                className="w-full accent-[#39D6C4]"
              />
            </div>

            {/* Review Time Shift */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0B1020] border border-slate-800">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Baseline Review Mins</label>
                <input
                  type="number"
                  value={formValues.currentReviewTimeMinutes}
                  onChange={(e) => handleInputChange('currentReviewTimeMinutes', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Expected Review Mins</label>
                <input
                  type="number"
                  value={formValues.expectedReviewTimeMinutes}
                  onChange={(e) => handleInputChange('expectedReviewTimeMinutes', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[#39D6C4] font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Implementation & Operating Cost */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">CapEx Implementation (₹)</label>
                <input
                  type="number"
                  value={formValues.implementationCostINR}
                  onChange={(e) => handleInputChange('implementationCostINR', Number(e.target.value))}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Annual OpEx (₹)</label>
                <input
                  type="number"
                  value={formValues.annualOperatingCostINR}
                  onChange={(e) => handleInputChange('annualOperatingCostINR', Number(e.target.value))}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>

            {/* Discount Rate */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
              <span className="text-slate-400 text-[11px]">NPV Annual Discount Rate:</span>
              <div className="flex items-center gap-1 font-mono text-xs">
                <input
                  type="number"
                  value={formValues.discountRate}
                  onChange={(e) => handleInputChange('discountRate', Number(e.target.value))}
                  className="w-16 bg-[#0B1020] border border-slate-800 rounded p-1 text-right text-slate-200"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Output KPI Cards, Multi-Year Projection & Sensitivity Heatmap */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Output Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Annual Net Benefit</span>
              <span className="text-lg font-bold font-mono text-[#39D6C4] mt-1 block">
                {formatINR(valueResult.annualNetBenefit, true)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Gross − OpEx</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Year 1 Net Position</span>
              <span className={`text-lg font-bold font-mono mt-1 block ${valueResult.firstYearNetBenefit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatINR(valueResult.firstYearNetBenefit, true)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Less CapEx Setup</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated ROI</span>
              <span className="text-lg font-bold font-mono text-[#789BFF] mt-1 block">
                {formatPercent(valueResult.roiPercent, 0)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Annual Net / CapEx</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Payback Period</span>
              <span className="text-lg font-bold font-mono text-purple-400 mt-1 block">
                {valueResult.paybackPeriodMonths ? `${valueResult.paybackPeriodMonths} mos` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">CapEx Break-Even</span>
            </div>
          </div>

          {/* Operational Labor Capacity Note Box */}
          <div className="p-3.5 rounded-xl bg-[#0B1020]/90 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center justify-between font-mono text-[11px] font-semibold text-[#39D6C4] mb-1">
              <span>Operational Capacity Redeployment Value</span>
              <span>{formatINR(valueResult.operationalCapacityValue)}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Based on {valueResult.annualHoursSaved.toLocaleString()} hours freed per year ({formValues.currentReviewTimeMinutes}m → {formValues.expectedReviewTimeMinutes}m per claim) at ₹{formValues.reviewerHourlyCostINR}/hr. Note: This represents internal capacity headroom unless clinical nurse audit headcount is explicitly reduced.
            </p>
          </div>

          {/* Multi-Year Cash Flow Projection Chart */}
          <div className="bg-[#11192B] border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider">
                  3-Year Cash Flow & Discounted NPV Projection
                </h4>
                <p className="text-[11px] text-slate-400">
                  Modeled at {formValues.discountRate}% discount rate · Cumulative 3-Yr NPV: <strong className="text-[#39D6C4] font-mono">{formatINR(valueResult.npv, true)}</strong>
                </p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueResult.multiYearCashFlows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickFormatter={(yr) => `Year ${yr}`} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)} Cr`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11192B', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => formatINR(Number(val))}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="grossBenefit" name="Gross Benefit" fill="#789BFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="costs" name="Operating Costs" fill="#64748B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netBenefit" name="Net Realized" fill="#39D6C4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sensitivity Analysis Heatmap (Detection Lift vs Realization Rate) */}
          <div className="bg-[#11192B] border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider">
                  Sensitivity Matrix: Annual Net Benefit (₹ Lakhs)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Realization Rate (Vertical) vs Incremental Detection Lift (Horizontal)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="py-2 px-2 text-left">Realization \ Detection</th>
                    {sensitivityMatrix[0]?.cells.map((c, i) => (
                      <th key={i} className="py-2 px-2">{c.detectionRate}% Lift</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {sensitivityMatrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="py-2 px-2 text-left font-bold text-slate-400">
                        {row.realizationRate}%
                      </td>
                      {row.cells.map((cell, cIdx) => {
                        const inLakhs = Math.round(cell.netBenefit / 100000);
                        const isBase = cell.detectionRate === formValues.expectedDetectionImprovement && row.realizationRate === formValues.realizationRate;
                        
                        let cellBg = 'bg-slate-900/40 text-slate-300';
                        if (cell.netBenefit > 20000000) cellBg = 'bg-[#39D6C4]/20 text-[#39D6C4] font-bold';
                        else if (cell.netBenefit > 10000000) cellBg = 'bg-[#39D6C4]/10 text-slate-200';
                        else if (cell.netBenefit <= 0) cellBg = 'bg-rose-500/10 text-rose-400';

                        return (
                          <td 
                            key={cIdx} 
                            className={`py-2 px-2 ${cellBg} ${isBase ? 'ring-2 ring-[#39D6C4] font-bold' : ''}`}
                            title={`Net: ${formatINR(cell.netBenefit)}, ROI: ${cell.roi}%`}
                          >
                            ₹{inLakhs} L
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-2 text-right">
              Highlighted cell with teal ring indicates current active assumption scenario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
