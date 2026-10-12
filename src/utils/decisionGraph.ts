import { 
  Opportunity, 
  SolutionOption, 
  Pilot, 
  GovernanceRecord, 
  ValueResult 
} from '../types';
import { formatINR, formatPercent } from './formatting';
import { evaluateScaleReadiness } from './calculations';

export interface GraphNode {
  id: string;
  stageName: 'Business Problem' | 'Evidence' | 'Use Case' | 'Solution' | 'Pilot' | 'Value' | 'Scale Decision';
  title: string;
  subtitle: string;
  status: 'Complete' | 'In Progress' | 'Warning' | 'Blocked' | 'Pending';
  statusLabel: string;
  metrics: { label: string; value: string }[];
  details: string;
  missingPrerequisites?: string[];
  route: string;
  recordId?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  status: 'active' | 'warning' | 'pending';
}

export function buildDecisionGraph(
  opportunity: Opportunity,
  solution: SolutionOption | undefined,
  pilot: Pilot | undefined,
  governance: GovernanceRecord | undefined,
  valueResult: ValueResult
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const readiness = pilot ? evaluateScaleReadiness(pilot, governance) : undefined;
  
  // 1. Business Problem
  const problemNode: GraphNode = {
    id: 'problem',
    stageName: 'Business Problem',
    title: opportunity.title,
    subtitle: opportunity.payerContext,
    status: 'Complete',
    statusLabel: 'Identified',
    metrics: [
      { label: 'Impact', value: opportunity.operationalImpact },
      { label: 'Strategic Fit', value: `${opportunity.strategicAlignment}%` },
    ],
    details: opportunity.businessProblem,
    route: `/opportunities?id=${opportunity.id}`,
    recordId: opportunity.id,
  };

  // 2. Evidence
  const evidenceStatus = opportunity.evidenceValidated ? 'Complete' : 'Warning';
  const evidenceNode: GraphNode = {
    id: 'evidence',
    stageName: 'Evidence',
    title: opportunity.evidenceValidated ? 'Validated Baseline' : 'Preliminary Estimates',
    subtitle: `${formatPercent(opportunity.baselineMetrics.baselineErrorRate)} baseline error rate`,
    status: evidenceStatus,
    statusLabel: opportunity.evidenceValidated ? 'Validated' : 'Sampling Pending',
    metrics: [
      { label: 'Avg Discrepancy', value: formatINR(opportunity.baselineMetrics.avgDiscrepancy) },
      { label: 'Annual Volume', value: opportunity.baselineMetrics.annualClaimVolume.toLocaleString() },
    ],
    details: opportunity.supportingEvidence,
    missingPrerequisites: opportunity.evidenceValidated ? [] : ['Empirical audit sampling not yet signed off'],
    route: `/claims?opportunityId=${opportunity.id}`,
    recordId: opportunity.id,
  };

  // 3. Use Case
  const useCaseStatus = opportunity.stage === 'Paused' || opportunity.stage === 'Rejected' 
    ? 'Blocked' 
    : opportunity.stage === 'Identified' 
    ? 'In Progress' 
    : 'Complete';
  const useCaseNode: GraphNode = {
    id: 'use-case',
    stageName: 'Use Case',
    title: `${opportunity.id}: ${opportunity.title.slice(0, 28)}...`,
    subtitle: `Stage: ${opportunity.stage}`,
    status: useCaseStatus,
    statusLabel: opportunity.stage,
    metrics: [
      { label: 'Data Readiness', value: `${opportunity.dataReadiness}%` },
      { label: 'Feasibility', value: `${opportunity.technicalFeasibility}%` },
    ],
    details: `Owner: ${opportunity.owner}. Suggested architectures: ${opportunity.suggestedSolutions.join(', ')}.`,
    route: `/opportunities?id=${opportunity.id}`,
    recordId: opportunity.id,
  };

  // 4. Solution
  const solutionStatus = solution 
    ? (solution.isRecommended ? 'Complete' : 'In Progress') 
    : 'Pending';
  const solutionNode: GraphNode = {
    id: 'solution',
    stageName: 'Solution',
    title: solution ? solution.name : 'No Solution Selected',
    subtitle: solution ? `${solution.type} · ${solution.timeToValueWeeks} wks to value` : 'Select in Solution Lab',
    status: solutionStatus,
    statusLabel: solution ? (solution.isRecommended ? 'Recommended' : 'Candidate') : 'Unassigned',
    metrics: solution ? [
      { label: 'CapEx', value: formatINR(solution.estimatedImplementationCost, true) },
      { label: 'OpEx/Yr', value: formatINR(solution.estimatedAnnualOperatingCost, true) },
    ] : [],
    details: solution ? solution.businessObjective : 'Compare competing options in Solution Lab.',
    route: `/solutions?opportunityId=${opportunity.id}`,
    recordId: solution?.id,
  };

  // 5. Pilot
  let pilotStatus: GraphNode['status'] = 'Pending';
  let pilotStatusLabel = 'Not Commissioned';
  if (pilot) {
    if (pilot.status === 'Completed' || pilot.observedMetrics.detectionRate !== null) {
      pilotStatus = 'Complete';
      pilotStatusLabel = `${pilot.stage} (${pilot.status})`;
    } else if (pilot.status === 'Overdue' || pilot.status === 'At Risk') {
      pilotStatus = 'Warning';
      pilotStatusLabel = pilot.status;
    } else {
      pilotStatus = 'In Progress';
      pilotStatusLabel = pilot.stage;
    }
  }
  const pilotNode: GraphNode = {
    id: 'pilot',
    stageName: 'Pilot',
    title: pilot ? pilot.title : 'Pending Pilot Setup',
    subtitle: pilot ? `Spend: ${formatINR(pilot.actualSpend, true)} of ${formatINR(pilot.budget, true)}` : 'Requires approved solution',
    status: pilotStatus,
    statusLabel: pilotStatusLabel,
    metrics: pilot ? [
      { label: 'Detection Rate', value: pilot.observedMetrics.detectionRate !== null ? `${pilot.observedMetrics.detectionRate}%` : 'TBD' },
      { label: 'Review Time', value: pilot.observedMetrics.reviewTimeMinutes !== null ? `${pilot.observedMetrics.reviewTimeMinutes}m` : 'TBD' },
    ] : [],
    details: pilot ? pilot.hypothesis : 'Commission a proof-of-concept in Pilot Portfolio.',
    missingPrerequisites: pilot ? (readiness?.missingRequirements.slice(0, 3) || []) : ['Commission pilot to track empirical performance'],
    route: pilot ? `/pilots?id=${pilot.id}` : '/pilots',
    recordId: pilot?.id,
  };

  // 6. Value
  const valueStatus = valueResult.annualNetBenefit > 0 ? 'Complete' : 'Warning';
  const valueNode: GraphNode = {
    id: 'value',
    stageName: 'Value',
    title: `${formatINR(valueResult.annualNetBenefit, true)} Net Benefit/Yr`,
    subtitle: `ROI: ${formatPercent(valueResult.roiPercent, 0)} · Payback: ${valueResult.paybackPeriodMonths ? `${valueResult.paybackPeriodMonths}m` : 'N/A'}`,
    status: valueStatus,
    statusLabel: valueResult.annualNetBenefit > 0 ? 'Positive Case' : 'Negative Net',
    metrics: [
      { label: 'Gross / Yr', value: formatINR(valueResult.totalAnnualGrossBenefit, true) },
      { label: '5-Yr NPV', value: formatINR(valueResult.npv, true) },
    ],
    details: `Modeled at ${opportunity.baselineMetrics.annualClaimVolume.toLocaleString()} annual claims with ${valueResult.annualHoursSaved.toLocaleString()} hours of capacity redeployment.`,
    route: `/value?opportunityId=${opportunity.id}`,
    recordId: opportunity.id,
  };

  // 7. Scale Decision
  let scaleStatus: GraphNode['status'] = 'Pending';
  let scaleStatusLabel = 'Decision Pending';
  let missingScalePrereqs: string[] = [];

  if (!pilot) {
    scaleStatus = 'Blocked';
    scaleStatusLabel = 'No Pilot Evidence';
    missingScalePrereqs = ['Pilot must be created and observed before scale consideration'];
  } else if (!readiness?.isScaleReady) {
    scaleStatus = 'Blocked';
    scaleStatusLabel = 'Gated: Blocked';
    missingScalePrereqs = readiness?.missingRequirements || [];
  } else {
    scaleStatus = 'Complete';
    scaleStatusLabel = 'Approved for Scale';
  }

  const scaleNode: GraphNode = {
    id: 'scale',
    stageName: 'Scale Decision',
    title: scaleStatus === 'Complete' ? 'Authorized for Scale' : 'Scale Gate Enforced',
    subtitle: scaleStatus === 'Complete' ? 'All 7 criteria verified' : `${missingScalePrereqs.length} prerequisite(s) open`,
    status: scaleStatus,
    statusLabel: scaleStatusLabel,
    metrics: [
      { label: 'Readiness', value: `${readiness?.completedCount || 0}/${readiness?.totalRequirements || 7}` },
      { label: 'Governance', value: governance ? governance.status : 'None' },
    ],
    details: scaleStatus === 'Complete'
      ? 'Fully validated: Business case, model precision, clinical oversight, and governance cleared.'
      : 'Gate policy strictly blocks enterprise production rollout until all conditions pass.',
    missingPrerequisites: missingScalePrereqs,
    route: pilot ? `/pilots?id=${pilot.id}` : '/pilots',
    recordId: pilot?.id,
  };

  const nodes = [problemNode, evidenceNode, useCaseNode, solutionNode, pilotNode, valueNode, scaleNode];

  const edges: GraphEdge[] = [
    { from: 'problem', to: 'evidence', status: evidenceStatus === 'Warning' ? 'warning' : 'active' },
    { from: 'evidence', to: 'use-case', status: 'active' },
    { from: 'use-case', to: 'solution', status: solution ? 'active' : 'pending' },
    { from: 'solution', to: 'pilot', status: pilot ? 'active' : 'pending' },
    { from: 'pilot', to: 'value', status: 'active' },
    { from: 'value', to: 'scale', status: scaleStatus === 'Complete' ? 'active' : scaleStatus === 'Blocked' ? 'warning' : 'pending' },
  ];

  return { nodes, edges };
}
