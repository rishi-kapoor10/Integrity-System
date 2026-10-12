import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Claim, 
  Opportunity, 
  SolutionOption, 
  Pilot, 
  GovernanceRecord, 
  GovernanceIssue,
  ValueAssumptions, 
  PrioritizationWeights,
  AuditEvent,
  ExecutiveInsight,
  ClaimReviewStatus,
  ScaleReadinessChecklist
} from '../types';
import { 
  SEED_CLAIMS, 
  SEED_OPPORTUNITIES, 
  SEED_SOLUTIONS, 
  SEED_PILOTS, 
  SEED_GOVERNANCE, 
  SEED_VALUE_ASSUMPTIONS, 
  SEED_AUDIT_EVENTS 
} from '../data/seedData';
import { 
  DEFAULT_WEIGHTS, 
  calculateValueModel, 
  calculateGovernanceDebt, 
  evaluateScaleReadiness,
  calculatePriorityScore
} from '../utils/calculations';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Data
  opportunities: Opportunity[];
  claims: Claim[];
  solutions: SolutionOption[];
  pilots: Pilot[];
  governanceRecords: GovernanceRecord[];
  valueAssumptions: ValueAssumptions;
  prioritizationWeights: PrioritizationWeights;
  auditEvents: AuditEvent[];
  toasts: ToastItem[];
  currencyMode: 'INR_COMPACT' | 'INR_FULL';
  selectedOpportunityId: string;
  isSearchOpen: boolean;
  isNotificationsOpen: boolean;

  // Modifiers
  setSelectedOpportunityId: (id: string) => void;
  setCurrencyMode: (mode: 'INR_COMPACT' | 'INR_FULL') => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  showToast: (title: string, message?: string, type?: ToastItem['type']) => void;
  dismissToast: (id: string) => void;

  // Actions
  updateClaimReview: (
    claimId: string, 
    reviewStatus: ClaimReviewStatus, 
    reviewerNotes?: string, 
    expectedPayableAmount?: number | null
  ) => void;
  importClaims: (imported: Claim[]) => { successCount: number; errors: string[] };
  
  createOpportunity: (opp: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'whyThisWhyNow'>) => Opportunity;
  updateOpportunity: (opp: Opportunity) => void;
  deleteOpportunity: (id: string) => void;
  
  createPilot: (pilot: Omit<Pilot, 'id'>) => Pilot;
  updatePilot: (pilot: Pilot) => void;
  updateScaleReadiness: (pilotId: string, checklist: Partial<ScaleReadinessChecklist>) => void;
  
  updateGovernanceRecord: (record: GovernanceRecord) => void;
  resolveGovernanceIssue: (recordId: string, issueId: string) => void;
  addGovernanceIssue: (recordId: string, issue: Omit<GovernanceIssue, 'id' | 'governanceRecordId' | 'daysOpen'>) => void;
  
  updateValueAssumptions: (assumptions: ValueAssumptions) => void;
  updatePrioritizationWeights: (weights: PrioritizationWeights) => void;
  resetDemoData: () => void;
  
  // Computed summaries
  kpis: {
    totalOpportunities: number;
    opportunitiesUnderEvaluation: number;
    activePilots: number;
    pilotsReadyForDecision: number;
    totalEstimatedGrossBenefit: number;
    totalEstimatedNetBenefit: number;
    initiativesAwaitingGovernance: number;
  };
  governanceDebt: ReturnType<typeof calculateGovernanceDebt>;
  executiveInsights: ExecutiveInsight[];
}

