import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Building,
  Truck,
  BarChart3,
  Bot,
  Database,
  ShieldCheck,
  Server,
  Code,
  Layers,
  Table,
  Radio,
  Building2,
  Globe,
  MapPin,
  Workflow,
  CheckCircle2,
} from 'lucide-react';
import { LOGI_MASCOT } from '../assets/mascot';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const operationsItems = [
    {
      id: 'dashboard',
      label: 'Live Warehouse WMS',
      desc: 'Bay layout & real-time floor',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      id: 'warehouses',
      label: 'Satellite Map & Hubs',
      desc: 'Live map, digital twin & RFP',
      icon: Globe,
      badge: '10 Hubs',
    },
    {
      id: 'inventory',
      label: 'Inventory & SKUs',
      desc: 'Stock levels & cycle counts',
      icon: Boxes,
      badge: '8 Active',
    },
    {
      id: 'orders',
      label: 'Orders & Tracking',
      desc: 'Fulfillment & carrier transit',
      icon: Truck,
      badge: 'Real-time',
    },
    {
      id: 'reports',
      label: 'Automated Reports',
      desc: 'Velocity analytics & cron jobs',
      icon: BarChart3,
      badge: 'Cron',
    },
    {
      id: 'ai-agent',
      label: 'AI Logistics Copilot',
      desc: 'Gemini RAG & multi-step tools',
      icon: Bot,
      badge: '3.7 Flash',
    },
  ];

  const engineeringItems = [
    {
      id: 'security-auth',
      label: 'Auth & Security',
      desc: 'JWT, PBKDF2, RBAC & injection',
      icon: ShieldCheck,
      badge: 'Zero-Trust',
    },
    {
      id: 'backend-design',
      label: 'Backend & APIs',
      desc: 'REST, middleware & uploads',
      icon: Server,
      badge: 'Port 3000',
    },
    {
      id: 'frontend-lab',
      label: 'Frontend & JS Lab',
      desc: 'Event loop, closures & forms',
      icon: Code,
      badge: 'React 18',
    },
    {
      id: 'mongo-db',
      label: 'NoSQL — MongoDB',
      desc: 'Pipelines, CRUD & explain',
      icon: Layers,
      badge: 'Document',
    },
    {
      id: 'sql-db',
      label: 'SQL — PostgreSQL',
      desc: 'JOINs, PK/FK & ACID tx',
      icon: Table,
      badge: 'ANSI SQL',
    },
    {
      id: 'redis-realtime',
      label: 'Redis & Real-Time',
      desc: 'Cache, SSE stream & webhooks',
      icon: Radio,
      badge: 'Sub-ms',
    },
    {
      id: 'tests',
      label: 'Automated Tests',
      desc: '10 Unit & integration tests',
      icon: CheckCircle2,
      badge: '10/10 Pass',
    },
    {
      id: 'architecture',
      label: 'System Topology',
      desc: 'Layered architecture model',
      icon: Workflow,
      badge: 'Topology',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 p-3 flex flex-col justify-between shrink-0 max-h-screen overflow-y-auto">
      <div className="space-y-4">
        {/* Category 1: WMS & Operations */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            WMS Operations & Logistics
          </div>
          {operationsItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-500 group-hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category 2: Engineering & System Modules */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Engineering & Systems Lab
          </div>
          {engineeringItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-500 group-hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-3 pt-2 border-t border-slate-100">
        {/* Mascot Logistics Guide Widget */}
        <div 
          onClick={() => onSelectTab('warehouses')}
          className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 p-2.5 rounded-2xl flex items-center space-x-3 cursor-pointer hover:border-orange-300 transition-all shadow-xs group"
        >
          <img
            src={LOGI_MASCOT.avatar}
            alt="Logi Mascot"
            className="w-9 h-9 rounded-xl object-cover border border-orange-300 shadow-xs group-hover:scale-105 transition-transform"
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-orange-950">Logi Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-orange-800 line-clamp-1">Explore satellite map & hubs!</p>
          </div>
        </div>

        {/* System Status Footer Card */}
        <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="font-semibold text-white">Pan-India Mesh</span>
            </span>
            <span className="font-mono text-green-400 text-[10px]">10 Hubs Online</span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Ingress Port:</span>
              <span className="text-slate-200 font-mono">3000 (Express + tsx)</span>
            </div>
            <div className="flex justify-between">
              <span>Security Tier:</span>
              <span className="text-emerald-400 font-mono">RBAC + PBKDF2</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
