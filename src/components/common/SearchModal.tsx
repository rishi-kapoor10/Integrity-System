import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, X, ArrowRight, Layers, FileText, FlaskConical, ShieldAlert } from 'lucide-react';
import { formatINR, getStageClass } from '../../utils/formatting';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setSearchOpen, opportunities, claims, pilots, governanceRecords } = useApp();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'opportunities' | 'claims' | 'pilots' | 'governance'>('all');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut listener Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        opportunities: opportunities.slice(0, 3),
        claims: claims.slice(0, 3),
        pilots: pilots.slice(0, 3),
        governance: governanceRecords.slice(0, 3),
      };
    }

    const matchedOpps = opportunities.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.title.toLowerCase().includes(q) ||
      o.businessProblem.toLowerCase().includes(q) ||
      o.owner.toLowerCase().includes(q)
    );

    const matchedClaims = claims.filter(c => 
      c.claimId.toLowerCase().includes(q) ||
      c.providerName.toLowerCase().includes(q) ||
      c.providerId.toLowerCase().includes(q) ||
      c.detectionReason.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );

    const matchedPilots = pilots.filter(p => 
      p.id.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.businessOwner.toLowerCase().includes(q) ||
      p.hypothesis.toLowerCase().includes(q)
    );

    const matchedGov = governanceRecords.filter(g => 
      g.id.toLowerCase().includes(q) ||
      g.title.toLowerCase().includes(q) ||
      g.intendedBusinessUse.toLowerCase().includes(q)
    );

    return {
      opportunities: matchedOpps,
      claims: matchedClaims,
      pilots: matchedPilots,
      governance: matchedGov,
    };
  }, [query, opportunities, claims, pilots, governanceRecords]);

  if (!isSearchOpen) return null;

  const handleSelect = (route: string) => {
    setSearchOpen(false);
    navigate(route);
  };

  const totalResults = results.opportunities.length + results.claims.length + results.pilots.length + results.governance.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#11192B] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Global Search"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/80 bg-[#0B1020]/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities, claims, pilots, or governance dockets..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setSearchOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#11192B] border-b border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'all' ? 'bg-[#39D6C4]/10 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'opportunities' ? 'bg-[#39D6C4]/10 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Opportunities ({results.opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'claims' ? 'bg-[#39D6C4]/10 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Claims ({results.claims.length})
          </button>
          <button
            onClick={() => setActiveTab('pilots')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'pilots' ? 'bg-[#39D6C4]/10 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pilots ({results.pilots.length})
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'governance' ? 'bg-[#39D6C4]/10 text-[#39D6C4] font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Governance ({results.governance.length})
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {totalResults === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching records found for "{query}". Try searching by claim ID, category, or clinical problem.
            </div>
          ) : (
            <>
              {/* Opportunities */}
              {(activeTab === 'all' || activeTab === 'opportunities') && results.opportunities.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Layers className="w-3 h-3 text-[#39D6C4]" /> Opportunities
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.opportunities.map(opp => (
                      <div
                        key={opp.id}
                        onClick={() => handleSelect(`/opportunities?id=${opp.id}`)}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-800 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#39D6C4]">{opp.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStageClass(opp.stage)}`}>{opp.stage}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium truncate mt-0.5">{opp.title}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{opp.businessProblem}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono text-slate-300 font-semibold">{formatINR(opp.estimatedFinancialOpportunity, true)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 ml-auto mt-1 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Claims */}
              {(activeTab === 'all' || activeTab === 'claims') && results.claims.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <FileText className="w-3 h-3 text-[#789BFF]" /> Claims
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.claims.map(c => (
                      <div
                        key={c.claimId}
                        onClick={() => handleSelect(`/claims?search=${c.claimId}`)}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-800 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#789BFF]">{c.claimId}</span>
                            <span className="text-[11px] text-slate-400">{c.category} · {c.providerName}</span>
                          </div>
                          <p className="text-xs text-slate-300 truncate mt-0.5">{c.detectionReason}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono text-slate-200">{formatINR(c.amountPaid)}</span>
                          <span className={`block text-[10px] font-mono ${c.riskBand === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>Score: {c.simulatedRiskScore}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pilots */}
              {(activeTab === 'all' || activeTab === 'pilots') && results.pilots.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <FlaskConical className="w-3 h-3 text-purple-400" /> Pilots
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.pilots.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(`/pilots?id=${p.id}`)}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-800 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-purple-400">{p.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStageClass(p.status)}`}>{p.status}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium truncate mt-0.5">{p.title}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.hypothesis}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono text-slate-300">Budget: {formatINR(p.budget, true)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 ml-auto mt-1 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Governance */}
              {(activeTab === 'all' || activeTab === 'governance') && results.governance.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <ShieldAlert className="w-3 h-3 text-amber-400" /> Governance Records
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.governance.map(g => (
                      <div
                        key={g.id}
                        onClick={() => handleSelect(`/governance?id=${g.id}`)}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-800 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-amber-400">{g.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStageClass(g.status)}`}>{g.status}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium truncate mt-0.5">{g.title}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] text-slate-400">{g.issues.length} open issue(s)</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 ml-auto mt-1 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0B1020]/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate using click or Escape to close</span>
          <span className="font-mono">INTEGRITY OS SEARCH</span>
        </div>
      </div>
    </div>
  );
};