const STORAGE_KEY = 'integrity_os_state_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or seed data
  const loadStored = <T,>(subKey: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${subKey}`);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Fallback
    }
    return fallback;
  };

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => loadStored('opps', SEED_OPPORTUNITIES));
  const [claims, setClaims] = useState<Claim[]>(() => loadStored('claims', SEED_CLAIMS));
  const [solutions, setSolutions] = useState<SolutionOption[]>(() => loadStored('solutions', SEED_SOLUTIONS));
  const [pilots, setPilots] = useState<Pilot[]>(() => loadStored('pilots', SEED_PILOTS));
  const [governanceRecords, setGovernanceRecords] = useState<GovernanceRecord[]>(() => loadStored('gov', SEED_GOVERNANCE));
  const [valueAssumptions, setValueAssumptions] = useState<ValueAssumptions>(() => loadStored('assumptions', SEED_VALUE_ASSUMPTIONS));
  const [prioritizationWeights, setPrioritizationWeights] = useState<PrioritizationWeights>(() => loadStored('weights', DEFAULT_WEIGHTS));
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => loadStored('audit', SEED_AUDIT_EVENTS));

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [currencyMode, setCurrencyMode] = useState<'INR_COMPACT' | 'INR_FULL'>('INR_COMPACT');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>(() => {
    return opportunities.length > 0 ? opportunities[0].id : 'OPP-101';
  });
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_opps`, JSON.stringify(opportunities));
      localStorage.setItem(`${STORAGE_KEY}_claims`, JSON.stringify(claims));
      localStorage.setItem(`${STORAGE_KEY}_solutions`, JSON.stringify(solutions));
      localStorage.setItem(`${STORAGE_KEY}_pilots`, JSON.stringify(pilots));
      localStorage.setItem(`${STORAGE_KEY}_gov`, JSON.stringify(governanceRecords));
      localStorage.setItem(`${STORAGE_KEY}_assumptions`, JSON.stringify(valueAssumptions));
      localStorage.setItem(`${STORAGE_KEY}_weights`, JSON.stringify(prioritizationWeights));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditEvents));
    } catch {
      // Ignore quota errors
    }
  }, [opportunities, claims, solutions, pilots, governanceRecords, valueAssumptions, prioritizationWeights, auditEvents]);

  // Toast dispatchers
  const showToast = (title: string, message?: string, type: ToastItem['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logAuditEvent = (module: AuditEvent['module'], action: string, details: string) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].slice(0, 5)}`;
    const newEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp,
      module,
      action,
      actor: 'Innovation Strategy Lead',
      details,
    };
    setAuditEvents(prev => [newEvent, ...prev.slice(0, 49)]);
  };

  // Actions
  const updateClaimReview = (
    claimId: string, 
    reviewStatus: ClaimReviewStatus, 
    reviewerNotes?: string, 
    expectedPayableAmount?: number | null
  ) => {
    setClaims(prev => prev.map(c => {
      if (c.claimId === claimId) {
        const expAmount = expectedPayableAmount !== undefined ? expectedPayableAmount : c.expectedPayableAmount;
        let discrepancy = c.potentialDiscrepancy;
        if (expAmount !== null && expAmount !== undefined) {
          discrepancy = Math.max(0, c.amountPaid - expAmount);
        }

        return {
          ...c,
          reviewStatus,
          reviewerNotes: reviewerNotes !== undefined ? reviewerNotes : c.reviewerNotes,
          expectedPayableAmount: expAmount,
          potentialDiscrepancy: discrepancy,
          lastReviewedAt: new Date().toISOString().split('T')[0],
        };
      }
      return c;
    }));

    logAuditEvent('Claims', 'Claim Status Update', `Updated claim ${claimId} to status "${reviewStatus}".`);
    showToast('Claim Updated', `Claim ${claimId} saved with review status "${reviewStatus}".`, 'success');
  };

  const importClaims = (imported: Claim[]): { successCount: number; errors: string[] } => {
    const errors: string[] = [];
    const valid: Claim[] = [];

    imported.forEach((row, idx) => {
      if (!row.claimId || !row.providerName || !row.category) {
        errors.push(`Row ${idx + 1}: Missing required fields (Claim ID, Provider, or Category).`);
        return;
      }
      if (typeof row.amountBilled !== 'number' || isNaN(row.amountBilled)) {
        errors.push(`Row ${idx + 1} (${row.claimId}): Invalid billed amount.`);
        return;
      }
      valid.push(row);
    });

    if (valid.length > 0) {
      setClaims(prev => {
        // Merge or replace by claimId
        const existingIds = new Set(valid.map(v => v.claimId));
        const filtered = prev.filter(c => !existingIds.has(c.claimId));
        return [...valid, ...filtered];
      });
      logAuditEvent('Claims', 'Batch CSV Import', `Successfully ingested ${valid.length} claims into investigation workbench.`);
      showToast('Import Complete', `Successfully imported ${valid.length} claims.`, 'success');
    }

    return { successCount: valid.length, errors };
  };

  const createOpportunity = (oppData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'whyThisWhyNow'>): Opportunity => {
    const newId = `OPP-${100 + opportunities.length + 1}`;
    const now = new Date().toISOString().split('T')[0];
    
    // Build temp opp to compute whyThisWhyNow
    const tempOpp: Opportunity = {
      ...oppData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      whyThisWhyNow: {
        supportingFactors: ['Newly identified candidate problem.'],
        cautionFactors: ['Baseline verification required.'],
        summary: 'Initiative drafted for prioritization scoring.',
      },
    };

    setOpportunities(prev => [tempOpp, ...prev]);
    logAuditEvent('Opportunities', 'Opportunity Created', `Logged new opportunity ${newId}: "${oppData.title}".`);
    showToast('Opportunity Created', `${newId} added to the radar.`, 'success');
    return tempOpp;
  };

  const updateOpportunity = (opp: Opportunity) => {
    setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...opp, updatedAt: new Date().toISOString().split('T')[0] } : o));
    logAuditEvent('Opportunities', 'Opportunity Updated', `Updated details for ${opp.id}.`);
    showToast('Opportunity Saved', `Changes to ${opp.id} have been saved.`, 'success');
  };

  const deleteOpportunity = (id: string) => {
    setOpportunities(prev => prev.filter(o => o.id !== id));
    logAuditEvent('Opportunities', 'Opportunity Deleted', `Removed opportunity ${id} from portfolio.`);
    showToast('Opportunity Deleted', `${id} has been removed.`, 'info');
  };

  const createPilot = (pilotData: Omit<Pilot, 'id'>): Pilot => {
    const newId = `PLT-${200 + pilots.length + 1}`;
    const newPilot: Pilot = {
      ...pilotData,
      id: newId,
    };
    setPilots(prev => [newPilot, ...prev]);
    logAuditEvent('Pilots', 'Pilot Commissioned', `Commissioned new pilot ${newId}: "${newPilot.title}".`);
    showToast('Pilot Created', `Commissioned pilot ${newId}.`, 'success');
    return newPilot;
  };

  const updatePilot = (pilot: Pilot) => {
    setPilots(prev => prev.map(p => p.id === pilot.id ? pilot : p));
    logAuditEvent('Pilots', 'Pilot Updated', `Updated pilot metrics and status for ${pilot.id}.`);
    showToast('Pilot Saved', `Pilot ${pilot.id} updated successfully.`, 'success');
  };

  const updateScaleReadiness = (pilotId: string, checklist: Partial<ScaleReadinessChecklist>) => {
    setPilots(prev => prev.map(p => {
      if (p.id === pilotId) {
        return {
          ...p,
          scaleReadiness: {
            ...p.scaleReadiness,
            ...checklist,
          },
        };
      }
      return p;
    }));
    logAuditEvent('Pilots', 'Scale Readiness Updated', `Updated scale readiness checklist for pilot ${pilotId}.`);
    showToast('Readiness Updated', 'Scale-readiness checklist items saved.', 'info');
  };

  const updateGovernanceRecord = (record: GovernanceRecord) => {
    setGovernanceRecords(prev => prev.map(g => g.id === record.id ? { ...record, updatedAt: new Date().toISOString().split('T')[0] } : g));
    logAuditEvent('Governance', 'Governance Record Updated', `Updated governance review status to "${record.status}" for ${record.id}.`);
    showToast('Governance Record Saved', `Record ${record.id} updated.`, 'success');
  };

  const resolveGovernanceIssue = (recordId: string, issueId: string) => {
    setGovernanceRecords(prev => prev.map(g => {
      if (g.id === recordId) {
        return {
          ...g,
          issues: g.issues.map(iss => iss.id === issueId ? { ...iss, status: 'Resolved' } : iss),
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return g;
    }));
    logAuditEvent('Governance', 'Governance Issue Resolved', `Resolved issue ${issueId} on record ${recordId}.`);
    showToast('Issue Resolved', `Issue ${issueId} marked as resolved.`, 'success');
  };

  const addGovernanceIssue = (recordId: string, issue: Omit<GovernanceIssue, 'id' | 'governanceRecordId' | 'daysOpen'>) => {
    const newIssueId = `ISS-${400 + Math.floor(Math.random() * 500)}`;
    setGovernanceRecords(prev => prev.map(g => {
      if (g.id === recordId) {
        const created: GovernanceIssue = {
          ...issue,
          id: newIssueId,
          governanceRecordId: recordId,
          daysOpen: 1,
        };
        return {
          ...g,
          issues: [created, ...g.issues],
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return g;
    }));
    logAuditEvent('Governance', 'Governance Issue Created', `Logged ${issue.severity} severity governance issue: "${issue.title}".`);
    showToast('Governance Issue Logged', `Logged issue ${newIssueId}.`, 'warning');
  };

  const updateValueAssumptions = (assumptions: ValueAssumptions) => {
    setValueAssumptions(assumptions);
    logAuditEvent('Value', 'Value Assumptions Calibrated', `Updated financial model assumptions (Claim Vol: ${assumptions.monthlyClaimVolume}/mo, Detection Lift: ${assumptions.expectedDetectionImprovement}%).`);
    showToast('Assumptions Saved', 'Financial assumptions model updated.', 'success');
  };

  const updatePrioritizationWeights = (weights: PrioritizationWeights) => {
    setPrioritizationWeights(weights);
    logAuditEvent('Settings', 'Prioritization Weights Adjusted', `Re-weighted scoring engine (Impact: ${weights.businessImpact}%, Feasibility: ${weights.feasibility}%).`);
    showToast('Weights Updated', 'Radar prioritization formula updated.', 'info');
  };

  const resetDemoData = () => {
    setOpportunities(SEED_OPPORTUNITIES);
    setClaims(SEED_CLAIMS);
    setSolutions(SEED_SOLUTIONS);
    setPilots(SEED_PILOTS);
    setGovernanceRecords(SEED_GOVERNANCE);
    setValueAssumptions(SEED_VALUE_ASSUMPTIONS);
    setPrioritizationWeights(DEFAULT_WEIGHTS);
    setAuditEvents(SEED_AUDIT_EVENTS);
    setSelectedOpportunityId(SEED_OPPORTUNITIES[0].id);

    try {
      localStorage.removeItem(`${STORAGE_KEY}_opps`);
      localStorage.removeItem(`${STORAGE_KEY}_claims`);
      localStorage.removeItem(`${STORAGE_KEY}_solutions`);
      localStorage.removeItem(`${STORAGE_KEY}_pilots`);
      localStorage.removeItem(`${STORAGE_KEY}_gov`);
      localStorage.removeItem(`${STORAGE_KEY}_assumptions`);
      localStorage.removeItem(`${STORAGE_KEY}_weights`);
      localStorage.removeItem(`${STORAGE_KEY}_audit`);
    } catch {
      // Ignore
    }

    showToast('Data Reset', 'Demo environment restored to baseline synthetic dataset.', 'info');
  };

  // Dynamic calculations
  const kpis = useMemo(() => {
    const totalOpportunities = opportunities.length;
    const opportunitiesUnderEvaluation = opportunities.filter(o => 
      ['Identified', 'Under analysis', 'Proposed', 'In testing'].includes(o.stage)
    ).length;

    const activePilots = pilots.filter(p => p.status === 'On Track' || p.status === 'At Risk' || p.stage === 'Active Review' || p.stage === 'Shadow Mode').length;
    
    // Pilots ready for a decision: either observed metrics logged or ready for scale
    const pilotsReadyForDecision = pilots.filter(p => p.observedMetrics.detectionRate !== null).length;

    // Financial aggregation from value model
    const totalEstimatedGrossBenefit = opportunities.reduce((acc, o) => acc + o.estimatedFinancialOpportunity, 0);

    // Net benefit derived from the modeled initiative
    const modeled = calculateValueModel(valueAssumptions);
    const totalEstimatedNetBenefit = modeled.annualNetBenefit * Math.max(1, pilots.length * 0.8);

    const initiativesAwaitingGovernance = governanceRecords.filter(g => 
      g.status === 'Under review' || g.status === 'Draft' || g.issues.some(i => i.severity === 'Critical' && i.status === 'Open')
    ).length;

    return {
      totalOpportunities,
      opportunitiesUnderEvaluation,
      activePilots,
      pilotsReadyForDecision,
      totalEstimatedGrossBenefit,
      totalEstimatedNetBenefit,
      initiativesAwaitingGovernance,
    };
  }, [opportunities, pilots, valueAssumptions, governanceRecords]);

  const governanceDebt = useMemo(() => {
    return calculateGovernanceDebt(governanceRecords);
  }, [governanceRecords]);

  // Executive Insights: Deterministic rules checking actual demo data
  const executiveInsights = useMemo(() => {
    const insights: ExecutiveInsight[] = [];

    // Rule 1: High estimated value but unvalidated evidence
    opportunities.forEach(opp => {
      if (opp.estimatedFinancialOpportunity > 50000000 && !opp.evidenceValidated) {
        insights.push({
          id: `ins-val-${opp.id}`,
          type: 'warning',
          title: `High-Exposure Initiative Lacks Validated Baseline: ${opp.id}`,
          observation: `${opp.title} represents ₹${(opp.estimatedFinancialOpportunity / 10000000).toFixed(1)} Cr in estimated annual exposure, but baseline evidence is marked as preliminary.`,
          whyItMatters: 'Committing pilot capital without verified audit error rates creates risk of misallocated engineering effort.',
          evidence: `Current error rate is an estimate; historical audit sampling is still pending validation.`,
          suggestedAction: 'Execute a 100-chart retrospective audit sampling before approving full production budget.',
          targetRoute: `/opportunities?id=${opp.id}`,
          relatedRecordId: opp.id,
        });
      }
    });

    // Rule 2: Pilot overdue or at risk
    pilots.forEach(p => {
      if (p.status === 'At Risk' || p.status === 'Overdue') {
        insights.push({
          id: `ins-plt-${p.id}`,
          type: 'critical',
          title: `Pilot Execution Blocked or At Risk: ${p.title}`,
          observation: `Pilot ${p.id} in ${p.stage} stage is flagged as "${p.status}". Actual spend has reached ₹${(p.actualSpend / 100000).toFixed(1)} L of ₹${(p.budget / 100000).toFixed(1)} L budget.`,
          whyItMatters: 'Pilot delay postpones projected annual recoveries and ties up specialized clinical validation resources.',
          evidence: p.risks[0] || 'Milestones have extended beyond initial schedule.',
          suggestedAction: 'Convene operational review with business sponsor to remove technical roadblocks.',
          targetRoute: `/pilots?id=${p.id}`,
          relatedRecordId: p.id,
        });
      }
    });

    // Rule 3: Favorable pilot performance but unfulfilled governance gates
    pilots.forEach(p => {
      const gov = governanceRecords.find(g => g.opportunityId === p.opportunityId);
      const readiness = evaluateScaleReadiness(p, gov);
      if (p.observedMetrics.detectionRate && p.observedMetrics.detectionRate >= p.targetMetrics.detectionRate && !readiness.isScaleReady) {
        insights.push({
          id: `ins-gate-${p.id}`,
          type: 'warning',
          title: `Favorable Model Precision Blocked by Scale Gate: ${p.id}`,
          observation: `Pilot ${p.id} exceeded target detection (${p.observedMetrics.detectionRate}% vs ${p.targetMetrics.detectionRate}%), but remains blocked from enterprise rollout.`,
          whyItMatters: 'Technical accuracy alone is insufficient for enterprise healthcare adoption; outstanding governance or operational criteria must be satisfied.',
          evidence: `Missing ${readiness.missingRequirements.length} prerequisite(s): ${readiness.missingRequirements.slice(0, 2).join('; ')}.`,
          suggestedAction: 'Complete outstanding clinical oversight checklist to unlock production scale authorization.',
          targetRoute: `/pilots?id=${p.id}`,
          relatedRecordId: p.id,
        });
      }
    });

    // Rule 4: Critical open governance debt
    governanceRecords.forEach(g => {
      const crit = g.issues.filter(i => i.severity === 'Critical' && i.status === 'Open');
      if (crit.length > 0) {
        insights.push({
          id: `ins-gov-${g.id}`,
          type: 'critical',
          title: `Critical AI Governance Issue Unresolved: ${g.id}`,
          observation: `Governance docket "${g.title}" has ${crit.length} open Critical issue(s) open for ${crit[0].daysOpen} days.`,
          whyItMatters: 'Critical items (such as optical hallucination on low-resolution scans) represent serious clinical or regulatory compliance vulnerabilities.',
          evidence: crit[0].description,
          suggestedAction: `Assign technical remediation to ${crit[0].owner}: ${crit[0].actionRequired}`,
          targetRoute: `/governance?id=${g.id}`,
          relatedRecordId: g.id,
        });
      }
    });

    // Rule 5: Candidate with high score ready for transition
    opportunities.forEach(opp => {
      const score = calculatePriorityScore(opp, prioritizationWeights).totalScore;
      if (score >= 82 && opp.stage === 'Ready for scale') {
        insights.push({
          id: `ins-ready-${opp.id}`,
          type: 'info',
          title: `Opportunity Cleared for Production Deployment: ${opp.id}`,
          observation: `${opp.title} achieved top priority score (${score.toFixed(1)}/100) and verified all pilot milestones.`,
          whyItMatters: 'Deploying this rules/analytics intervention to regional clearinghouses unlocks an estimated ₹${(opp.estimatedFinancialOpportunity / 10000000).toFixed(1)} Cr in annual recovery.',
          evidence: 'Historical pilot confirmed 88.5% detection accuracy with only 6.8% dispute overturn rate.',
          suggestedAction: 'Execute executive sign-off in Executive Briefing and transition to production monitoring.',
          targetRoute: `/briefing?opportunityId=${opp.id}`,
          relatedRecordId: opp.id,
        });
      }
    });

    return insights;
  }, [opportunities, pilots, governanceRecords, prioritizationWeights]);

  return (
    <AppContext.Provider
      value={{
        opportunities,
        claims,
        solutions,
        pilots,
        governanceRecords,
        valueAssumptions,
        prioritizationWeights,
        auditEvents,
        toasts,
        currencyMode,
        selectedOpportunityId,
        isSearchOpen,
        isNotificationsOpen,
        setSelectedOpportunityId,
        setCurrencyMode,
        setSearchOpen,
        setNotificationsOpen,
        showToast,
        dismissToast,
        updateClaimReview,
        importClaims,
        createOpportunity,
        updateOpportunity,
        deleteOpportunity,
        createPilot,
        updatePilot,
        updateScaleReadiness,
        updateGovernanceRecord,
        resolveGovernanceIssue,
        addGovernanceIssue,
        updateValueAssumptions,
        updatePrioritizationWeights,
        resetDemoData,
        kpis,
        governanceDebt,
        executiveInsights,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
