import React, { useState } from 'react';
import { 
  Database, 
  Terminal, 
  Play, 
  Layers, 
  GitBranch, 
  CheckCircle2, 
  Code, 
  Cpu, 
  Table, 
  Workflow, 
  Lock, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { LOGI_MASCOT } from '../../assets/mascot';

export const SqlView: React.FC = () => {
  // SQL Query Console State
  const [sqlQuery, setSqlQuery] = useState(`SELECT 
  w.code AS warehouse_code,
  w.name AS hub_name,
  w.city,
  i.sku,
  i.name AS product_name,
  i.quantity AS stock_units,
  i.reorder_point,
  ROUND((w.utilized_sqft * 100.0 / w.capacity_sqft), 1) AS hub_utilization_pct
FROM inventory i
INNER JOIN warehouses w ON i.warehouse_id = w.id
WHERE i.quantity < 250
ORDER BY i.quantity ASC;`);
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlLoading, setSqlLoading] = useState(false);

  // ACID Transaction Simulator State
  const [txStep, setTxStep] = useState<number>(0);
  const [txLog, setTxLog] = useState<string[]>([]);
  const [txSimulating, setTxSimulating] = useState(false);

  // Run SQL Query
  const handleExecuteSql = async () => {
    setSqlLoading(true);
    try {
      const res = await api.executeSql(sqlQuery);
      setSqlResult(res);
    } catch (err: any) {
      setSqlResult({ error: err.message || 'SQL Execution error' });
    } finally {
      setSqlLoading(false);
    }
  };

  // Run ACID Transaction Simulation
  const handleRunTransaction = async (shouldRollback = false) => {
    setTxSimulating(true);
    setTxLog([]);
    setTxStep(1);

    const log = (msg: string) => setTxLog(prev => [...prev, msg]);

    log('1. BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;');
    await new Promise(r => setTimeout(r, 400));
    setTxStep(2);

    log('2. SELECT quantity FROM inventory WHERE sku = "SKU-AUDIO-01" FOR UPDATE;');
    await new Promise(r => setTimeout(r, 400));
    setTxStep(3);

    log('3. UPDATE inventory SET quantity = quantity - 5 WHERE sku = "SKU-AUDIO-01";');
    await new Promise(r => setTimeout(r, 400));
    setTxStep(4);

    log('4. INSERT INTO orders (order_id, sku, units, status) VALUES ("ORD-9921", "SKU-AUDIO-01", 5, "reserved");');
    await new Promise(r => setTimeout(r, 400));

    if (shouldRollback) {
      setTxStep(5);
      log('🚨 5. INVENTORY SAFETY CHECK FAILED (Concurrent lock detected) -> ROLLBACK;');
      await new Promise(r => setTimeout(r, 400));
      log('✓ Transaction rolled back cleanly without data corruption (Atomicity guaranteed).');
    } else {
      setTxStep(5);
      log('✓ 5. COMMIT TRANSACTION;');
      await new Promise(r => setTimeout(r, 400));
      log('✓ Transaction committed with full ACID durability.');
    }
    setTxSimulating(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={LOGI_MASCOT.avatar}
            alt="Logi Mascot"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md shadow-blue-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SQL — Relational PostgreSQL Engine</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                ANSI SQL / ACID
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Multi-table SQL JOINs, filtering (WHERE), grouping (GROUP BY), relational schema design (PK/FK), normalization principles (1NF-3NF), and ACID transaction simulation.
            </p>
          </div>
        </div>

        <button
          onClick={handleExecuteSql}
          disabled={sqlLoading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Play className={`w-4 h-4 fill-white ${sqlLoading ? 'animate-spin' : ''}`} />
          <span>{sqlLoading ? 'Executing SQL...' : 'Run SQL Query'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. RELATIONAL SQL QUERY CONSOLE */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Relational SQL Editor & JOIN Visualizer</h2>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Query Presets:</span>
            <button
              onClick={() => setSqlQuery(`SELECT \n  w.code AS warehouse_code,\n  w.name AS hub_name,\n  COUNT(i.id) AS active_skus,\n  SUM(i.quantity) AS total_inventory_units\nFROM warehouses w\nLEFT JOIN inventory i ON w.id = i.warehouse_id\nGROUP BY w.code, w.name\nORDER BY total_inventory_units DESC;`)}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono cursor-pointer"
            >
              GROUP BY Hub
            </button>
            <button
              onClick={() => setSqlQuery(`SELECT \n  o.order_number,\n  o.customer_name,\n  o.total_amount,\n  o.status,\n  o.carrier\nFROM orders o\nWHERE o.status IN ('pending', 'picking', 'packing')\nORDER BY o.total_amount DESC;`)}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono cursor-pointer"
            >
              Active Orders
            </button>
          </div>
        </div>

        {/* Editor & Response Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 block">ANSI SQL Statement:</label>
            <textarea
              rows={9}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full p-3.5 bg-slate-900 text-green-400 rounded-xl font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-600">Query Execution Output:</label>
              {sqlResult && (
                <span className="font-mono text-[10px] text-green-600">
                  Rows: {sqlResult.rowCount || sqlResult.rows?.length || 0} • {sqlResult.executionTimeMs || 14}ms
                </span>
              )}
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 min-h-[175px] max-h-64 overflow-y-auto">
              {sqlResult ? (
                <pre className="whitespace-pre-wrap text-[11px]">
                  {JSON.stringify(sqlResult.rows || sqlResult.data || sqlResult, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-500 flex items-center justify-center h-36">
                  Click "Run SQL Query" to execute live JOIN across inventory and warehouses...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of ACID Transactions, Schema Relations & Normalization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========================================================================= */}
        {/* 2. ACID TRANSACTION SIMULATOR */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">ACID Transaction Isolation</h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              SERIALIZABLE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Simulates two-phase locking (`SELECT FOR UPDATE`) and atomic inventory deductions.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => handleRunTransaction(false)}
                disabled={txSimulating}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Commit Flow
              </button>
              <button
                onClick={() => handleRunTransaction(true)}
                disabled={txSimulating}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Rollback Flow
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Transaction Log:</span>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-300 min-h-[110px] space-y-1">
                {txLog.length === 0 ? (
                  <span className="text-slate-500">Select Commit or Rollback to trace ACID steps...</span>
                ) : (
                  txLog.map((l, i) => <div key={i}>{l}</div>)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. RELATIONAL SCHEMA & PK/FK ARCHITECTURE */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Table className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Relational Schema (PK/FK)</h2>
            </div>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-blue-700 flex items-center justify-between">
                <span>TABLE: warehouses</span>
                <span className="text-[10px] text-slate-400">Parent</span>
              </div>
              <p className="text-[10px] text-slate-600">PK: id (UUID) • code (VARCHAR UNIQUE)</p>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-emerald-700 flex items-center justify-between">
                <span>TABLE: inventory</span>
                <span className="text-[10px] text-slate-400">Child</span>
              </div>
              <p className="text-[10px] text-slate-600">PK: id • FK: warehouse_id REFERENCES warehouses(id)</p>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-purple-700 flex items-center justify-between">
                <span>TABLE: orders</span>
                <span className="text-[10px] text-slate-400">Child</span>
              </div>
              <p className="text-[10px] text-slate-600">PK: id • FK: assigned_warehouse_id</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DATABASE NORMALIZATION PRINCIPLES */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Workflow className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Normalization Standards</h2>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">1NF (First Normal Form)</span>
              <p className="text-[10px] text-slate-500">Atomic column values; no repeating groups or comma-separated lists.</p>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">2NF (Second Normal Form)</span>
              <p className="text-[10px] text-slate-500">No partial dependencies on composite primary keys.</p>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">3NF / BCNF (Third Normal Form)</span>
              <p className="text-[10px] text-slate-500">No transitive dependencies between non-key attributes.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
