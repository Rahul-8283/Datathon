import { useState } from 'react';
import { Search, Loader2, Database, AlertCircle } from 'lucide-react';
import { searchModusOperandi, type SearchResult } from '../services/api';

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchModusOperandi(query);
      setResults(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during semantic search.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchScore = (distance: number) => {
    // ChromaDB L2 distance is typically between 0 and 2
    // Convert to percentage: distance 0 -> 100%, distance 2 -> 0%
    const matchPercentage = Math.max(0, Math.min(100, (1 - (distance / 2)) * 100));
    return matchPercentage.toFixed(1) + '% MATCH';
  };

  const getStatusBadgeClass = (distance: number) => {
    if (distance < 0.4) return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
    if (distance < 0.7) return 'border-[#c6a75b]/20 bg-[#c6a75b]/10 text-[#d8bb70]';
    return 'border-[#ef7763]/20 bg-[#ef7763]/10 text-[#ef7763]';
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d8bb70]">Intelligence Discovery</p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">
            Semantic MO Search
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Query the Vector Database using natural language to uncover similar Modus Operandi across historical cases.
          </p>
        </div>
      </div>

      {/* Main Content Panel */}
      <div className="rounded-none border border-white/8 bg-[#0c211b] p-5 sm:p-6">
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-2xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'Two suspects on a motorcycle snatched a gold chain'"
              className="w-full rounded-none border border-white/8 bg-white/[0.02] pl-10 pr-32 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-[#c6a75b] focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-1 top-1 bottom-1 flex items-center justify-center gap-2 rounded-none border border-[#c6a75b] bg-[#c6a75b]/10 px-4 text-xs font-semibold text-[#e2c979] hover:bg-[#c6a75b]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'SEARCH'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-none border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!hasSearched && !isLoading && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 border border-white/8 border-dashed bg-white/[0.01]">
            <Database size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-medium text-slate-400">Ready to query Vector Space</p>
            <p className="text-xs mt-1 text-center max-w-md">
              Enter a conceptual description of a crime above. The AI will vectorize your query and return the closest matches.
            </p>
          </div>
        )}

        {hasSearched && !isLoading && results.length === 0 && !error && (
          <div className="py-16 text-center text-sm text-slate-500 border border-white/8 bg-white/[0.01]">
            No conceptually similar cases found within the threshold.
          </div>
        )}

        {hasSearched && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-white/8">
              Top {results.length} Conceptual Matches
            </h2>
            
            <div className="grid gap-4">
              {results.map((result, idx) => (
                <div key={result.id} className="border border-white/8 bg-white/[0.015] p-5 hover:bg-white/[0.03] transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 border border-white/10 bg-white/5 text-slate-300 font-bold text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white font-mono">
                          FILE: {result.metadata.filename || 'Unknown'}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {result.id}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(result.distance)}`}>
                      {getMatchScore(result.distance)}
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 border border-white/5 mt-3">
                    <p className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap">
                      {result.document}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemanticSearch;
