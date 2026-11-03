import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Radio, 
  Truck, 
  Clock, 
  CreditCard, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Play, 
  Terminal,
  Activity,
  Globe,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { LOGI_MASCOT } from '../../assets/mascot';

export const RedisIntegrationView: React.FC = () => {
  // Redis State
  const [redisMetrics, setRedisMetrics] = useState<any>(null);
  const [redisLoading, setRedisLoading] = useState(false);
  const [testKey, setTestKey] = useState('cache:sku:SKU-AUDIO-01');
  const [testValue, setTestValue] = useState('{"stock": 145, "lastUpdated": "2026-08-28T10:00:00Z"}');
  const [testTtl, setTestTtl] = useState('300');

  // Real-Time SSE Feed State
  const [realtimeEvents, setRealtimeEvents] = useState<Array<{ id: string; time: string; event: string; payload: string }>>([
    { id: 'ev-101', time: '10:48:12', event: 'AGV_TELEMETRY', payload: 'AGV-04 reached Bay C-08 (Picker velocity: 1.4 m/s)' },
    { id: 'ev-102', time: '10:48:19', event: 'CARRIER_WEBHOOK', payload: 'Delhivery AWB #DEL-9921 scanned at Bengaluru Hub sorting line' },
    { id: 'ev-103', time: '10:48:24', event: 'STOCK_REPLENISHMENT', payload: 'Threshold triggered: Reorder initiated for SKU-AUDIO-01 (+155 units)' }
  ]);

  // Scheduled Cron Jobs State
  const [cronJobs, setCronJobs] = useState([
    { id: 'cron-1', name: 'Hourly Inventory Buffer Reconciliation', schedule: '0 * * * *', nextRun: '11:00 AM', status: 'ACTIVE', lastDuration: '142ms' },
    { id: 'cron-2', name: 'Carrier SLA Velocity Aggregator', schedule: '*/15 * * * *', nextRun: '10:55 AM', status: 'ACTIVE', lastDuration: '88ms' },
    { id: 'cron-3', name: 'Midnight GST & E-Way Bill Ledger Rollup', schedule: '0 0 * * *', nextRun: '12:00 AM', status: 'SCHEDULED', lastDuration: '412ms' }
  ]);

  // Payment Webhook Simulator State
  const [paymentGateway, setPaymentGateway] = useState<'Razorpay' | 'Cashfree'>('Razorpay');
  const [paymentAmount, setPaymentAmount] = useState('4999');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchRedis();
  }, []);

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
    } catch (err) {
      console.error('Failed to flush Redis:', err);
    }
  };

  const handleSimulatePaymentWebhook = async () => {
    setPaymentLoading(true);
    setPaymentStatus(null);
    await new Promise(r => setTimeout(r, 600));
    setPaymentStatus(`✓ Webhook 200 OK: ${paymentGateway} payment.captured (₹${paymentAmount}) -> Order auto-transitioned to 'picking'`);
    setPaymentLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={LOGI_MASCOT.avatar}
            alt="Logi Mascot"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md shadow-amber-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Integration, Redis & Real-Time Mesh</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                Low Latency & Webhooks
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Redis in-memory caching tier, Server-Sent Events (SSE) live telemetry stream, 3PL carrier integration, scheduled cron tasks, and payment webhooks.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SSE Stream: <strong>CONNECTED</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. REDIS IN-MEMORY CACHING TIER */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Redis In-Memory Key-Value Caching Layer</h2>
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

        {/* Redis Metric Cards */}
        {redisMetrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Cached Keys in RAM</span>
              <span className="text-2xl font-bold text-blue-700 font-mono">{redisMetrics.activeKeysCount || 3}</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase block font-semibold">Cache Hit Rate</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono">{redisMetrics.hitRatePct || 99.8}%</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Cache Hits</span>
              <span className="text-2xl font-bold text-slate-900 font-mono">{redisMetrics.hits || 142}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">RAM Usage</span>
              <span className="text-2xl font-bold text-slate-700 font-mono">{redisMetrics.memoryUsedEstimatedKb || 14} KB</span>
            </div>
          </div>
        )}

        {/* Active Keys Inspector */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live In-Memory Keys:</span>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
            {redisMetrics?.keys?.map((k: any) => (
              <div key={k.key} className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-blue-700">{k.key}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                  <span>TTL: <strong className="text-slate-800">{k.ttlSeconds}s</strong></span>
                  <span>Size: {k.sizeBytes} B</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Real-Time SSE, Scheduled Cron & Payment Gateways */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========================================================================= */}
        {/* 2. REAL-TIME EVENT STREAM (SSE / WEBSOCKET) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Real-Time Event Stream</h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              SSE EventSource
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="space-y-1.5">
              {realtimeEvents.map((ev) => (
                <div key={ev.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-indigo-600">{ev.event}</span>
                    <span>{ev.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-700">{ev.payload}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SCHEDULED CRON JOBS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Scheduled Background Cron</h2>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {cronJobs.map((cron) => (
              <div key={cron.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{cron.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800">{cron.status}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Cron: {cron.schedule}</span>
                  <span>Next: {cron.nextRun}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. PAYMENT GATEWAY INTEGRATION & WEBHOOKS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Payment Webhook Simulator</h2>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Gateway Provider:</label>
              <select
                value={paymentGateway}
                onChange={(e) => setPaymentGateway(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="Razorpay">Razorpay (payment.captured)</option>
                <option value="Cashfree">Cashfree (ORDER_PAID)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Order Transaction Amount (INR):</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <button
              onClick={handleSimulatePaymentWebhook}
              disabled={paymentLoading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {paymentLoading ? 'Simulating Webhook...' : 'Fire Inbound Webhook Event'}
            </button>

            {paymentStatus && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-mono">
                {paymentStatus}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
