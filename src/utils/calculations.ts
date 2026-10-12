import { 
  Opportunity, 
  PrioritizationWeights, 
  ValueAssumptions, 
  ValueResult,
  Pilot,
  GovernanceRecord
} from '../types';

export const DEFAULT_WEIGHTS: PrioritizationWeights = {
  businessImpact: 30,
  feasibility: 20,
  dataReadiness: 20,
  strategicAlignment: 15,
  timeToValue: 15,
};

/**
 * Calculates normalized Priority Score (0 - 100) based on weighted inputs.
 */
export function calculatePriorityScore(
  opp: Opportunity,
  weights: PrioritizationWeights = DEFAULT_WEIGHTS
): {
  totalScore: number;
  breakdown: {
    businessImpactContribution: number;
    feasibilityContribution: number;
    dataReadinessContribution: number;
    strategicAlignmentContribution: number;
    timeToValueContribution: number;
  };
} {
  const sumWeights = 
    weights.businessImpact + 
    weights.feasibility + 
    weights.dataReadiness + 
    weights.strategicAlignment + 
    weights.timeToValue;
  
  // Normalize weights if sum is not 100
  const normW = sumWeights === 100 ? weights : {
    businessImpact: (weights.businessImpact / sumWeights) * 100,
    feasibility: (weights.feasibility / sumWeights) * 100,
    dataReadiness: (weights.dataReadiness / sumWeights) * 100,
    strategicAlignment: (weights.strategicAlignment / sumWeights) * 100,
    timeToValue: (weights.timeToValue / sumWeights) * 100,
  };

  const businessImpactContribution = (opp.businessImpact * normW.businessImpact) / 100;
  const feasibilityContribution = (opp.technicalFeasibility * normW.feasibility) / 100;
  const dataReadinessContribution = (opp.dataReadiness * normW.dataReadiness) / 100;
  const strategicAlignmentContribution = (opp.strategicAlignment * normW.strategicAlignment) / 100;
  const timeToValueContribution = (opp.timeToValue * normW.timeToValue) / 100;

  const totalScore = Math.round(
    (businessImpactContribution +
    feasibilityContribution +
    dataReadinessContribution +
    strategicAlignmentContribution +
    timeToValueContribution) * 10
  ) / 10;

  return {
    totalScore,
    breakdown: {
      businessImpactContribution: Math.round(businessImpactContribution * 10) / 10,
      feasibilityContribution: Math.round(feasibilityContribution * 10) / 10,
      dataReadinessContribution: Math.round(dataReadinessContribution * 10) / 10,
      strategicAlignmentContribution: Math.round(strategicAlignmentContribution * 10) / 10,
      timeToValueContribution: Math.round(timeToValueContribution * 10) / 10,
    },
  };
}

/**
 * Generates deterministic rule-based "Why this, why now?" rationale
 */
export function generateWhyThisWhyNow(opp: Opportunity): {
  supportingFactors: string[];
  cautionFactors: string[];
  summary: string;
} {
  const supporting: string[] = [];
  const caution: string[] = [];

  if (opp.businessImpact >= 75) {
    supporting.push(`High financial exposure: potential gross opportunity of ₹${(opp.estimatedFinancialOpportunity / 10000000).toFixed(2)} Cr across covered lives.`);
  } else if (opp.businessImpact >= 50) {
    supporting.push(`Moderate business impact with recurring savings potential.`);
  }

  if (opp.dataReadiness >= 75) {
    supporting.push('High data readiness: 835/837 EDI claim feeds and remit history are pre-cleansed and readily accessible.');
  } else if (opp.dataReadiness < 50) {
    caution.push('Data readiness is low: unstructured medical records or inconsistent provider notes require pipeline remediation.');
  }

  if (opp.technicalFeasibility >= 75) {
    supporting.push('Strong technical feasibility: well-understood logic patterns with high model convergence.');
  } else if (opp.technicalFeasibility < 50) {
    caution.push('Technical feasibility is constrained: high combinatorial complexity or reliance on emerging NLP capabilities.');
  }

  if (opp.timeToValue >= 70) {
    supporting.push('Fast time-to-value: pilot can demonstrate measurable lift within 6 to 8 weeks.');
  } else if (opp.timeToValue < 40) {
    caution.push('Long gestation period: requires extended shadow mode to calibrate against historical audit benchmarks.');
  }

  if (!opp.evidenceValidated) {
    caution.push('Baseline evidence requires empirical verification before approving production pilot capital.');
  }

  if (opp.riskRating === 'High') {
    caution.push('High operational or provider abrasion risk: requires rigorous human-in-the-loop review.');
  }

  let summary = '';
  if (supporting.length > 0 && caution.length > 0) {
    summary = `This opportunity ranks prominently due to ${supporting[0].toLowerCase()}, supported by ${opp.technicalFeasibility >= 60 ? 'solid technical feasibility' : 'clear strategic priority'}. However, caution is warranted because ${caution[0].toLowerCase()}`;
  } else if (supporting.length > 0) {
    summary = `High-conviction priority initiative with favorable data readiness, strong payer alignment, and low operational barriers.`;
  } else {
    summary = `Candidate initiative currently constrained by low data readiness or validation gaps; recommend exploratory analysis before pilot commitment.`;
  }

  return {
    supportingFactors: supporting.length > 0 ? supporting : ['Aligned with core claim accuracy mandate.'],
    cautionFactors: caution.length > 0 ? caution : ['Requires ongoing monitoring of provider appeal rates.'],
    summary,
  };
}

