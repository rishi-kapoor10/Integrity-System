import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Claim, ClaimCategory, ClaimReviewStatus, RiskBand } from '../../types';
import { formatINR, formatPercent, formatDate, getRiskBandClass, getStageClass } from '../../utils/formatting';
import { 
  FileSearch, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ArrowUpDown
} from 'lucide-react';

export const ClaimIntelligencePage: React.FC = () => {
  const { claims, updateClaimReview, importClaims, showToast } = useApp();
  const [searchParams] = useSearchParams();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskBandFilter, setRiskBandFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'discrepancy' | 'paid' | 'date'>('risk');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Drawer state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<ClaimReviewStatus>('Under review');
  const [editExpectedAmount, setEditExpectedAmount] = useState<string>('');

  // CSV file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync drawer when selectedClaim changes
  const handleOpenClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setEditNotes(claim.reviewerNotes || '');
    setEditStatus(claim.reviewStatus);
    setEditExpectedAmount(claim.expectedPayableAmount !== null ? String(claim.expectedPayableAmount) : '');
  };

  const handleSaveClaimReview = () => {
    if (!selectedClaim) return;

    const numExpected = editExpectedAmount.trim() !== '' ? Number(editExpectedAmount) : null;
    updateClaimReview(selectedClaim.claimId, editStatus, editNotes, numExpected);
    
    // Update local drawer state
    setSelectedClaim({
      ...selectedClaim,
      reviewStatus: editStatus,
      reviewerNotes: editNotes,
      expectedPayableAmount: numExpected,
      potentialDiscrepancy: numExpected !== null ? Math.max(0, selectedClaim.amountPaid - numExpected) : selectedClaim.potentialDiscrepancy,
    });
  };

  // Filtered & Sorted claims
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        c.claimId.toLowerCase().includes(q) ||
        c.providerName.toLowerCase().includes(q) ||
        c.providerId.toLowerCase().includes(q) ||
        c.detectionReason.toLowerCase().includes(q);

      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      const matchesRisk = riskBandFilter === 'all' || c.riskBand === riskBandFilter;
      const matchesStatus = statusFilter === 'all' || c.reviewStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesRisk && matchesStatus;
    }).sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'risk') cmp = b.simulatedRiskScore - a.simulatedRiskScore;
      else if (sortBy === 'discrepancy') cmp = (b.potentialDiscrepancy || 0) - (a.potentialDiscrepancy || 0);
      else if (sortBy === 'paid') cmp = b.amountPaid - a.amountPaid;
      else if (sortBy === 'date') cmp = new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime();
      return sortDirection === 'desc' ? cmp : -cmp;
    });
  }, [claims, searchQuery, categoryFilter, riskBandFilter, statusFilter, sortBy, sortDirection]);

  // Export Filtered Claims to CSV
  const handleExportCSV = () => {
    const headers = [
      'Claim ID',
      'Provider ID',
      'Provider Name',
      'Category',
      'Service Date',
      'Amount Billed (INR)',
      'Amount Paid (INR)',
      'Expected Payable (INR)',
      'Potential Discrepancy (INR)',
      'Simulated Risk Score',
      'Risk Band',
      'Detection Reason',
      'Review Status',
      'Reviewer Notes',
    ];

    const rows = filteredClaims.map(c => [
      c.claimId,
      c.providerId,
      `"${c.providerName}"`,
      `"${c.category}"`,
      c.serviceDate,
      c.amountBilled,
      c.amountPaid,
      c.expectedPayableAmount ?? '',
      c.potentialDiscrepancy ?? '',
      c.simulatedRiskScore,
      c.riskBand,
      `"${c.detectionReason.replace(/"/g, '""')}"`,
      c.reviewStatus,
      `"${(c.reviewerNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `integrity_os_claims_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Successful', `Exported ${filteredClaims.length} filtered claims to CSV.`, 'success');
  };

  // Download Sample CSV Template
  const handleDownloadSampleCSV = () => {
    const headers = [
      'Claim ID',
      'Provider ID',
      'Provider Name',
      'Category',
      'Service Date',
      'Amount Billed (INR)',
      'Amount Paid (INR)',
      'Expected Payable (INR)',
      'Potential Discrepancy (INR)',
      'Simulated Risk Score',
      'Risk Band',
      'Detection Reason',
      'Review Status',
      'Reviewer Notes',
    ];
    const sampleRow = [
      'CLM-SAMPLE01',
      'PRV-8491',
      '"Apex Multi-Specialty Hospital"',
      '"Inpatient DRG"',
      '2026-09-01',
      '450000',
      '380000',
      '280000',
      '100000',
      '88',
      'High',
      '"Sample detection reason for import testing"',
      'Flagged',
      '"Auditor test note"',
    ];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'integrity_os_claims_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          showToast('Import Error', 'CSV file is empty or missing data rows.', 'error');
          return;
        }

        const parsedClaims: Claim[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          if (cols.length < 5) continue;

          const claimId = cols[0] || `CLM-${Date.now().toString().slice(-6)}`;
          const providerId = cols[1] || 'PRV-UNKNOWN';
          const providerName = cols[2] || 'Regional Medical Provider';
          const category = (cols[3] || 'Inpatient DRG') as ClaimCategory;
          const serviceDate = cols[4] || new Date().toISOString().split('T')[0];
          const amountBilled = Number(cols[5]) || 50000;
          const amountPaid = Number(cols[6]) || 40000;
          const expectedPayable = cols[7] ? Number(cols[7]) : null;
          const potentialDiscrepancy = expectedPayable !== null ? Math.max(0, amountPaid - expectedPayable) : (cols[8] ? Number(cols[8]) : null);
          const score = Number(cols[9]) || 50;
          const band = (cols[10] || (score >= 75 ? 'High' : score >= 45 ? 'Medium' : 'Low')) as RiskBand;
          const reason = cols[11] || 'Imported claim record.';
          const status = (cols[12] || 'Flagged') as ClaimReviewStatus;
          const notes = cols[13] || '';

          parsedClaims.push({
            claimId,
            providerId,
            providerName,
            category,
            serviceDate,
            amountBilled,
            amountPaid,
            expectedPayableAmount: expectedPayable,
            potentialDiscrepancy,
            simulatedRiskScore: score,
            riskBand: band,
            detectionReason: reason,
            riskFeatureTriggers: ['Batch CSV imported claim indicator'],
            reviewStatus: status,
            reviewerNotes: notes,
          });
        }

        const res = importClaims(parsedClaims);
        if (res.errors.length > 0) {
          showToast('Import Warnings', `Imported ${res.successCount} claims. ${res.errors.length} issue(s) detected.`, 'warning');
        }
      } catch (err) {
        showToast('Import Failed', 'Unable to parse CSV file. Ensure valid format.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-[#39D6C4]" />
            Claim Intelligence Investigation Workbench
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthetic claims engine: inspect simulated risk signals, evaluate feature triggers, and audit determinations.
          </p>
        </div>

        {/* Export / Import Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSampleCSV}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Download CSV format template"
          >
            Sample Template
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#39D6C4] hover:bg-[#39D6C4]/90 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#11192B] border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Claim ID, Provider, or Reason..."
              className="w-full bg-[#0B1020] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#39D6C4]/50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0B1020] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Inpatient DRG">Inpatient DRG</option>
            <option value="Outpatient Surgery">Outpatient Surgery</option>
            <option value="Professional E&M">Professional E&M</option>
            <option value="Durable Medical Equipment">Durable Medical Equipment</option>
            <option value="Pharmacy Injectable">Pharmacy Injectable</option>
            <option value="Radiology & Lab">Radiology & Lab</option>
          </select>

          {/* Risk Band Filter */}
          <select
            value={riskBandFilter}
            onChange={(e) => setRiskBandFilter(e.target.value)}
            className="bg-[#0B1020] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Risk Bands</option>
            <option value="High">High Risk (Score ≥ 75)</option>
            <option value="Medium">Medium Risk (Score 45-74)</option>
            <option value="Low">Low Risk (Score &lt; 45)</option>
          </select>

          {/* Review Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B1020] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Review States</option>
            <option value="Flagged">Flagged</option>
            <option value="Under review">Under review</option>
            <option value="Confirmed error">Confirmed error</option>
            <option value="Cleared">Cleared</option>
            <option value="Insufficient evidence">Insufficient evidence</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0B1020] border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="risk">Simulated Risk Score</option>
            <option value="discrepancy">Potential Discrepancy (INR)</option>
            <option value="paid">Amount Paid (INR)</option>
            <option value="date">Date of Service</option>
          </select>

          <button
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 rounded-lg bg-[#0B1020] border border-slate-800 text-slate-300 hover:text-white"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Claim Count & Status Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing <strong className="text-slate-200 font-mono">{filteredClaims.length}</strong> of <span className="font-mono">{claims.length}</span> synthetic claims</span>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-rose-400">High: {claims.filter(c => c.riskBand === 'High').length}</span>
          <span className="text-amber-400">Medium: {claims.filter(c => c.riskBand === 'Medium').length}</span>
          <span className="text-emerald-400">Low: {claims.filter(c => c.riskBand === 'Low').length}</span>
        </div>
      </div>

      {/* High-Density Claims Data Table */}
      <div className="bg-[#11192B] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0B1020]/90 text-[11px] font-mono font-medium text-slate-400 uppercase">
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Provider / Facility</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Service Date</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Expected</th>
                <th className="py-3 px-4 text-right">Discrepancy</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No claims match your search or filter criteria. Try broadening your filters.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const riskStyle = getRiskBandClass(claim.riskBand);
                  return (
                    <tr
                      key={claim.claimId}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenClaim(claim)}
                    >
                      {/* Claim ID */}
                      <td className="py-3 px-4 font-mono font-semibold text-[#789BFF] whitespace-nowrap">
                        {claim.claimId}
                      </td>

                      {/* Provider */}
                      <td className="py-3 px-4 min-w-[160px] max-w-[220px]">
                        <span className="font-medium text-slate-200 block truncate" title={claim.providerName}>
                          {claim.providerName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {claim.providerId}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {claim.category}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {formatDate(claim.serviceDate)}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200 whitespace-nowrap">
                        {formatINR(claim.amountPaid)}
                      </td>

                      {/* Expected Payable Amount */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400 whitespace-nowrap">
                        {claim.expectedPayableAmount !== null ? formatINR(claim.expectedPayableAmount) : '—'}
                      </td>

                      {/* Potential Discrepancy */}
                      <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                        {claim.potentialDiscrepancy !== null && claim.potentialDiscrepancy > 0 ? (
                          <span className="font-bold text-rose-400">
                            {formatINR(claim.potentialDiscrepancy)}
                          </span>
                        ) : claim.potentialDiscrepancy === 0 ? (
                          <span className="text-slate-500 font-mono">₹0 (Valid)</span>
                        ) : (
                          <span className="text-slate-500 font-mono">Unknown</span>
                        )}
                      </td>

                      {/* Simulated Risk Score */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono font-bold text-xs ${riskStyle.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dot}`} />
                          {claim.simulatedRiskScore}
                        </span>
                      </td>

                      {/* Review Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${getStageClass(claim.reviewStatus)}`}>
                          {claim.reviewStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenClaim(claim);
                          }}
                          className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-200 hover:bg-[#39D6C4] hover:text-slate-950 transition-colors font-medium"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Investigation Drawer */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedClaim(null)}
          />

          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-[#11192B] border-l border-slate-800 shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0B1020]/90">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#789BFF] px-2 py-0.5 rounded bg-[#789BFF]/10">
                  {selectedClaim.claimId}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${getStageClass(selectedClaim.reviewStatus)}`}>
                  {selectedClaim.reviewStatus}
                </span>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close investigation drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Financial & Clinical Summary */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {selectedClaim.providerName}
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Provider ID: <span className="font-mono text-slate-300">{selectedClaim.providerId}</span> · Category: <span className="text-slate-300">{selectedClaim.category}</span> · Service Date: <span className="font-mono text-slate-300">{formatDate(selectedClaim.serviceDate)}</span>
                </p>
              </div>

              {/* Financial Box */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#0B1020]/80 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Amount Paid</span>
                  <span className="text-sm font-bold text-slate-200">
                    {formatINR(selectedClaim.amountPaid)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Expected Payable</span>
                  <span className="text-sm font-bold text-slate-400">
                    {selectedClaim.expectedPayableAmount !== null ? formatINR(selectedClaim.expectedPayableAmount) : 'Pending Audit'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Potential Discrepancy</span>
                  <span className="text-sm font-bold text-rose-400">
                    {selectedClaim.potentialDiscrepancy !== null ? formatINR(selectedClaim.potentialDiscrepancy) : 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Transparent Decision Support Panel */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#39D6C4] font-semibold text-xs font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Decision Support: Synthetic Risk Flag Explanation</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${getRiskBandClass(selectedClaim.riskBand).badge}`}>
                    Score: {selectedClaim.simulatedRiskScore}/100 ({selectedClaim.riskBand})
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-300 text-[11px]">Detection Rationale:</span>
                  <p className="text-slate-300 leading-relaxed bg-[#0B1020]/70 p-2.5 rounded-lg border border-slate-800/80">
                    {selectedClaim.detectionReason}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-300 text-[11px] block mb-1.5">
                    Feature Triggers Activated in Synthetic Model:
                  </span>
                  <ul className="space-y-1.5">
                    {selectedClaim.riskFeatureTriggers.map((trig, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#39D6C4] mt-1.5 shrink-0" />
                        <span>{trig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800/80">
                  Note: A high simulated risk score flags anomalous billing patterns for investigation; it does not constitute confirmed clinical fraud or proven overpayment.
                </p>
              </div>

              {/* Review Determination & Notes Controls */}
              <div className="p-4 rounded-xl bg-[#0B1020]/90 border border-slate-800 space-y-3">
                <span className="font-semibold text-slate-200 font-mono text-xs uppercase block">
                  Auditor Determination & Disposition
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Audit Determination:</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ClaimReviewStatus)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Flagged">Flagged (Awaiting review)</option>
                      <option value="Under review">Under review (Records requested)</option>
                      <option value="Confirmed error">Confirmed error (Discrepancy substantiated)</option>
                      <option value="Cleared">Cleared (Billing verified compliant)</option>
                      <option value="Insufficient evidence">Insufficient evidence (Inconclusive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Expected Payable (₹):</label>
                    <input
                      type="number"
                      value={editExpectedAmount}
                      onChange={(e) => setEditExpectedAmount(e.target.value)}
                      placeholder="e.g. 485000"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Clinical Reviewer Notes:</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter audit findings, EHR chart references, doctor queries, or adjustment letter notes..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#39D6C4]/50"
                  />
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#0B1020]/90 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedClaim.lastReviewedAt ? `Last saved: ${formatDate(selectedClaim.lastReviewedAt)}` : 'Pending review'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveClaimReview}
                  className="px-4 py-1.5 rounded-lg bg-[#39D6C4] hover:bg-[#39D6C4]/90 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
                >
                  Save Determination
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
