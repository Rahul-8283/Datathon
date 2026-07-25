import { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { getNetworkGraph, type GraphData, type GraphNode } from '../services/api';
import { Loader2, AlertCircle, Network, Maximize, RefreshCw } from 'lucide-react';

const NetworkAnalysis = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // To control the graph camera
  const fgRef = useRef<ForceGraphMethods | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const graphData = await getNetworkGraph();
      setData(graphData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load network graph from Neo4j');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getNodeColor = (node: GraphNode) => {
    // The backend might return labels in ALL CAPS depending on the Cypher query
    const label = node.label?.toUpperCase() || '';
    if (label.includes('PERSON')) return '#d8bb70'; // Amber
    if (label.includes('LOCATION')) return '#34d399'; // Emerald
    if (label.includes('ORGANIZATION')) return '#c084fc'; // Purple
    return '#94a3b8'; // Slate
  };

  const handleZoomToFit = useCallback(() => {
    fgRef.current?.zoomToFit(400, 50);
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col pb-6">
      {/* Header Panel */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end flex-shrink-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d8bb70]">Link Analysis</p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl flex items-center gap-3">
            <Network size={28} className="text-white/70" />
            Criminal Network Graph
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Interactive Neo4j physics simulation. Entities are dynamically clustered based on co-occurrence in KSP Case files.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-none border border-white/8 bg-white/[0.02] px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> REFRESH
          </button>
          <button
            onClick={handleZoomToFit}
            className="inline-flex items-center gap-2 rounded-none border border-[#c6a75b] bg-[#c6a75b]/10 px-4 py-2 text-xs font-semibold text-[#e2c979] hover:bg-[#c6a75b]/25 transition-all cursor-pointer"
          >
            <Maximize size={14} /> ZOOM TO FIT
          </button>
        </div>
      </div>

      {/* Main Content Panel */}
      <div className="rounded-none border border-white/8 bg-[#0c211b] p-5 sm:p-6 flex-1 flex flex-col min-h-[600px] relative">
        
        {/* Errors */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-none border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-8 left-8 z-10 bg-[#07110f]/80 backdrop-blur-sm border border-white/10 p-4 rounded-none">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Entity Legend</h3>
          <div className="flex flex-col gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#d8bb70]" /> Person</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#34d399]" /> Location</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#c084fc]" /> Organization</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#94a3b8]" /> Other (Phone/Vehicle)</div>
          </div>
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-[#07110f] border border-white/5">
          {isLoading && !data ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#c6a75b]">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className="text-sm font-medium">Querying Neo4j Database...</p>
            </div>
          ) : data && data.nodes.length > 0 ? (
            <ForceGraph2D
              ref={fgRef}
              graphData={data}
              nodeColor={getNodeColor as any}
              nodeRelSize={6}
              linkColor={() => 'rgba(255,255,255,0.1)'}
              linkWidth={1.5}
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              backgroundColor="#07110f"
              onEngineStop={() => handleZoomToFit()}
              nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
                // 1. Draw the Node Circle
                const radius = 6;
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = getNodeColor(node);
                ctx.fill();

                // 2. Draw the Text Label below it
                const props = node.properties || {};
                const name = props.name || props.number || props.plate_number || props.address || node.id;
                
                const fontSize = Math.max(12 / globalScale, 2); // Dynamic sizing based on zoom
                ctx.font = `${fontSize}px "Inter", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(name, node.x, node.y + radius + 2);
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <Network size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-400">Knowledge Graph is Empty</p>
              <p className="text-sm text-center mt-2 max-w-md">
                No entities found. Upload case files in the Ledger to extract Suspects, Vehicles, and Locations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NetworkAnalysis;
