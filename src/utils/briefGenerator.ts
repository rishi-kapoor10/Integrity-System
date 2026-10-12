import { 
  Opportunity, 
  SolutionOption, 
  Pilot, 
  GovernanceRecord,
  ValueResult 
} from '../types';
import { formatINR, formatPercent, formatDate } from './formatting';
import { evaluateScaleReadiness } from './calculations';

export type BriefAudience = 
  | 'Executive Leadership / Investment Committee'
  | 'Chief Financial Officer & Actuarial'
  | 'Chief Medical Officer & Clinical Policy'
  | 'VP Payment Integrity Operations';

export type BriefDetailLevel = 'Executive Summary' | 'Full Strategy Brief';

export interface BriefContent {
  title: string;
  generatedDate: string;
  audience: BriefAudience;
  detailLevel: BriefDetailLevel;
  initiativeId: string;
  sections: {
    number: string;
    title: string;
    content: string;
    bullets?: string[];
  }[];
  verdict: 'Recommend Scale' | 'Recommend Optimization' | 'Recommend Pause / Terminate' | 'Requires Further Evidence';
  verdictRationale: string;
  unknowns: string[];
}

export function generateExecutiveBrief(
  opportunity: Opportunity,
  solutions: SolutionOption[],
  selectedSolution: SolutionOption | undefined,
  pilot: Pilot | undefined,
  governance: GovernanceRecord | undefined,
  valueResult: ValueResult,
  audience: BriefAudience = 'Executive Leadership / Investment Committee',
  detailLevel: BriefDetailLevel = 'Full Strategy Brief'
): BriefContent {
  const primarySol = selectedSolution || solutions.find(s => s.isRecommended) || solutions[0];
  const readiness = pilot ? evaluateScaleReadiness(pilot, governance) : undefined;
  const unknowns: string[] = [];

  if (!opportunity.evidenceValidated) {
    unknowns.push('Baseline error distribution requires formal audit re-sampling.');
  }
  if (!pilot || pilot.observedMetrics.detectionRate === null) {
    unknowns.push('Pilot observed detection rate is not yet statistically validated.');
  }
  if (governance && governance.status !== 'Approved') {
    unknowns.push(`AI Governance review is currently "${governance.status}".`);
  }

  // Verdict logic
  let verdict: BriefContent['verdict'] = 'Requires Further Evidence';
  let verdictRationale = '';

  if (pilot) {
    if (readiness?.isScaleReady) {
      verdict = 'Recommend Scale';
      verdictRationale = `Initiative has met all 7 readiness criteria, demonstrates net positive annual benefit of ${formatINR(valueResult.annualNetBenefit, true)}, and holds governance clearance.`;
    } else if (pilot.observedMetrics.detectionRate !== null && pilot.observedMetrics.detectionRate < pilot.targetMetrics.detectionRate) {
      verdict = 'Recommend Optimization';
      verdictRationale = `Observed detection (${formatPercent(pilot.observedMetrics.detectionRate)}) trails target (${formatPercent(pilot.targetMetrics.detectionRate)}); calibrate feature weights before scaling.`;
    } else if (pilot.status === 'Overdue' || (readiness && readiness.missingRequirements.length > 2)) {
      verdict = 'Recommend Optimization';
      verdictRationale = `Key prerequisites remain unfulfilled (${readiness?.missingRequirements.length || 0} open requirements). Maintain controlled pilot status.`;
    } else {
      verdict = 'Requires Further Evidence';
      verdictRationale = 'Pilot execution is ongoing; final observed detection and dispute rates must be cataloged.';
    }
  } else {
    verdict = 'Requires Further Evidence';
    verdictRationale = 'Pilot has not concluded. Transition from opportunity evaluation to controlled shadow pilot is recommended.';
  }

  const sections: BriefContent['sections'] = [
    {
      number: '01',
      title: 'Executive Summary',
      content: `${opportunity.title} addresses critical payment leakage within the ${opportunity.payerContext}. Baseline operations indicate an annual financial exposure of ${formatINR(opportunity.estimatedFinancialOpportunity, true)}. Deploying a ${primarySol?.type || 'targeted'} solution is projected to deliver an estimated annual net benefit of ${formatINR(valueResult.annualNetBenefit, true)} with an estimated ROI of ${formatPercent(valueResult.roiPercent, 0)} and a payback period of ${valueResult.paybackPeriodMonths ? `${valueResult.paybackPeriodMonths} months` : 'N/A'}.`,
    },
    {
      number: '02',
      title: 'Business Problem',
      content: opportunity.businessProblem,
      bullets: [
        `Payer context: ${opportunity.payerContext}`,
        `Current manual operational impact: ${opportunity.operationalImpact} burden on clinical audit staff`,
        `Baseline error exposure: ~${opportunity.baselineMetrics.baselineErrorRate}% across ${opportunity.baselineMetrics.annualClaimVolume.toLocaleString()} annual claims`,
      ],
    },
    {
      number: '03',
      title: 'Evidence and Baseline Metrics',
      content: opportunity.supportingEvidence,
      bullets: [
        `Historical sample baseline error rate: ${formatPercent(opportunity.baselineMetrics.baselineErrorRate)}`,
        `Average discrepancy per identified claim: ${formatINR(opportunity.baselineMetrics.avgDiscrepancy)}`,
        `Current manual audit hours dedicated annually: ${opportunity.baselineMetrics.currentManualAuditHours.toLocaleString()} hours`,
        `Evidence validation state: ${opportunity.evidenceValidated ? 'Verified against audit records' : 'Preliminary estimate (Validation pending)'}`,
      ],
    },
    {
      number: '04',
      title: 'Proposed Solution Architecture',
      content: primarySol 
        ? `${primarySol.name} (${primarySol.type}): ${primarySol.businessObjective}. Human oversight level is calibrated to "${primarySol.humanOversightLevel}".`
        : 'Solution specification is currently being finalized in the Solution Lab.',
      bullets: primarySol?.expectedBenefits || ['Automated risk triage', 'Pre-payment interception'],
    },
    {
      number: '05',
      title: 'Alternatives Evaluated',
      content: `Evaluated ${solutions.length} alternative technical approaches spanning rules, analytics, and machine learning models:`,
      bullets: solutions.map(s => `${s.name} (${s.type}): ${s.isRecommended ? '[PREFERRED] ' : ''}Feasibility ${s.technicalFeasibility}%, Implementation Cost ${formatINR(s.estimatedImplementationCost, true)}, Time-to-value: ${s.timeToValueWeeks} wks`),
    },
    {
      number: '06',
      title: 'Expected Financial & Operational Benefits',
      content: `Modeled at an annual claim volume of ${valueResult.annualClaimVolume.toLocaleString()} claims, the initiative captures both direct claim recovery/prevention and operational staff capacity value:`,
      bullets: [
        `Potential Annual Overpayment Exposure: ${formatINR(valueResult.potentialAnnualExposure)}`,
        `Estimated Incremental Financial Recovery: ${formatINR(valueResult.estimatedIncrementalBenefit)}`,
        `Estimated Operational Capacity Value: ${formatINR(valueResult.operationalCapacityValue)} (${valueResult.annualHoursSaved.toLocaleString()} hours saved/year)`,
        `Total Annual Gross Benefit: ${formatINR(valueResult.totalAnnualGrossBenefit)}`,
        `Annual Operating & Maintenance Cost: ${formatINR(primarySol?.estimatedAnnualOperatingCost || 0)}`,
        `Annual Net Realized Benefit: ${formatINR(valueResult.annualNetBenefit)}`,
        `5-Year Modeled Net Present Value (NPV): ${formatINR(valueResult.npv)}`,
      ],
    },
    {
      number: '07',
      title: 'Implementation Investment & Timeline',
      content: `Total upfront capital expenditure is estimated at ${formatINR(primarySol?.estimatedImplementationCost || 0)}, requiring a delivery horizon of ${primarySol?.timeToValueWeeks || 12} weeks.`,
      bullets: [
        `Upfront engineering and integration cost: ${formatINR(primarySol?.estimatedImplementationCost || 0)}`,
        `Estimated payback period: ${valueResult.paybackPeriodMonths ? `${valueResult.paybackPeriodMonths} months post-go-live` : 'Not achieved in modeled year'}`,
        `First year net position: ${formatINR(valueResult.firstYearNetBenefit)}`,
      ],
    },
    {
      number: '08',
      title: 'Key Operational & Strategic Risks',
      content: `Risk rating is assessed as ${opportunity.riskRating}. Mitigation protocols are defined across clinical, provider relations, and data pipelines.`,
      bullets: primarySol?.risksAndLimitations || [
        'Provider friction if false-positive rate escalates',
        'Data schema drift requiring periodic recalibration',
        'Audit specialist change management and workflow adoption',
      ],
    },
    {
      number: '09',
      title: 'Pilot Findings & Observed Performance',
      content: pilot
        ? `Pilot "${pilot.title}" is currently in ${pilot.stage} stage (${pilot.status}). Budget utilization stands at ${formatPercent((pilot.actualSpend / pilot.budget) * 100, 0)} (${formatINR(pilot.actualSpend, true)} of ${formatINR(pilot.budget, true)}).`
        : 'Pilot is not yet commissioned. Pre-pilot discovery is active.',
      bullets: pilot ? [
        `Observed Detection Rate: ${pilot.observedMetrics.detectionRate !== null ? formatPercent(pilot.observedMetrics.detectionRate) : 'Pending validation'} (Target: ${formatPercent(pilot.targetMetrics.detectionRate)})`,
        `False Positive Rate: ${pilot.observedMetrics.falsePositiveRate !== null ? formatPercent(pilot.observedMetrics.falsePositiveRate) : 'Pending'} (Benchmark ceiling: ${formatPercent(pilot.targetMetrics.falsePositiveRate)})`,
        `Average Review Time: ${pilot.observedMetrics.reviewTimeMinutes !== null ? `${pilot.observedMetrics.reviewTimeMinutes} mins` : 'Pending'} (Baseline was ${pilot.baselineMetrics.reviewTimeMinutes} mins)`,
        `Observed Leakage Identified: ${pilot.observedMetrics.monthlyIdentifiedDiscrepancy !== null ? formatINR(pilot.observedMetrics.monthlyIdentifiedDiscrepancy) : 'Pending'} / month`,
      ] : ['Pilot metrics pending creation'],
    },
    {
      number: '10',
      title: 'AI Governance & Compliance Status',
      content: governance
        ? `Governance review status: ${governance.status}. Oversight model: ${governance.humanOversightRequirements}.`
        : 'Governance docket has not been formalized.',
      bullets: governance ? [
        `Privacy & PHI Protection: ${governance.privacyConsiderations}`,
        `Explainability & Auditability: ${governance.explainabilityAndTraceability}`,
        `Model Limitations: ${governance.modelLimitations.join('; ')}`,
        `Open Governance Issues: ${governance.issues.filter(i => i.status === 'Open').length} items (${governance.issues.filter(i => i.severity === 'Critical' && i.status === 'Open').length} critical)`,
      ] : ['Governance docket pending'],
    },
    {
      number: '11',
      title: 'Strategic Recommendation',
      content: verdictRationale,
      bullets: [
        `Primary Recommendation: ${verdict}`,
        `Owner: ${opportunity.owner}`,
        `Target Decision Forum: ${audience}`,
      ],
    },
    {
      number: '12',
      title: 'Decision Required',
      content: `Approval is requested from the ${audience} to proceed with: ${
        verdict === 'Recommend Scale'
          ? `Authorization to commence enterprise production roll-out across regional health plans, allocating ${formatINR(primarySol?.estimatedAnnualOperatingCost || 0, true)} in annual operational budget.`
          : verdict === 'Recommend Optimization'
          ? `Authorization for a 6-week targeted model calibration cycle to resolve open governance items and elevate precision before scaling.`
          : 'Authorization to conduct empirical baseline sampling and formalize initial pilot scope.'
      }`,
    },
    {
      number: '13',
      title: 'Next Steps & Accountable Owners',
      content: `Immediate milestone: ${opportunity.nextAction}. Accountable leadership:`,
      bullets: [
        `Business Sponsor: ${opportunity.owner} (Payment Integrity Innovation)`,
        `Technical Lead: ${pilot?.technicalOwner || 'Analytics & AI Engineering'}`,
        `Governance Reviewer: Dr. Sarah Vance (Chief Medical Officer / Review Board)`,
        `Next Milestone Target Date: ${pilot?.milestones[0]?.targetDate ? formatDate(pilot.milestones[0].targetDate) : 'Within 30 business days'}`,
      ],
    },
  ];

  // If audience is CFO, emphasize financial sections
  // If audience is CMO, emphasize clinical and governance sections
  let filteredSections = sections;
  if (detailLevel === 'Executive Summary') {
    filteredSections = sections.filter(s => 
      ['01', '02', '04', '06', '07', '11', '12'].includes(s.number)
    );
  }

  return {
    title: `Executive Briefing: ${opportunity.title}`,
    generatedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    audience,
    detailLevel,
    initiativeId: opportunity.id,
    sections: filteredSections,
    verdict,
    verdictRationale,
    unknowns,
  };
}