/**
 * Computes deterministic financial value realization outputs
 */
export function calculateValueModel(assumptions: ValueAssumptions): ValueResult {
  const annualClaimVolume = assumptions.monthlyClaimVolume * 12;
  const baselineErrorFraction = assumptions.baselineErrorRate / 100;
  
  // Potential annual exposure: Total claims * error rate * avg overpayment
  const potentialAnnualExposure = Math.round(
    annualClaimVolume * baselineErrorFraction * assumptions.avgDiscrepancyINR
  );

  // Financial incremental benefit
  const detectionFraction = assumptions.expectedDetectionImprovement / 100;
  const realizationFraction = assumptions.realizationRate / 100;
  const adoptionFraction = assumptions.adoptionRate / 100;
  
  const estimatedIncrementalBenefit = Math.round(
    potentialAnnualExposure * detectionFraction * realizationFraction * adoptionFraction
  );

  // Operational capacity: claims reviewed
  const annualClaimsReviewed = Math.round(annualClaimVolume * baselineErrorFraction);
  const minutesSavedPerClaim = Math.max(0, assumptions.currentReviewTimeMinutes - assumptions.expectedReviewTimeMinutes);
  const annualHoursSaved = Math.round((annualClaimsReviewed * minutesSavedPerClaim) / 60);
  const operationalCapacityValue = Math.round(annualHoursSaved * assumptions.reviewerHourlyCostINR);

  // Totals
  const totalAnnualGrossBenefit = estimatedIncrementalBenefit + operationalCapacityValue;
  const annualNetBenefit = totalAnnualGrossBenefit - assumptions.annualOperatingCostINR;
  const firstYearNetBenefit = totalAnnualGrossBenefit - assumptions.implementationCostINR - assumptions.annualOperatingCostINR;

  // ROI: Net Benefit / (Implementation + 1st Year Op Cost) * 100
  const totalFirstYearInvestment = assumptions.implementationCostINR + assumptions.annualOperatingCostINR;
  const roiPercent = totalFirstYearInvestment > 0 
    ? Math.round((annualNetBenefit / totalFirstYearInvestment) * 1000) / 10 
    : 0;

  // Payback period (months)
  const monthlyNetCash = annualNetBenefit / 12;
  const paybackPeriodMonths = monthlyNetCash > 0 
    ? Math.round((assumptions.implementationCostINR / monthlyNetCash) * 10) / 10 
    : null;

  // Multi-year projection
  const multiYearCashFlows = [];
  let cumulativeNet = -assumptions.implementationCostINR;
  let npv = -assumptions.implementationCostINR;
  const discountRateFraction = assumptions.discountRate / 100;

  for (let yr = 1; yr <= assumptions.timeHorizonYears; yr++) {
    // Ramp up adoption slightly in year 1 vs year 2+
    const yearAdoptionFactor = yr === 1 ? 0.75 : yr === 2 ? 0.95 : 1.0;
    const yearGross = Math.round(totalAnnualGrossBenefit * yearAdoptionFactor);
    const yearCost = assumptions.annualOperatingCostINR;
    const yearNet = yearGross - yearCost;
    cumulativeNet += yearNet;
    const discountedCashFlow = Math.round(yearNet / Math.pow(1 + discountRateFraction, yr));
    npv += discountedCashFlow;

    multiYearCashFlows.push({
      year: yr,
      grossBenefit: yearGross,
      costs: yearCost,
      netBenefit: yearNet,
      cumulativeNet,
      discountedCashFlow,
    });
  }

  return {
    annualClaimVolume,
    potentialAnnualExposure,
    estimatedIncrementalBenefit,
    annualClaimsReviewed,
    annualHoursSaved,
    operationalCapacityValue,
    totalAnnualGrossBenefit,
    annualNetBenefit,
    firstYearNetBenefit,
    roiPercent,
    paybackPeriodMonths,
    multiYearCashFlows,
    npv: Math.round(npv),
  };
}

