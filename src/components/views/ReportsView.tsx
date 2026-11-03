import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  BarChart3, 
  Clock, 
  Play, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';

export const ReportsView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringJobId, setTriggeringJobId] = useState<string | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, cronRes] = await Promise.all([
        api.getReportsSummary(),
        api.getCronJobs(),
      ]);
      setSummary(sumRes);
      setCronJobs(cronRes);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCron = async (jobId: string) => {
    setTriggeringJobId(jobId);
    try {
      const res = await api.triggerCronJob(jobId);
      setExecutionMessage(res.message);
      loadData();
    } catch (err: any) {
      setExecutionMessage(`Job error: ${err.message}`);
    } finally {
      setTriggeringJobId(null);
    }
  };

  const chartData = summary?.salesVelocityBySku?.map((s: any) => ({
    name: s.sku.replace('VAYU-', '').replace('AURA-', '').replace('MOK-', '').replace('KAV-', '').replace('ECO-', '').replace('IND-', ''),
    sku: s.sku,
    unitsSold: s.monthlyUnitsSold,
    daysOfSupply: s.daysOfSupply,
    revenue: s.monthlyRevenue,
  })) || [
    { name: 'PUR-001', unitsSold: 420, daysOfSupply: 32, revenue: 1889580 },
    { name: 'RING-01', unitsSold: 310, daysOfSupply: 18, revenue: 1859690 },
    { name: 'SER-KUM', unitsSold: 580, daysOfSupply: 45, revenue: 753420 },
    { name: 'DRN-BAT', unitsSold: 190, daysOfSupply: 12, revenue: 988000 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Automated Reports & Velocity Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated SKU velocity modeling, dead-stock audit flags, and scheduled cron jobs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(summary, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `wms-report-${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Executive PDF/JSON</span>
          </button>
        </div>
      </div>

      {executionMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{executionMessage}</span>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Total Catalog Valuation</span>
            <span className="font-bold text-sm text-green-600">₹</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">
            ₹{summary?.totalInventoryValuationUsd?.toLocaleString('en-IN') || '1,42,500'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 8 active SKU lines</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Stock Turn Ratio</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-700 font-mono">
            6.4x / yr
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Industry benchmark: 4.8x</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Dead Stock Exposure</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-700 font-mono">
            ₹{summary?.deadStockRiskValuationUsd?.toLocaleString('en-IN') || '11,200'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">&gt; 90 days without movement</p>
        </div>
      </div>

      {/* Recharts SKU Velocity & Demand Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">SKU Monthly Fulfillment Velocity vs Days of Supply</h2>
            <p className="text-xs text-slate-500">Identify fast-moving winners vs stockout replenishment emergencies</p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1.5 text-blue-600 font-medium">
              <span className="w-3 h-3 rounded bg-blue-600"></span>
              <span>Units Sold (Monthly)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-500 font-medium">
              <span className="w-3 h-3 rounded bg-slate-400"></span>
              <span>Days of Supply Remaining</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Bar dataKey="unitsSold" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="daysOfSupply" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Automated Scheduled Cron Jobs Executor */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Automated Scheduled WMS Cron Jobs</h2>
            <p className="text-xs text-slate-500">
              System tasks that execute periodic inventory sweeps, carrier tracking syncs, and financial audits.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
          {cronJobs.map((job) => (
            <div key={job.id} className="p-4 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{job.name}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {job.schedule}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{job.description}</p>
                <div className="flex items-center space-x-4 text-[10px] text-slate-400 pt-1">
                  <span>Last Run: <strong className="text-slate-700 font-mono">{job.lastRun}</strong></span>
                  <span>Next Run: <strong className="text-slate-700 font-mono">{job.nextRun}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleTriggerCron(job.id)}
                  disabled={triggeringJobId === job.id}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 fill-white ${triggeringJobId === job.id ? 'animate-spin' : ''}`} />
                  <span>{triggeringJobId === job.id ? 'Running...' : 'Run Now'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
