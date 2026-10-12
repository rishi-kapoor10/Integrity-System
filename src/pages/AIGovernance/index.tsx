import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GovernanceRecord, GovernanceStatus, GovernanceIssue } from '../../types';
import { formatDate, getStageClass } from '../../utils/formatting';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  X, 
  Plus, 
  History, 
  FileText, 
  User, 
  Search,
  Eye,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AIGovernancePage: React.FC = () => {
  const { 
    governanceRecords, 
    governanceDebt, 
    auditEvents, 
    updateGovernanceRecord, 
    resolveGovernanceIssue, 
    addGovernanceIssue,
    showToast 
  } = useApp();

  const [selectedRecordId, setSelectedRecordId] = useState<string>(governanceRecords[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'records' | 'debt' | 'audit'>('records');

  const selectedRecord = useMemo(() => {
    return governanceRecords.find(g => g.id === selectedRecordId) || governanceRecords[0];
  }, [governanceRecords, selectedRecordId]);

  // Modal to add governance issue
  const [isAddIssueOpen, setAddIssueOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    severity: 'High' as 'Critical' | 'High' | 'Medium' | 'Low',
    actionRequired: '',
    owner: 'Rahul Deshmukh',
  });

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.title || !selectedRecord) return;

    addGovernanceIssue(selectedRecord.id, {
      title: newIssue.title,
      description: newIssue.description,
      severity: newIssue.severity,
      status: 'Open',
      actionRequired: newIssue.actionRequired,
      owner: newIssue.owner,
    });

    setAddIssueOpen(false);
    setNewIssue({
      title: '',
      description: '',
      severity: 'High',
      actionRequired: '',
      owner: 'Rahul Deshmukh',
    });
  };

  const handleUpdateStatus = (newStatus: GovernanceStatus) => {
    if (!selectedRecord) return;
    updateGovernanceRecord({
      ...selectedRecord,
      status: newStatus,
      reviewDecisionDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#39D6C4]" />
            AI Governance, Ethics & Model Risk Docket
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operationalize responsible AI: track human oversight mandates, explainability, PHI guardrails, and active governance debt.
          </p>
        </div>

        {/* View Segment Tabs */}
        <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'records' ? 'bg-[#39D6C4]/15 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Governance Records
          </button>
          <button
            onClick={() => setActiveTab('debt')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'debt' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Governance Debt</span>
            {governanceDebt.totalOpenIssues > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200">
                {governanceDebt.totalOpenIssues}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'audit' ? 'bg-[#39D6C4]/15 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Local Audit Log
          </button>
        </div>
      </div>

      {/* Governance Debt KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Governance Health</span>
          <span className={`text-base font-bold font-mono mt-1 block ${
            governanceDebt.criticalCount > 0 ? 'text-rose-400' : governanceDebt.highCount > 0 ? 'text-amber-400' : 'text-[#39D6C4]'
          }`}>
            {governanceDebt.severitySummary} Status
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Workflow debt state</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Critical Blocking Debt</span>
          <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
            {governanceDebt.criticalCount}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Blocks production scale</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">High / Medium Issues</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
            {governanceDebt.highCount + governanceDebt.mediumCount}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Conditional remediations</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#11192B] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Oldest Unresolved Debt</span>
          <span className="text-xl font-bold font-mono text-slate-200 mt-1 block">
            {governanceDebt.maxDaysOpen} days
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Days open in review</span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'records' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: Docket Selector */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
              Active Initiative Dockets ({governanceRecords.length})
            </span>
            {governanceRecords.map((rec) => {
              const isSelected = selectedRecord?.id === rec.id;
              const hasCrit = rec.issues.some(i => i.severity === 'Critical' && i.status === 'Open');
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#172238] border-[#39D6C4] shadow-md shadow-[#39D6C4]/10'
                      : 'bg-[#11192B] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#39D6C4]">{rec.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${getStageClass(rec.status)}`}>
                      {rec.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mt-1.5 line-clamp-2">
                    {rec.title}
                  </h4>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{rec.issues.filter(i => i.status === 'Open').length} open issue(s)</span>
                    {hasCrit && (
                      <span className="text-rose-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Critical Debt
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 8 Cols: Selected Docket Deep Dive */}
          {selectedRecord && (
            <div className="lg:col-span-8 bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
              {/* Docket Header & Decision Control */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#39D6C4] px-2 py-0.5 rounded bg-[#39D6C4]/10">
                      {selectedRecord.id}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStageClass(selectedRecord.status)}`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1.5">
                    {selectedRecord.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Accountable Lead: <span className="text-slate-200">{selectedRecord.accountableBusinessOwner}</span> · Updated: <span className="font-mono text-slate-400">{formatDate(selectedRecord.updatedAt)}</span>
                  </p>
                </div>

                {/* Review Decision Setter */}
                <div className="shrink-0 flex items-center gap-2">
                  <label className="text-xs text-slate-400">Council Decision:</label>
                  <select
                    value={selectedRecord.status}
                    onChange={(e) => handleUpdateStatus(e.target.value as GovernanceStatus)}
                    className="bg-[#0B1020] border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 font-medium focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under review">Under review</option>
                    <option value="Approved with conditions">Approved with conditions</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Reassessment required">Reassessment required</option>
                  </select>
                </div>
              </div>

              {/* Core Governance Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                {/* Card 1: Intended Use & Data Scope */}
                <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-300 font-mono text-[11px] uppercase block">
                    Intended Business Use & Data Scope
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedRecord.intendedBusinessUse}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block mb-1">Permitted Data Categories:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRecord.dataCategories.map((c, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 2: Human Oversight & Traceability */}
                <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800 space-y-2">
                  <span className="font-semibold text-purple-400 font-mono text-[11px] uppercase block">
                    Human-in-the-Loop Oversight Mandate
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedRecord.humanOversightRequirements}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block">Explainability & Auditability:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {selectedRecord.explainabilityAndTraceability}
                    </p>
                  </div>
                </div>

                {/* Card 3: Privacy, PHI & VPC Security */}
                <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800 space-y-2">
                  <span className="font-semibold text-emerald-400 font-mono text-[11px] uppercase block">
                    Privacy & PHI Protection
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedRecord.privacyConsiderations}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    {selectedRecord.securityConsiderations}
                  </p>
                </div>

                {/* Card 4: Model Limitations & Failure Fallbacks */}
                <div className="p-3.5 rounded-lg bg-[#0B1020]/90 border border-slate-800 space-y-2">
                  <span className="font-semibold text-amber-400 font-mono text-[11px] uppercase block">
                    Explicit Model Limitations & Fallbacks
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {selectedRecord.modelLimitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <strong className="text-slate-300">Failure Fallback: </strong>
                    {selectedRecord.failureAndFallbackProcedures}
                  </p>
                </div>
              </div>

              {/* Conditions for Approval */}
              {selectedRecord.conditionsForApproval.length > 0 && (
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-semibold text-[#39D6C4] font-mono text-[11px] uppercase block mb-1.5">
                    Mandatory Conditions for Production Scale Approval:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {selectedRecord.conditionsForApproval.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#39D6C4] shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues / Governance Debt under this Docket */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider">
                    Docket Issues & Remediation Items ({selectedRecord.issues.length})
                  </span>
                  <button
                    onClick={() => setAddIssueOpen(true)}
                    className="flex items-center gap-1 text-xs text-[#39D6C4] hover:text-white font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Issue
                  </button>
                </div>

                {selectedRecord.issues.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#0B1020] border border-slate-800 text-center text-slate-500 text-xs">
                    No active issues recorded under this governance docket.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedRecord.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          issue.status === 'Resolved'
                            ? 'bg-[#0B1020]/60 border-slate-800 opacity-60'
                            : issue.severity === 'Critical'
                            ? 'bg-rose-950/20 border-rose-900/50'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-400">{issue.id}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                              issue.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {issue.severity}
                            </span>
                            <span className="text-slate-400 text-[11px] font-mono">
                              Open for {issue.daysOpen} days
                            </span>
                          </div>
                          <h5 className="font-semibold text-slate-200">{issue.title}</h5>
                          <p className="text-slate-400 text-[11px]">{issue.description}</p>
                          <div className="text-[11px] text-slate-300">
                            <strong className="text-slate-200">Required Action: </strong>{issue.actionRequired} (Owner: {issue.owner})
                          </div>
                        </div>

                        {issue.status === 'Open' ? (
                          <button
                            onClick={() => resolveGovernanceIssue(selectedRecord.id, issue.id)}
                            className="px-3 py-1 rounded bg-[#39D6C4]/15 hover:bg-[#39D6C4] text-[#39D6C4] hover:text-slate-950 border border-[#39D6C4]/30 font-medium text-xs transition-colors shrink-0"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Governance Debt Overview Tab */}
      {activeTab === 'debt' && (
        <div className="bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider">
                Unresolved AI Governance Debt Across Active Initiatives
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Outstanding technical, clinical, or data compliance prerequisites that must be satisfied before full enterprise scaling.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {governanceDebt.criticalCount} Critical Blockers
            </span>
          </div>

          <div className="space-y-3">
            {governanceRecords.flatMap(g => g.issues.filter(i => i.status === 'Open').map(iss => ({ ...iss, recordTitle: g.title, recordId: g.id }))).length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Zero open governance debt items. All active models are fully cleared.
              </div>
            ) : (
              governanceRecords.flatMap(g => g.issues.filter(i => i.status === 'Open').map(iss => ({ ...iss, recordTitle: g.title, recordId: g.id }))).map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    item.severity === 'Critical' 
                      ? 'bg-rose-950/20 border-rose-900/50' 
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300">{item.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold uppercase ${
                        item.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.severity}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Open for <strong className="text-slate-200 font-mono">{item.daysOpen} days</strong>
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100">{item.title}</h4>
                    <p className="text-slate-400 text-[11px]">{item.description}</p>
                    
                    <div className="text-[11px] text-slate-300 pt-1">
                      <strong className="text-[#39D6C4]">Remediation Action: </strong>{item.actionRequired} (Assigned to: {item.owner})
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Associated Docket: {item.recordId} ({item.recordTitle})
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => resolveGovernanceIssue(item.recordId, item.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#39D6C4]/15 hover:bg-[#39D6C4] text-[#39D6C4] hover:text-slate-950 font-medium text-xs transition-colors"
                    >
                      Resolve Debt Item
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Local Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 font-mono uppercase tracking-wider">
                Local Client-Side Audit Trail
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Session history of user determinations, model re-weighting, and governance decisions stored in browser LocalStorage.
              </p>
            </div>
            <History className="w-4 h-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B1020] text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{evt.timestamp}</td>
                    <td className="py-2.5 px-3 text-[#39D6C4]">{evt.module}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium">{evt.action}</td>
                    <td className="py-2.5 px-3 text-slate-400">{evt.actor}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{evt.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {isAddIssueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#39D6C4]" />
                Log Governance Issue
              </h3>
              <button onClick={() => setAddIssueOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  placeholder="e.g., Optical character OCR grounding confidence threshold"
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-[#39D6C4]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Severity *</label>
                <select
                  value={newIssue.severity}
                  onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value as any })}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100"
                >
                  <option value="Critical">Critical (Blocks scale readiness gate)</option>
                  <option value="High">High (Requires condition resolution)</option>
                  <option value="Medium">Medium (Operational advisory)</option>
                  <option value="Low">Low (Documentation item)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Issue Description</label>
                <textarea
                  rows={2}
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Action Required</label>
                <input
                  type="text"
                  value={newIssue.actionRequired}
                  onChange={(e) => setNewIssue({ ...newIssue, actionRequired: e.target.value })}
                  placeholder="e.g. Implement pre-processing image sharpness check"
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddIssueOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#39D6C4] text-slate-950 font-semibold"
                >
                  Log Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
