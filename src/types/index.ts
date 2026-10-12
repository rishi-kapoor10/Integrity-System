export type RiskBand = 'High' | 'Medium' | 'Low';

export type ClaimCategory = 
  | 'Inpatient DRG'
  | 'Outpatient Surgery'
  | 'Professional E&M'
  | 'Durable Medical Equipment'
  | 'Pharmacy Injectable'
  | 'Radiology & Lab';

export type ClaimReviewStatus = 
  | 'Flagged'
  | 'Under review'
  | 'Confirmed error'
  | 'Cleared'
  | 'Insufficient evidence';

export interface Claim {
  claimId: string;
  providerId: string;
  providerName: string;
  category: ClaimCategory;
  serviceDate: string;
  amountBilled: number;
  amountPaid: number;
  expectedPayableAmount: number | null; // null if unknown
  potentialDiscrepancy: number | null; // Amount Paid - Expected Payable Amount (>=0)
  simulatedRiskScore: number; // 0 - 100
  riskBand: RiskBand;
  detectionReason: string;
  riskFeatureTriggers: string[];
  reviewStatus: ClaimReviewStatus;
  reviewerNotes?: string;
  lastReviewedAt?: string;
  opportunityId?: string; // linked opportunity if any
}

export type OpportunityStage = 
  | 'Identified'
  | 'Under analysis'
  | 'Proposed'
  | 'In testing'
  | 'Governance review'
  | 'Approved for pilot'
  | 'Pilot in progress'
  | 'Validated'
  | 'Ready for scale'
  | 'Paused'
  | 'Rejected';

export type SolutionType = 
  | 'Rules & Edits'
  | 'Workflow Automation'
  | 'SQL Analytics'
  | 'ML Risk Scoring'
  | 'Document AI'
  | 'Generative AI'
  | 'Hybrid';

