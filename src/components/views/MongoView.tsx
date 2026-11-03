import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  Database, 
  Search, 
  Zap, 
  Code, 
  Cpu, 
  CheckCircle2, 
  Plus, 
  Trash2,
  FileJson,
  Key,
  FolderTree
} from 'lucide-react';
import { api } from '../../services/api';
import { LOGI_MASCOT } from '../../assets/mascot';

export const MongoView: React.FC = () => {
  // Aggregation Pipeline State
  const [collection, setCollection] = useState<'inventory' | 'orders' | 'warehouses'>('inventory');
  const [pipelineText, setPipelineText] = useState(`[
  { "$match": { "status": "in_stock" } },
  { "$group": {
      "_id": "$category",
      "totalUnits": { "$sum": "$quantity" },
      "skuCount": { "$sum": 1 },
      "avgUnitPrice": { "$avg": "$retail_price" }
    }
  },
  { "$sort": { "totalUnits": -1 } }
]`);
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);

  // Document CRUD & Query State
  const [findFilter, setFindFilter] = useState('{ "category": "Electronics", "quantity": { "$gte": 50 } }');
  const [documentsResult, setDocumentsResult] = useState<any[]>([
    { _id: 'doc_64f1a01', sku: 'SKU-AUDIO-01', name: 'Noise Cancelling Headphones', category: 'Electronics', quantity: 145, retail_price: 2999, warehouse_ref: 'wh_blr_01', status: 'in_stock' },
    { _id: 'doc_64f1a02', sku: 'SKU-DRONE-4K', name: 'Commercial 4K Drone', category: 'Electronics', quantity: 60, retail_price: 18499, warehouse_ref: 'wh_del_01', status: 'in_stock' }
  ]);
  const [crudLoading, setCrudLoading] = useState(false);

  // Indexing & Explain Plan State
  const [explainIndex, setExplainIndex] = useState('category_1_quantity_-1');
  const [explainPlan, setExplainPlan] = useState<any>({
    executionSuccess: true,
    nReturned: 2,
    executionTimeMillis: 0.84,
    totalKeysExamined: 2,
    totalDocsExamined: 2,
    stage: 'IXSCAN (Index Scan)',
    indexName: 'category_1_quantity_-1',
    isCoveredQuery: true
  });

  const handleRunPipeline = async () => {
    setPipelineLoading(true);
    try {
      const parsedPipeline = JSON.parse(pipelineText);
      const res = await api.executeMongo(collection, parsedPipeline);
      setPipelineResult(res);
    } catch (err: any) {
      setPipelineResult({ error: err.message || 'JSON Parse or Aggregation Pipeline error' });
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleFindDocuments = async () => {
    setCrudLoading(true);
    try {
      const filter = JSON.parse(findFilter);
      // Simulate MongoDB find query
      await new Promise(r => setTimeout(r, 300));
      setDocumentsResult([
        { _id: 'doc_64f1a01', sku: 'SKU-AUDIO-01', name: 'Noise Cancelling Headphones', category: 'Electronics', quantity: 145, retail_price: 2999, warehouse_ref: 'wh_blr_01', status: 'in_stock' },
        { _id: 'doc_64f1a02', sku: 'SKU-DRONE-4K', name: 'Commercial 4K Drone', category: 'Electronics', quantity: 60, retail_price: 18499, warehouse_ref: 'wh_del_01', status: 'in_stock' }
      ]);
    } catch (err: any) {
      alert('Invalid JSON filter query');
    } finally {
      setCrudLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={LOGI_MASCOT.avatar}
            alt="Logi Mascot"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">NoSQL — MongoDB Engine & Aggregations</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Document Store v7.0
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Multi-stage aggregation pipeline studio ($match, $group, $sort), document CRUD operations, indexing optimization (IXSCAN vs COLLSCAN), and embedded vs referenced schema modeling.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={pipelineLoading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Play className={`w-4 h-4 fill-white ${pipelineLoading ? 'animate-spin' : ''}`} />
          <span>{pipelineLoading ? 'Running Aggregation...' : 'Execute Aggregation Pipeline'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MULTI-STAGE AGGREGATION PIPELINE BUILDER */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Multi-Stage Aggregation Pipeline Studio</h2>
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold">Target Collection:</span>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="inventory">db.inventory</option>
              <option value="orders">db.orders</option>
              <option value="warehouses">db.warehouses</option>
            </select>
          </div>
        </div>

        {/* Pipeline Presets */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold">Preset Pipelines:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setPipelineText(`[\n  { "$match": { "status": "in_stock" } },\n  { "$group": {\n      "_id": "$category",\n      "totalUnits": { "$sum": "$quantity" },\n      "skuCount": { "$sum": 1 }\n    }\n  },\n  { "$sort": { "totalUnits": -1 } }\n]`)}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono cursor-pointer"
            >
              Category Rollup ($group)
            </button>
            <button
              onClick={() => setPipelineText(`[\n  { "$match": { "retail_price": { "$gt": 1000 } } },\n  { "$project": {\n      "sku": 1,\n      "name": 1,\n      "category": 1,\n      "retail_price": 1,\n      "taxAmount": { "$multiply": ["$retail_price", 0.18] }\n    }\n  }\n]`)}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono cursor-pointer"
            >
              Tax Projection ($project)
            </button>
          </div>
        </div>

        {/* Code Editor & Result */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 block">Aggregation Stages JSON:</label>
            <textarea
              rows={9}
              value={pipelineText}
              onChange={(e) => setPipelineText(e.target.value)}
              className="w-full p-3.5 bg-slate-900 text-amber-300 rounded-xl font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 block">Pipeline Stage Results (Aggregated Output):</label>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 min-h-[175px] max-h-64 overflow-y-auto">
              {pipelineResult ? (
                <pre className="whitespace-pre-wrap text-[11px]">
                  {JSON.stringify(pipelineResult.results || pipelineResult.result || pipelineResult, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-500 flex items-center justify-center h-36">
                  Click "Execute Aggregation Pipeline" to compute real-time groupings...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Document CRUD, Schema & Indexing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================================================= */}
        {/* 2. DOCUMENT CRUD FINDER */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Document CRUD & Find</h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              db.collection.find()
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">MQL Query Filter:</label>
              <textarea
                rows={2}
                value={findFilter}
                onChange={(e) => setFindFilter(e.target.value)}
                className="w-full p-2 bg-slate-900 text-blue-300 font-mono text-xs rounded-lg border border-slate-800"
              />
            </div>

            <button
              onClick={handleFindDocuments}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Query Matching Documents
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Documents Returned ({documentsResult.length}):</span>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{JSON.stringify(documentsResult, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. INDEXING & EXPLAIN PLAN PERFORMANCE */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Compound Index & Explain</h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              IXSCAN
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Compound B-Tree Index:</span>
              <span className="font-mono text-slate-800 font-bold text-[11px]">{`{ category: 1, quantity: -1 }`}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Execution Time</span>
                <span className="text-lg font-bold font-mono text-emerald-800">{explainPlan.executionTimeMillis} ms</span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] text-blue-700 font-semibold uppercase block">Docs Examined</span>
                <span className="text-lg font-bold font-mono text-blue-800">{explainPlan.totalDocsExamined} (Index Covered)</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Execution Plan Output:</span>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-300">
                <pre className="whitespace-pre-wrap">{JSON.stringify(explainPlan, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. EMBEDDING VS REFERENCING RELATIONSHIPS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Embedding vs Referencing</h2>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Embedded Pattern */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span>Embedded Document (1:Few)</span>
              </span>
              <p className="text-[11px] text-slate-500">
                SKU batch lots embedded inside order items. Atomic updates without `$lookup` join latency.
              </p>
            </div>

            {/* Referenced Pattern */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Referenced Document (1:Many)</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Foreign `warehouse_id` references centralized fulfillment hub document to prevent unbounded array growth.
              </p>
            </div>

            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[10px] font-semibold">
              ✓ Complies with 16MB document size threshold and high read concurrency requirements.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
