import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { buildDecisionGraph, GraphNode } from '../../utils/decisionGraph';
import { calculateValueModel } from '../../utils/calculations';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Info,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const InnovationDecisionGraph: React.FC = () => {
  const { 
    opportunities, 
    solutions, 
    pilots, 
    governanceRecords, 
    valueAssumptions,
    selectedOpportunityId,
    setSelectedOpportunityId
  } = useApp();
  
  const navigate = useNavigate();

  // Selected opportunity for the graph
  const activeOpp = useMemo(() => {
    return opportunities.find(o => o.id === selectedOpportunityId) || opportunities[0];
  }, [opportunities, selectedOpportunityId]);

  // Find linked solution, pilot, governance
  const linkedSolution = useMemo(() => {
    return solutions.find(s => s.opportunityId === activeOpp?.id && s.isRecommended) ||
           solutions.find(s => s.opportunityId === activeOpp?.id) ||
           solutions[0];
  }, [solutions, activeOpp]);

  const linkedPilot = useMemo(() => {
    return pilots.find(p => p.opportunityId === activeOpp?.id);
  }, [pilots, activeOpp]);

  const linkedGov = useMemo(() => {
    return governanceRecords.find(g => g.opportunityId === activeOpp?.id);
  }, [governanceRecords, activeOpp]);

  const valueResult = useMemo(() => {
    return calculateValueModel(valueAssumptions);
  }, [valueAssumptions]);

  const { nodes, edges } = useMemo(() => {
    if (!activeOpp) return { nodes: [], edges: [] };
    return buildDecisionGraph(activeOpp, linkedSolution, linkedPilot, linkedGov, valueResult);
  }, [activeOpp, linkedSolution, linkedPilot, linkedGov, valueResult]);

  // Currently inspected node in the graph
  const [selectedNodeId, setSelectedNodeId] = useState<string>('scale');

  const inspectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || nodes[nodes.length - 1];
  }, [nodes, selectedNodeId]);

  const getNodeStatusStyle = (status: GraphNode['status']) => {
    switch (status) {
      case 'Complete':
        return {
          border: 'border-[#39D6C4]/50 hover:border-[#39D6C4]',
          bg: 'bg-[#172238]',
          badge: 'text-[#39D6C4] bg-[#39D6C4]/10 border border-[#39D6C4]/20',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#39D6C4]" />,
          glow: 'shadow-[#39D6C4]/10',
        };
      case 'In Progress':
        return {
          border: 'border-[#789BFF]/50 hover:border-[#789BFF]',
          bg: 'bg-[#172238]',
          badge: 'text-[#789BFF] bg-[#789BFF]/10 border border-[#789BFF]/20',
          icon: <Clock className="w-3.5 h-3.5 text-[#789BFF]" />,
          glow: 'shadow-[#789BFF]/10',
        };
      case 'Warning':
        return {
          border: 'border-amber-400/50 hover:border-amber-400',
          bg: 'bg-[#172238]',
          badge: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          glow: 'shadow-amber-400/10',
        };
      case 'Blocked':
        return {
          border: 'border-rose-500/50 hover:border-rose-500',
          bg: 'bg-[#172238]',
          badge: 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
          glow: 'shadow-rose-500/10',
        };
      case 'Pending':
      default:
        return {
          border: 'border-slate-800 hover:border-slate-700',
          bg: 'bg-[#11192B]/80',
          badge: 'text-slate-400 bg-slate-800 border border-slate-700',
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
          glow: '',
        };
    }
  };

  return (
    <div className="bg-[#11192B] border border-slate-800/80 rounded-xl p-5 shadow-xl">
      {/* Header and Opportunity Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39D6C4] shadow-sm shadow-[#39D6C4]" />
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Innovation Decision Graph
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#39D6C4]/10 text-[#39D6C4] border border-[#39D6C4]/20 font-mono">
              SIGNATURE LIFECYCLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trace initiatives from business problem through evidence, solution choice, pilot validation, to the scale-readiness gate.
          </p>
        </div>

        {/* Opportunity Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="opp-select" className="text-xs text-slate-400 whitespace-nowrap">
            Initiative:
          </label>
          <select
            id="opp-select"
            value={activeOpp?.id}
            onChange={(e) => {
              setSelectedOpportunityId(e.target.value);
            }}
            className="bg-[#0B1020] border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#39D6C4]/50 font-medium"
          >
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id}: {o.title.slice(0, 38)}... ({o.stage})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Horizontal Graph Flow */}
      <div className="mt-5 overflow-x-auto pb-3">
        <div className="min-w-[980px] flex items-stretch gap-2 relative">
          {nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const style = getNodeStatusStyle(node.status);

            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`flex-1 min-w-[130px] rounded-xl p-3 border cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                    style.bg
                  } ${style.border} ${
                    isSelected ? 'ring-2 ring-[#39D6C4] shadow-lg ' + style.glow : 'shadow-md'
                  }`}
                >
                  {/* Stage Number & Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-1.5">
                      <span className="font-mono font-bold text-slate-400">0{index + 1}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${style.badge}`}>
                        {node.statusLabel}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">
                      {node.stageName}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {node.title}
                    </p>
                  </div>

                  {/* Micro metrics */}
                  <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-1">
                    {node.metrics.slice(0, 2).map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 truncate">{m.label}:</span>
                        <span className="font-mono text-slate-200 font-medium">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Missing warning indicator icon */}
                  {node.missingPrerequisites && node.missingPrerequisites.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-amber-400">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{node.missingPrerequisites.length} prerequisite(s)</span>
                    </div>
                  )}
                </div>

                {/* Arrow connector */}
                {index < nodes.length - 1 && (
                  <div className="flex items-center justify-center px-0.5 text-slate-600 shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspection Card */}
      {inspectedNode && (
        <div className="mt-4 p-4 rounded-xl bg-[#0B1020]/90 border border-slate-800 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#39D6C4] uppercase">
                  Stage Details: {inspectedNode.stageName}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${getNodeStatusStyle(inspectedNode.status).badge}`}>
                  {inspectedNode.statusLabel}
                </span>
              </div>
              
              <h4 className="text-sm font-semibold text-slate-100">
                {inspectedNode.title}
              </h4>
              
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {inspectedNode.details}
              </p>

              {/* Missing prerequisites banner if any */}
              {inspectedNode.missingPrerequisites && inspectedNode.missingPrerequisites.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mt-2">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Unfulfilled Gate Prerequisites:</span>
                  </div>
                  <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-[11px] text-amber-300/90">
                    {inspectedNode.missingPrerequisites.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-400/80 mt-1.5 italic">
                    Per Integrity OS Governance policy, initiatives cannot proceed to scale without satisfying all predecessors.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions / Jump to Record */}
            <div className="shrink-0 flex flex-col gap-2 self-start">
              <button
                onClick={() => navigate(inspectedNode.route)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#39D6C4] hover:bg-[#39D6C4]/90 text-slate-950 font-semibold transition-colors shadow-sm"
              >
                <span>Investigate Record</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              
              <div className="text-[11px] text-slate-400 font-mono text-center">
                Route: {inspectedNode.route.split('?')[0]}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