export interface Opportunity {
  id: string;
  title: string;
  businessProblem: string;
  payerContext: string;
  supportingEvidence: string;
  baselineMetrics: {
    annualClaimVolume: number;
    baselineErrorRate: number; // percentage, e.g., 3.2%
    avgDiscrepancy: number; // in INR
    currentManualAuditHours: number; // annual
  };
  estimatedFinancialOpportunity: number; // gross INR annual
  operationalImpact: 'High' | 'Medium' | 'Low';
  dataReadiness: number; // 0 - 100
  technicalFeasibility: number; // 0 - 100
  implementationEffort: 'Low' | 'Medium' | 'High'; // Maps to 80, 50, 20
  riskRating: 'Low' | 'Medium' | 'High';
  strategicAlignment: number; // 0 - 100
  businessImpact: number; // 0 - 100
  timeToValue: number; // 0 - 100 (100 = fastest)
  suggestedSolutions: SolutionType[];
  owner: string;
  stage: OpportunityStage;
  nextAction: string;
  whyThisWhyNow: {
    supportingFactors: string[];
    cautionFactors: string[];
    summary: string;
  };
  evidenceValidated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrioritizationWeights {
  businessImpact: number; // default 30
  feasibility: number;    // default 20
  dataReadiness: number;  // default 20
  strategicAlignment: number; // default 15
  timeToValue: number;    // default 15
}

export interface SolutionOption {
  id: string;
  opportunityId: string;
  name: string;
  type: SolutionType;
  businessObjective: string;
  technicalFeasibility: number; // 0 - 100
  dataPrerequisites: string[];
  implementationEffort: 'Low' | 'Medium' | 'High';
  estimatedImplementationCost: number; // INR
  estimatedAnnualOperatingCost: number; // INR
  timeToValueWeeks: number;
  expectedBenefits: string[];
  risksAndLimitations: string[];
  humanOversightLevel: 'Minimal' | 'Sample-based' | 'Human-in-the-loop (100% review)' | 'Exception-only';
  successMetrics: string[];
  isRecommended: boolean;
  recommendationRationale: string;
}

export type PilotStage = 
  | 'Design'
  | 'Data Ingestion'
  | 'Shadow Mode'
  | 'Active Review'
  | 'Evaluation'
  | 'Completed';

export type PilotStatus = 'On Track' | 'At Risk' | 'Overdue' | 'Completed' | 'Paused';

export interface PilotMilestone {
  id: string;
  title: string;
  targetDate: string;
  completedDate?: string;
  status: 'Pending' | 'Completed' | 'Delayed';
}

export interface ScaleReadinessChecklist {
  measurableHypothesisExists: boolean;
  baselineDataAvailable: boolean;
  pilotResultsRecorded: boolean;
  financialAssumptionsReviewed: boolean;
  relevantRisksDocumented: boolean;
  governanceApprovalRecorded: boolean;
  businessOwnerAccepted: boolean;
}

export interface Pilot {
  id: string;
  opportunityId: string;
  solutionId: string;
  solutionType: SolutionType;
  title: string;
  businessOwner: string;
  technicalOwner: string;
  startDate: string;
  targetCompletionDate: string;
  stage: PilotStage;
  status: PilotStatus;
  budget: number; // INR
  actualSpend: number; // INR
  hypothesis: string;
  baselineMetrics: {
    detectionRate: number; // %
    falsePositiveRate: number; // %
    reviewTimeMinutes: number; // mins per claim
    monthlyIdentifiedDiscrepancy: number; // INR
  };
  targetMetrics: {
    detectionRate: number; // %
    falsePositiveRate: number; // %
    reviewTimeMinutes: number; // mins per claim
    monthlyIdentifiedDiscrepancy: number; // INR
  };
  observedMetrics: {
    detectionRate: number | null; // %
    falsePositiveRate: number | null; // %
    reviewTimeMinutes: number | null; // mins per claim
    monthlyIdentifiedDiscrepancy: number | null; // INR
    claimsProcessed: number;
  };
  keyFindings: string[];
  risks: string[];
  dependencies: string[];
  milestones: PilotMilestone[];
  recommendedDecision: 'Scale' | 'Optimize & Iterate' | 'Pause' | 'Terminate';
  decisionRationale: string;
  scaleReadiness: ScaleReadinessChecklist;
}

export type GovernanceStatus = 
  | 'Not started'
  | 'Draft'
  | 'Under review'
  | 'Approved with conditions'
  | 'Approved'
  | 'Rejected'
  | 'Reassessment required';

export interface GovernanceIssue {
  id: string;
  governanceRecordId: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  daysOpen: number;
  status: 'Open' | 'Mitigated' | 'Resolved';
  actionRequired: string;
  owner: string;
}

export interface GovernanceRecord {
  id: string;
  opportunityId: string;
  pilotId?: string;
  title: string;
  intendedBusinessUse: string;
  dataCategories: string[];
  dataSourceAndPermissions: string;
  privacyConsiderations: string;
  securityConsiderations: string;
  modelLimitations: string[];
  performanceEvaluationApproach: string;
  falsePositiveRisk: string;
  falseNegativeRisk: string;
  humanOversightLevel?: string;
  humanOversightRequirements: string;
  explainabilityAndTraceability: string;
  biasAndFairness: string;
  operationalDependencies: string[];
  failureAndFallbackProcedures: string;
  monitoringPlan: string;
  accountableBusinessOwner: string;
  status: GovernanceStatus;
  reviewDecisionDate?: string;
  conditionsForApproval: string[];
  issues: GovernanceIssue[];
  updatedAt: string;
}

export interface ValueAssumptions {
  monthlyClaimVolume: number;
  baselineErrorRate: number; // % e.g. 3.5
  avgDiscrepancyINR: number; // INR e.g. 18500
  expectedDetectionImprovement: number; // % e.g. 45
  realizationRate: number; // % e.g. 70
  adoptionRate: number; // % e.g. 85
  confidenceLevel: number; // % e.g. 80
  currentReviewTimeMinutes: number; // mins e.g. 35
  expectedReviewTimeMinutes: number; // mins e.g. 12
  reviewerHourlyCostINR: number; // INR e.g. 750
  implementationCostINR: number; // INR e.g. 2500000
  annualOperatingCostINR: number; // INR e.g. 600000
  timeHorizonYears: number; // 1 to 5
  discountRate: number; // % e.g. 10
}

export interface ValueResult {
  annualClaimVolume: number;
  potentialAnnualExposure: number; // Annual Vol * Baseline Error * Avg Discrepancy
  estimatedIncrementalBenefit: number; // Exposure * Improvement * Realization * Adoption
  annualClaimsReviewed: number;
  annualHoursSaved: number;
  operationalCapacityValue: number; // Hours Saved * Hourly Rate
  totalAnnualGrossBenefit: number; // Financial Benefit + Operational Capacity
  annualNetBenefit: number; // Gross - Operating Cost
  firstYearNetBenefit: number; // Year 1 Gross - Implementation - Operating Cost
  roiPercent: number; // (Annual Net / (Implementation + Operating)) * 100
  paybackPeriodMonths: number | null; // Implementation / Monthly net cash
  multiYearCashFlows: {
    year: number;
    grossBenefit: number;
    costs: number;
    netBenefit: number;
    cumulativeNet: number;
    discountedCashFlow: number;
  }[];
  npv: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  module: 'Opportunities' | 'Claims' | 'Solutions' | 'Pilots' | 'Governance' | 'Value' | 'Settings';
  action: string;
  actor: string;
  details: string;
}

export interface ExecutiveInsight {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  observation: string;
  whyItMatters: string;
  evidence: string;
  suggestedAction: string;
  targetRoute: string;
  relatedRecordId?: string;
}
