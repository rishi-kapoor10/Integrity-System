/**
 * Currency and data formatting helpers for Integrity OS
 */

export function formatINR(
  amount: number | null | undefined,
  compact: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }

  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  if (compact) {
    if (absVal >= 10000000) {
      const cr = (absVal / 10000000).toFixed(2);
      return `${isNegative ? '-' : ''}₹${cr} Cr`;
    }
    if (absVal >= 100000) {
      const lakh = (absVal / 100000).toFixed(2);
      return `${isNegative ? '-' : ''}₹${lakh} L`;
    }
    if (absVal >= 1000) {
      const k = (absVal / 1000).toFixed(1);
      return `${isNegative ? '-' : ''}₹${k} K`;
    }
  }

  // Standard Indian numbering grouping (e.g. 12,34,567)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(absVal));

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getRiskBandClass(band: 'High' | 'Medium' | 'Low'): {
  badge: string;
  dot: string;
  text: string;
} {
  switch (band) {
    case 'High':
      return {
        badge: 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
        dot: 'bg-rose-400',
        text: 'text-rose-400',
      };
    case 'Medium':
      return {
        badge: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
        dot: 'bg-amber-400',
        text: 'text-amber-400',
      };
    case 'Low':
      return {
        badge: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
        dot: 'bg-emerald-400',
        text: 'text-emerald-400',
      };
  }
}

export function getStageClass(stage: string): string {
  switch (stage) {
    case 'Ready for scale':
    case 'Approved':
    case 'Validated':
    case 'Completed':
      return 'text-[#39D6C4] bg-[#39D6C4]/10 border border-[#39D6C4]/20';
    case 'Pilot in progress':
    case 'Approved for pilot':
    case 'In testing':
    case 'Under review':
    case 'Active Review':
      return 'text-[#789BFF] bg-[#789BFF]/10 border border-[#789BFF]/20';
    case 'Under analysis':
    case 'Proposed':
    case 'Shadow Mode':
    case 'Design':
    case 'Data Ingestion':
      return 'text-amber-400 bg-amber-400/10 border border-amber-400/20';
    case 'Governance review':
    case 'Approved with conditions':
      return 'text-purple-400 bg-purple-400/10 border border-purple-400/20';
    case 'Paused':
    case 'Reassessment required':
      return 'text-slate-400 bg-slate-800 border border-slate-700';
    case 'Rejected':
    case 'Overdue':
    case 'At Risk':
      return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
    default:
      return 'text-slate-300 bg-slate-800/80 border border-slate-700';
  }
}
