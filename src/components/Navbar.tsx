import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Bell, 
  Zap, 
  Sparkles, 
  Radio, 
  X, 
  Layers, 
  Lock,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const { user, switchRole, logout, liveEvents, unreadEventCount, clearUnreadEvents } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'STARTUP_MERCHANT', title: 'Startup Merchant', desc: 'Manage inventory, place orders & book warehouse space' },
    { role: 'WAREHOUSE_MANAGER', title: 'Warehouse Manager', desc: 'Bay allocations, pick-and-pack queues, physical counts' },
    { role: 'ADMIN', title: 'Global Logistics Admin', desc: 'System configuration, billing, security & multi-hub SLAs' },
    { role: 'OPERATIONS_AUDITOR', title: 'Compliance Auditor', desc: 'Hazmat protocols, ISO 9001 logs, customs compliance' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Platform Identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                OmniStock
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                WMS Core
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Startup Fulfillment & Logistics Cloud</p>
          </div>
        </div>

        {/* Live Network Telemetry Badge */}
        <div className="hidden lg:flex items-center space-x-4 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 text-green-700 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>BLR-01 & BHW-02 Live</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1 text-slate-600">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>AGV Auto-Pick Active</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-500 font-mono text-[11px]">
            Sync: <span className="text-green-600 font-semibold">99.98%</span>
          </div>
        </div>

        {/* Action Controls & User Switcher */}
        <div className="flex items-center space-x-2.5">
          
          {/* AI Intelligence Quick Button */}
          <button
            onClick={() => onSelectTab('ai-agent')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeTab === 'ai-agent'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span className="hidden sm:inline">AI Copilot</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Live Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                clearUnreadEvents();
              }}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 relative transition-colors"
              title="Live Warehouse Telemetry Feed"
            >
              <Bell className="w-4 h-4" />
              {unreadEventCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white animate-bounce">
                  {unreadEventCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-green-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Real-Time Events</span>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                  {liveEvents.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center">No recent telemetry events</p>
                  ) : (
                    liveEvents.map((evt) => (
                      <div key={evt.id} className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-mono font-semibold text-blue-600">{evt.type}</span>
                          <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">{evt.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher & Account Selector */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <div className="text-left hidden md:block">
                  <p className="text-slate-800 font-semibold leading-tight">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">{user?.role?.replace('_', ' ')}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Switcher Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 space-y-1">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Active Session: {user.email}</span>
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between ${
                        user?.role === r.role ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{r.title}</p>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{r.desc}</p>
                      </div>
                      {user?.role === r.role && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                    </button>
                  ))}
                  
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-end px-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                      }}
                      className="text-xs text-rose-600 font-semibold p-1.5 hover:underline flex items-center space-x-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

        </div>
      </div>
    </header>
  );
};

