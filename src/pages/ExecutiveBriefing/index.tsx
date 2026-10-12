import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  generateExecutiveBrief, 
  BriefAudience, 
  BriefDetailLevel 
} from '../../utils/briefGenerator';
import { calculateValueModel } from '../../utils/calculations';
import { 
  FileText, 
  Copy, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Sparkles,
  ChevronRight,
  Send
} from 'lucide-react';

export const ExecutiveBriefingPage: React.FC = () => {
  const { 
    opportunities, 
    solutions, 
    pilots, 
    governanceRecords, 
    valueAssumptions,
    selectedOpportunityId,
    setSelectedOpportunityId,
    showToast 
  } = useApp();

  const [searchParams] = useSearchParams();
  const initialOppId = searchParams.get('opportunityId') || selectedOpportunityId || opportunities[0].id;

  const [activeOppId, setActiveOppId] = useState<string>(initialOppId);
  const [audience, setAudience] = useState<BriefAudience>('Executive Leadership / Investment Committee');
  const [detailLevel, setDetailLevel] = useState<BriefDetailLevel>('Full Strategy Brief');

  const selectedOpp = useMemo(() => {
    return opportunities.find(o => o.id === activeOppId) || opportunities[0];
  }, [opportunities, activeOppId]);

  const linkedSolutions = useMemo(() => {
    return solutions.filter(s => s.opportunityId === selectedOpp.id);
  }, [solutions, selectedOpp]);

  const recommendedSol = useMemo(() => {
    return linkedSolutions.find(s => s.isRecommended) || linkedSolutions[0];
  }, [linkedSolutions]);

  const linkedPilot = useMemo(() => {
    return pilots.find(p => p.opportunityId === selectedOpp.id);
  }, [pilots, selectedOpp]);

  const linkedGov = useMemo(() => {
    return governanceRecords.find(g => g.opportunityId === selectedOpp.id);
  }, [governanceRecords, selectedOpp]);

  const valueResult = useMemo(() => {
    return calculateValueModel(valueAssumptions);
  }, [valueAssumptions]);

  // Generate Executive Briefing
  const brief = useMemo(() => {
    return generateExecutiveBrief(
      selectedOpp,
      linkedSolutions,
      recommendedSol,
      linkedPilot,
      linkedGov,
      valueResult,
      audience,
      detailLevel
    );
  }, [selectedOpp, linkedSolutions, recommendedSol, linkedPilot, linkedGov, valueResult, audience, detailLevel]);

  // Copy brief as text
  const handleCopy = () => {
    const text = [
      brief.title,
      `Audience: ${brief.audience}`,
      `Date: ${brief.generatedDate}`,
      `Strategic Verdict: ${brief.verdict}`,
      `Verdict Rationale: ${brief.verdictRationale}`,
      '--------------------------------------------------',
      ...brief.sections.map(s => `\n${s.number}. ${s.title.toUpperCase()}\n${s.content}\n${s.bullets ? s.bullets.map(b => `  • ${b}`).join('\n') : ''}`),
    ].join('\n');

    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', 'Executive briefing text copied.', 'success');
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    const md = [
      `# ${brief.title}`,
      `**Audience:** ${brief.audience}  `,
      `**Date:** ${brief.generatedDate}  `,
      `**Strategic Recommendation:** ${brief.verdict}  `,
      `**Verdict Rationale:** ${brief.verdictRationale}  `,
      '',
      '---',
      '',
      ...brief.sections.map(s => [
        `## ${s.number}. ${s.title}`,
        '',
        s.content,
        '',
        ...(s.bullets ? s.bullets.map(b => `- ${b}`) : []),
        '',
      ].join('\n')),
    ].join('\n');

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedOpp.id}_executive_briefing.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Downloaded', `Saved as ${selectedOpp.id}_executive_briefing.md`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#39D6C4]" />
            Executive Briefing & Investment Memo Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic leadership briefs synthesizing evidence, pilot metrics, cost-benefit models, and scale verdicts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#39D6C4] hover:bg-[#39D6C4]/90 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Initiative, Audience, Level of Detail */}
      <div className="p-4 rounded-xl bg-[#11192B] border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        {/* Initiative Selector */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1 font-medium">Selected Initiative:</label>
          <select
            value={activeOppId}
            onChange={(e) => {
              setActiveOppId(e.target.value);
              setSelectedOpportunityId(e.target.value);
            }}
            className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-[#39D6C4]/50"
          >
            {opportunities.map(o => (
              <option key={o.id} value={o.id}>
                {o.id}: {o.title.slice(0, 36)}...
              </option>
            ))}
          </select>
        </div>

        {/* Audience Selector */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1 font-medium">Briefing Audience:</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as BriefAudience)}
            className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-[#39D6C4]/50"
          >
            <option value="Executive Leadership / Investment Committee">Executive Leadership / Investment Committee</option>
            <option value="Chief Financial Officer & Actuarial">Chief Financial Officer & Actuarial</option>
            <option value="Chief Medical Officer & Clinical Policy">Chief Medical Officer & Clinical Policy</option>
            <option value="VP Payment Integrity Operations">VP Payment Integrity Operations</option>
          </select>
        </div>

        {/* Level of Detail */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1 font-medium">Scope & Detail Level:</label>
          <select
            value={detailLevel}
            onChange={(e) => setDetailLevel(e.target.value as BriefDetailLevel)}
            className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-[#39D6C4]/50"
          >
            <option value="Full Strategy Brief">Full Strategy Brief (All 13 Sections)</option>
            <option value="Executive Summary">Executive Summary (Curated 7 Key Decision Sections)</option>
          </select>
        </div>
      </div>

      {/* The Printable Briefing Document Card */}
      <div className="bg-[#11192B] border border-slate-800 rounded-xl p-6 lg:p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Memo Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>MEMORANDUM · EXL PAYMENT INTEGRITY INNOVATION</span>
            <span>{brief.generatedDate}</span>
          </div>

          <h1 className="text-xl font-bold text-slate-100 tracking-tight leading-snug">
            {brief.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
            <span><strong>Target Forum:</strong> {brief.audience}</span>
            <span>•</span>
            <span><strong>Sponsor:</strong> {selectedOpp.owner}</span>
            <span>•</span>
            <span><strong>Scope:</strong> {brief.detailLevel}</span>
          </div>
        </div>

        {/* Strategic Recommendation Callout Banner */}
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          brief.verdict === 'Recommend Scale'
            ? 'bg-[#39D6C4]/10 border-[#39D6C4]/40 text-slate-100'
            : brief.verdict === 'Recommend Optimization'
            ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
            : 'bg-rose-500/10 border-rose-500/40 text-slate-100'
        }`}>
          <div className="mt-0.5">
            {brief.verdict === 'Recommend Scale' ? (
              <CheckCircle2 className="w-5 h-5 text-[#39D6C4] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider block opacity-75">
              Strategic Verdict & Action Mandate
            </span>
            <h4 className="text-sm font-bold mt-0.5">{brief.verdict}</h4>
            <p className="mt-1 leading-relaxed opacity-90">{brief.verdictRationale}</p>
          </div>
        </div>

        {/* Known Limitations / Missing Information Disclaimer */}
        {brief.unknowns.length > 0 && (
          <div className="p-3 rounded-lg bg-[#0B1020] border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-amber-400 font-mono text-[11px] block mb-1">
              Data Integrity & Unknowns Disclosure:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
              {brief.unknowns.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 13 Structured Memo Sections */}
        <div className="space-y-6 pt-2">
          {brief.sections.map((section) => (
            <div key={section.number} className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#39D6C4] text-[11px]">
                  {section.number}.
                </span>
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">
                  {section.title}
                </h3>
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">
                {section.content}
              </p>

              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-2 space-y-1 pl-4 list-disc text-slate-300">
                  {section.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Memo Footer Sign-off */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="block font-semibold text-slate-200">Payment Integrity Innovation Council</span>
            <span className="text-[11px]">Aegis Health Plan Strategic Innovation Portfolio</span>
          </div>
          <div className="text-right font-mono text-[11px]">
            Document ID: MEMO-{selectedOpp.id}-{new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