/**
 * Generates sensitivity matrix: Detection Improvement vs Realization Rate
 */
export function generateSensitivityMatrix(
  assumptions: ValueAssumptions,
  detectionDeltas: number[] = [-15, -5, 0, 10, 20],
  realizationDeltas: number[] = [-20, -10, 0, 10, 20]
) {
  const baseDetection = assumptions.expectedDetectionImprovement;
  const baseRealization = assumptions.realizationRate;

  return realizationDeltas.map(rDelta => {
    const realizationRate = Math.min(100, Math.max(10, baseRealization + rDelta));
    const row = {
      realizationRate,
      cells: detectionDeltas.map(dDelta => {
        const detectionRate = Math.min(100, Math.max(10, baseDetection + dDelta));
        const modified = {
          ...assumptions,
          expectedDetectionImprovement: detectionRate,
          realizationRate: realizationRate,
        };
        const result = calculateValueModel(modified);
        return {
          detectionRate,
          netBenefit: result.annualNetBenefit,
          firstYearNet: result.firstYearNetBenefit,
          roi: result.roiPercent,
        };
      }),
    };
    return row;
  });
}

/**
 * Evaluates scale readiness gate for a pilot.
 */
export function evaluateScaleReadiness(
  pilot: Pilot,
  governanceRecord?: GovernanceRecord
): {
  isScaleReady: boolean;
  missingRequirements: string[];
  completedCount: number;
  totalRequirements: number;
} {
  const requirements: { key: string; label: string; met: boolean }[] = [
    {
      key: 'hypothesis',
      label: 'Measurable business hypothesis documented and agreed',
      met: Boolean(pilot.hypothesis && pilot.scaleReadiness.measurableHypothesisExists),
    },
    {
      key: 'baseline',
      label: 'Historical audit baseline data verified',
      met: Boolean(pilot.scaleReadiness.baselineDataAvailable),
    },
    {
      key: 'results',
      label: 'Observed pilot metrics and findings logged',
      met: Boolean(pilot.observedMetrics.detectionRate !== null && pilot.scaleReadiness.pilotResultsRecorded),
    },
    {
      key: 'financials',
      label: 'Financial value assumptions and ROI model reviewed with finance',
      met: Boolean(pilot.scaleReadiness.financialAssumptionsReviewed),
    },
    {
      key: 'risks',
      label: 'Operational & provider abrasion risks documented with mitigations',
      met: Boolean(pilot.scaleReadiness.relevantRisksDocumented),
    },
    {
      key: 'governance',
      label: 'Formal AI Governance approval recorded (no blocking critical debt)',
      met: Boolean(
        pilot.scaleReadiness.governanceApprovalRecorded &&
        governanceRecord &&
        (governanceRecord.status === 'Approved' || governanceRecord.status === 'Approved with conditions') &&
        !governanceRecord.issues.some(i => i.severity === 'Critical' && i.status === 'Open')
      ),
    },
    {
      key: 'businessOwner',
      label: 'Accountable business owner formal acceptance received',
      met: Boolean(pilot.scaleReadiness.businessOwnerAccepted && pilot.businessOwner),
    },
  ];

  const missing = requirements.filter(r => !r.met).map(r => r.label);
  const completedCount = requirements.filter(r => r.met).length;

  return {
    isScaleReady: missing.length === 0,
    missingRequirements: missing,
    completedCount,
    totalRequirements: requirements.length,
  };
}

/**
 * Calculates governance debt indicators across active pilots and records.
 */
export function calculateGovernanceDebt(governanceRecords: GovernanceRecord[]) {
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let totalOpenIssues = 0;
  let maxDaysOpen = 0;

  governanceRecords.forEach(rec => {
    rec.issues.forEach(issue => {
      if (issue.status === 'Open') {
        totalOpenIssues++;
        if (issue.severity === 'Critical') criticalCount++;
        else if (issue.severity === 'High') highCount++;
        else mediumCount++;

        if (issue.daysOpen > maxDaysOpen) maxDaysOpen = issue.daysOpen;
      }
    });
  });

  return {
    totalOpenIssues,
    criticalCount,
    highCount,
    mediumCount,
    maxDaysOpen,
    severitySummary: criticalCount > 0 ? 'Critical' : highCount > 0 ? 'Elevated' : totalOpenIssues > 0 ? 'Moderate' : 'Clear',
  };
}
