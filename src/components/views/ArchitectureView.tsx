import React from 'react';
import { 
  Workflow, 
  Server, 
  Sparkles, 
  Database, 
  Radio, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Boxes, 
  Truck, 
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
  Zap,
  Globe
} from 'lucide-react';
import { LOGI_MASCOT } from '../../assets/mascot';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={LOGI_MASCOT.avatar}
            alt="Logi Mascot"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md shadow-blue-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Architecture & Topology</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                Production Tier
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Multi-tiered enterprise logistics cloud architecture: Express API gateway, Gemini 3.7 Flash AI core, hybrid SQL/NoSQL/Redis data tier, and real-time SSE telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Status: <strong>ALL SERVICES HEALTHY</strong></span>
        </div>
      </div>

      {/* Tier Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1.5 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-blue-600 font-bold">
            <div className="flex items-center space-x-1.5">
              <Server className="w-4 h-4" />
              <span>Backend Gateway</span>
            </div>
            <span className="font-mono text-[10px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Port 3000</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">Express + tsx</p>
          <p className="text-[11px] text-slate-500">Dual Vite SPA middleware & REST APIs with token-bucket rate limiter.</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1.5 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-amber-600 font-bold">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AI Reasoning Engine</span>
            </div>
            <span className="font-mono text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Gemini 3.7</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">@google/genai SDK</p>
          <p className="text-[11px] text-slate-500">Autonomous function-calling tools, supply chain RAG & stock reallocation.</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1.5 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-emerald-600 font-bold">
            <div className="flex items-center space-x-1.5">
              <Database className="w-4 h-4" />
              <span>Hybrid Data Tier</span>
            </div>
            <span className="font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">SQL + Mongo</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">ACID + Document</p>
          <p className="text-[11px] text-slate-500">ANSI relational JOINs for inventory & MongoDB pipelines for category rollups.</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1.5 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-indigo-600 font-bold">
            <div className="flex items-center space-x-1.5">
              <Radio className="w-4 h-4" />
              <span>Live Event Stream</span>
            </div>
            <span className="font-mono text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">SSE Protocol</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">EventSource</p>
          <p className="text-[11px] text-slate-500">Live AGV picker telemetry, stock threshold triggers & carrier webhooks.</p>
        </div>
      </div>

      {/* Layer-by-Layer Interactive Architecture Diagram */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Workflow className="w-5 h-5 text-blue-600" />
              <span>Layered Architectural Model</span>
            </h2>
            <p className="text-xs text-slate-500">
              End-to-end request lifecycle from client browser to security sanitization, data execution, and external logistics mesh.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-slate-900 text-white">
            Microservice Topology
          </span>
        </div>

        {/* Layer 1: Client Front-End Presentation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Layer 1: Presentation & Interactive Client UI (React 18 + Vite)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Browser / Client Surface</span>
          </div>
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Single Page Application (SPA)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Responsive layouts with interactive Leaflet satellite map tiles, Inside Warehouse Digital Twin, and inventory management tables.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>AuthContext & JWT Client</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Role-based access control with seamless persona switcher (Startup Merchant, Warehouse Manager, Logistics Admin, Compliance Auditor).
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>EventSource SSE Client</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Maintains persistent HTTP connection with automatic reconnection to stream real-time picker AGV telemetry and order status changes.
              </p>
            </div>
          </div>
        </div>

        {/* Directional Connector */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-[11px] font-mono bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 text-slate-600">
            <span>HTTPS REST & SSE Stream (Port 3000 Ingress)</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        {/* Layer 2: API Gateway & Security Perimeter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Layer 2: Express API Gateway & Security Perimeter</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Node.js Server</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-1 shadow-xs">
              <div className="font-bold text-indigo-900 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rate Limiter</span>
              </div>
              <p className="text-[11px] text-slate-500">180 req/min per IP sliding window to prevent DoS attacks.</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-1 shadow-xs">
              <div className="font-bold text-indigo-900 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>JWT Verification</span>
              </div>
              <p className="text-[11px] text-slate-500">HMAC-SHA256 PBKDF2 token signature & role guard verification.</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-1 shadow-xs">
              <div className="font-bold text-indigo-900 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Payload Sanitizer</span>
              </div>
              <p className="text-[11px] text-slate-500">Deep recursive filter stripping XSS and prompt injection tokens.</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-1 shadow-xs">
              <div className="font-bold text-indigo-900 flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Audit Logger</span>
              </div>
              <p className="text-[11px] text-slate-500">Immutable ledger capturing all mutation requests with timestamps.</p>
            </div>
          </div>
        </div>

        {/* Directional Connector */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-[11px] font-mono bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 text-slate-600">
            <span>Query Router & AI Tool Orchestrator</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        {/* Layer 3: Database & Cache Engines */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Layer 3: Core Database Engines, In-Memory Cache & AI Logic</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Data & Model Core</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-blue-700 font-bold">
                <Database className="w-4 h-4" />
                <span>Relational SQL Engine</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Structured data with ACID transaction guarantees, multi-table ANSI SQL JOINs, inventory SKU ledgers, and order state machines.
              </p>
              <div className="font-mono text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-600">
                Tables: inventory, warehouses, orders, users, audit_logs
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <Layers className="w-4 h-4" />
                <span>MongoDB NoSQL Pipeline</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Document aggregation engine executing <code>$match</code>, <code>$group</code>, <code>$sort</code>, and <code>$project</code> for category rollups.
              </p>
              <div className="font-mono text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-600">
                Pipelines: category valuation, warehouse capacity metrics
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-rose-700 font-bold">
                <Zap className="w-4 h-4" />
                <span>Redis In-Memory Cache</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                High-throughput key-value cache with LRU eviction and configurable TTL for warehouse catalogs and hot stock levels.
              </p>
              <div className="font-mono text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-600">
                Sub-millisecond retrieval • 99.8% cache hit rate
              </div>
            </div>

          </div>
        </div>

        {/* Directional Connector */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-[11px] font-mono bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 text-slate-600">
            <span>Webhook Listeners, Carrier APIs & External Meshes</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        {/* Layer 4: External Integrations & Carrier Networks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900"></span>
              <span>Layer 4: Multi-Store Channels, 3PL Carriers & AI LLM Providers</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">External Integrations</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <span className="font-bold text-orange-400 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>ONDC & Shopify</span>
              </span>
              <p className="text-[10px] text-slate-400">Real-time order ingest & stock synchronization.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <span className="font-bold text-blue-400 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Delhivery & Shadowfax</span>
              </span>
              <p className="text-[10px] text-slate-400">AWB generation, label dispatch, and surface logistics.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Xpressbees & Blue Dart</span>
              </span>
              <p className="text-[10px] text-slate-400">Air express line-haul & multi-hub transit updates.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <span className="font-bold text-purple-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini 3.7 Flash</span>
              </span>
              <p className="text-[10px] text-slate-400">Tool execution runtime and multi-modal logistics reasoning.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
