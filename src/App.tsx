/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { InventoryView } from './components/views/InventoryView';
import { WarehousesView } from './components/views/WarehousesView';
import { OrdersView } from './components/views/OrdersView';
import { ReportsView } from './components/views/ReportsView';
import { AiAgentView } from './components/views/AiAgentView';
import { ArchitectureView } from './components/views/ArchitectureView';
import { TestsView } from './components/views/TestsView';
import { DatabaseView } from './components/views/DatabaseView';
import { LoginView } from './components/views/LoginView';
import { SecurityAuthView } from './components/views/SecurityAuthView';
import { BackendDesignView } from './components/views/BackendDesignView';
import { FrontendLabView } from './components/views/FrontendLabView';
import { MongoView } from './components/views/MongoView';
import { SqlView } from './components/views/SqlView';
import { RedisIntegrationView } from './components/views/RedisIntegrationView';

function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  const handleNavigateAi = (prompt: string) => {
    setAiInitialPrompt(prompt);
    setActiveTab('ai-agent');
  };

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Global Navbar */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Application Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Operations Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Active View Surface */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'inventory' && (
            <InventoryView onNavigateAi={handleNavigateAi} />
          )}
          {activeTab === 'warehouses' && (
            <WarehousesView />
          )}
          {activeTab === 'orders' && (
            <OrdersView />
          )}
          {activeTab === 'reports' && (
            <ReportsView />
          )}
          {activeTab === 'ai-agent' && (
            <AiAgentView initialPrompt={aiInitialPrompt} />
          )}
          {activeTab === 'security-auth' && (
            <SecurityAuthView />
          )}
          {activeTab === 'backend-design' && (
            <BackendDesignView />
          )}
          {activeTab === 'frontend-lab' && (
            <FrontendLabView />
          )}
          {activeTab === 'mongo-db' && (
            <MongoView />
          )}
          {activeTab === 'sql-db' && (
            <SqlView />
          )}
          {activeTab === 'redis-realtime' && (
            <RedisIntegrationView />
          )}
          {activeTab === 'tests' && (
            <TestsView />
          )}
          {activeTab === 'architecture' && (
            <ArchitectureView />
          )}
          {activeTab === 'database' && (
            <DatabaseView />
          )}
        </main>
      </div>

      {/* Global Operational Status Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 sm:px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="font-semibold text-slate-700">OmniStock WMS Cloud v2.4</span>
          <span>•</span>
          <span className="text-slate-500">Multi-Warehouse Fulfillment & Intelligent Logistics</span>
        </div>
        <div className="mt-1 sm:mt-0 font-mono text-[11px] text-slate-500">
          Active Hubs: Bengaluru (BLR-01), Mumbai (BOM-02), Delhi NCR (DEL-03), Hyderabad (HYD-04), Chennai (MAA-05), Pune (PNQ-06), Ahmedabad (AMD-07), Kolkata (CCU-08), Jaipur (JAI-09), Kochi (COK-10)
        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
