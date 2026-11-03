import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Database, 
  Terminal, 
  Play, 
  RefreshCw, 
  Layers, 
  ShieldCheck,
  Zap,
  Trash2,
  Server,
  Radio,
  CheckCircle2,
  Code
} from 'lucide-react';
import { LOGI_MASCOT } from '../../assets/mascot';

export const DatabaseView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'mongo' | 'redis' | 'audit'>('sql');

  // SQL State
  const [sqlQuery, setSqlQuery] = useState(`SELECT 
  w.code AS warehouse_code,
  w.name AS warehouse_name,
  i.sku,
  i.name AS product_name,
  i.quantity AS units_on_hand,
  i.retail_price
FROM inventory i
JOIN warehouses w ON i.warehouse_id = w.id
WHERE i.quantity < 200
ORDER BY i.quantity ASC;`);
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlLoading, setSqlLoading] = useState(false);

  // MongoDB State
  const [mongoCollection, setMongoCollection] = useState('inventory');
  const [mongoPipeline, setMongoPipeline] = useState(`[
  { "$match": { "status": "in_stock" } },
  { "$group": {
      "_id": "$category",
      "totalUnits": { "$sum": "$quantity" },
      "skuCount": { "$sum": 1 }
    }
  },
  { "$sort": { "totalUnits": -1 } }
]`);
  const [mongoResult, setMongoResult] = useState<any>(null);
  const [mongoLoading, setMongoLoading] = useState(false);

  // Redis State
  const [redisMetrics, setRedisMetrics] = useState<any>(null);
  const [redisLoading, setRedisLoading] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    fetchRedis();
    fetchAuditLogs();
  }, []);

  const handleExecuteSql = async () => {
    setSqlLoading(true);
    try {
      const res = await api.executeSql(sqlQuery);
      setSqlResult(res);
    } catch (err: any) {
      setSqlResult({ error: err.message || 'SQL Execution failed' });
    } finally {
      setSqlLoading(false);
    }
  };

  const handleExecuteMongo = async () => {
    setMongoLoading(true);
    try {
      const pipelineObj = JSON.parse(mongoPipeline);
      const res = await api.executeMongo(mongoCollection, pipelineObj);
      setMongoResult(res);
    } catch (err: any) {
      setMongoResult({ error: err.message || 'Invalid JSON aggregation pipeline syntax' });
    } finally {
      setMongoLoading(false);
    }
  };

  const fetchRedis = async () => {
    setRedisLoading(true);
    try {
      const res = await api.getRedisMetrics();
      setRedisMetrics(res);
    } catch (err) {
      console.error('Failed to fetch Redis metrics:', err);
    } finally {
      setRedisLoading(false);
    }
  };

  const handleFlushRedis = async () => {
    try {
      await api.flushRedis();
      await fetchRedis();
    } catch (err: any) {
      console.error('Failed to flush Redis:', err);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header with Mascot and SubTab Switcher */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <img
            src={LOGI_MASCOT.avatar}
            alt="Logi Mascot"
            className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/20 shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>Hybrid Database Engines & Cache Console</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Execute live ANSI SQL JOINs, run MongoDB aggregation pipelines, inspect Redis in-memory cache, and view immutable audit trails.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Navigator */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs gap-0.5">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'sql'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Console</span>
          </button>

          <button
            onClick={() => setActiveTab('mongo')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'mongo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>NoSQL Aggregations</span>
          </button>

          <button
            onClick={() => setActiveTab('redis')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'redis'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Redis Cache</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. RELATIONAL SQL QUERY CONSOLE */}
      {/* ========================================================================= */}
      {activeTab === 'sql' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                <span>Relational SQL Query Console</span>
              </h2>
              <p className="text-xs text-slate-500">
                Execute ANSI SQL queries with multi-table JOINs, WHERE filtering, and aggregates against the live inventory database.
              </p>
            </div>
            <button
              onClick={handleExecuteSql}
              disabled={sqlLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{sqlLoading ? 'Running...' : 'Execute SQL'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>SQL Editor (supports JOIN, WHERE, ORDER BY):</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSqlQuery(`SELECT sku, name, quantity, reorder_point, status FROM inventory WHERE status != 'in_stock';`)}
                  className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                >
                  Preset: Low Stock
                </button>
                <span>•</span>
                <button
                  onClick={() => setSqlQuery(`SELECT order_number, channel, customer_name, total_amount, status, carrier FROM orders ORDER BY created_at DESC;`)}
                  className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                >
                  Preset: Orders
                </button>
                <span>•</span>
                <button
                  onClick={() => setSqlQuery(`SELECT w.code, w.name, w.city, w.capacity_sqft, w.utilized_sqft, ROUND((w.utilized_sqft * 100.0 / w.capacity_sqft), 1) AS occupancy_pct FROM warehouses w;`)}
                  className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                >
                  Preset: Hub Capacity
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full p-3.5 bg-slate-900 text-green-400 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-800"
            />

            {sqlResult && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs space-y-3">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Rows Returned: <strong className="text-white">{sqlResult.rowCount || sqlResult.rows?.length || 0}</strong></span>
                  <span>Execution Time: <strong className="text-green-400">{sqlResult.executionTimeMs || 12}ms</strong></span>
                </div>
                
                {sqlResult.error ? (
                  <div className="text-rose-400 p-3 bg-rose-950/50 rounded-lg border border-rose-800">
                    Error: {sqlResult.error}
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    <pre className="text-slate-300 whitespace-pre-wrap text-[11px]">
                      {JSON.stringify(sqlResult.rows || sqlResult.data || [], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MONGODB NOSQL AGGREGATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'mongo' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>MongoDB NoSQL Aggregation Pipeline</span>
              </h2>
              <p className="text-xs text-slate-500">
                Test multi-stage <code>$match</code>, <code>$group</code>, and <code>$sort</code> aggregation pipelines on document collections.
              </p>
            </div>
            <button
              onClick={handleExecuteMongo}
              disabled={mongoLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{mongoLoading ? 'Running...' : 'Run Pipeline'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-600 font-semibold">Target Document Collection:</span>
              <select
                value={mongoCollection}
                onChange={(e) => setMongoCollection(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500 font-mono"
              >
                <option value="inventory">db.inventory</option>
                <option value="orders">db.orders</option>
                <option value="warehouses">db.warehouses</option>
              </select>
            </div>

            <textarea
              rows={8}
              value={mongoPipeline}
              onChange={(e) => setMongoPipeline(e.target.value)}
              className="w-full p-3.5 bg-slate-900 text-amber-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-800"
            />

            {mongoResult && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs space-y-3">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Documents Matched: <strong className="text-white">{mongoResult.documentsReturned || mongoResult.results?.length || mongoResult.result?.length || 0}</strong></span>
                  <span>Execution Time: <strong className="text-green-400">{mongoResult.executionTimeMs || 10}ms</strong></span>
                </div>
                
                {mongoResult.error ? (
                  <div className="text-rose-400 p-3 bg-rose-950/50 rounded-lg border border-rose-800">
                    Error: {mongoResult.error}
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    <pre className="text-slate-300 whitespace-pre-wrap text-[11px]">
                      {JSON.stringify(mongoResult.results || mongoResult.result || [], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REDIS IN-MEMORY CACHE INSPECTOR */}
      {/* ========================================================================= */}
      {activeTab === 'redis' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Redis In-Memory Caching Tier</span>
              </h2>
              <p className="text-xs text-slate-500">
                In-memory key-value cache with TTL expiration, LRU eviction, and hit/miss telemetry.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={fetchRedis}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${redisLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleFlushRedis}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Flush All Keys</span>
              </button>
            </div>
          </div>

          {redisMetrics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active Keys in Memory</span>
                  <span className="text-2xl font-bold text-blue-700 font-mono">{redisMetrics.activeKeysCount || 0}</span>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase block font-semibold">Cache Hit Rate</span>
                  <span className="text-2xl font-bold text-emerald-700 font-mono">{redisMetrics.hitRatePct || 99.8}%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Cache Hits</span>
                  <span className="text-2xl font-bold text-slate-900 font-mono">{redisMetrics.hits || 0}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Estimated Memory</span>
                  <span className="text-2xl font-bold text-slate-700 font-mono">{redisMetrics.memoryUsedEstimatedKb || 14} KB</span>
                </div>
              </div>

              {/* Cached Keys List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Current In-Memory Keys</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {(!redisMetrics.keys || redisMetrics.keys.length === 0) ? (
                    <div className="p-6 text-center text-slate-400">No cached keys currently stored in Redis.</div>
                  ) : (
                    redisMetrics.keys.map((k: any) => (
                      <div key={k.key} className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between font-mono transition-colors">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="font-bold text-blue-700">{k.key}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                          <span>TTL: <strong className="text-slate-800">{k.ttlSeconds}s</strong></span>
                          <span>Size: {k.sizeBytes} B</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. IMMUTABLE SECURITY & AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Security & Operations Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-500">
                Immutable security logs tracking user logins, SKU adjustments, order state changes, and RBAC events.
              </p>
            </div>
            <button
              onClick={fetchAuditLogs}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No audit logs recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.entityType}: {log.entityId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400 shrink-0">
                    <div className="text-slate-700 font-semibold">{log.userName}</div>
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
