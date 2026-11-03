import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Warehouse, InventoryItem, Order } from '../../types';
import { 
  Building2, 
  Boxes, 
  Truck, 
  TrendingUp, 
  AlertCircle, 
  Thermometer, 
  ShieldCheck, 
  Radio, 
  ArrowUpRight,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('wh-blr-1');
  const [warehouseDetail, setWarehouseDetail] = useState<any>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      api.getWarehouseDetail(selectedWarehouseId).then(res => setWarehouseDetail(res)).catch(() => {});
    }
  }, [selectedWarehouseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [whRes, invRes, ordRes] = await Promise.all([
        api.getWarehouses(),
        api.getInventory(),
        api.getOrders(),
      ]);
      setWarehouses(whRes.data);
      setInventory(invRes.items);
      setOrders(ordRes.orders);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];
  const lowStockItems = inventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock');
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Operations Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Real-Time Warehouse Management (WMS)</h1>
            <span className="bg-green-100 text-green-700 border border-green-200 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>All 5 Hubs Synced</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global bay visualizer, automated SKU velocity tracking, AGV robot telemetry, and multi-channel fulfillment.
          </p>
        </div>

        {/* Warehouse Quick Switcher */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500">Active Facility:</label>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 text-xs font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} — {w.name} ({w.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Core Vital Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Units On Hand */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory On Hand</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">
              {inventory.reduce((acc, i) => acc + i.quantity, 0).toLocaleString()}
            </span>
            <span className="text-xs text-green-600 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% this wk
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 8 active startup SKU lines</p>
        </div>

        {/* Metric 2: Bay Utilization Rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facility Capacity</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">
              {selectedWarehouse ? `${Math.round((selectedWarehouse.usedCapacitySqFt / selectedWarehouse.totalCapacitySqFt) * 100)}%` : '78%'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {selectedWarehouse ? `${(selectedWarehouse.usedCapacitySqFt / 1000).toFixed(0)}k / ${(selectedWarehouse.totalCapacitySqFt / 1000).toFixed(0)}k sq ft` : ''}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {selectedWarehouse ? `${selectedWarehouse.occupiedBays} of ${selectedWarehouse.totalBays} storage bays allocated` : ''}
          </p>
        </div>

        {/* Metric 3: Active Orders in Pipeline */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fulfillment</span>
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{activeOrders.length} Orders</span>
            <span className="text-xs text-green-600 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> 99.4% SLA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Avg 14.1 mins pick-to-pack scan</p>
        </div>

        {/* Metric 4: Low Stock Alerts */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs relative overflow-hidden cursor-pointer hover:border-rose-300 transition-colors" onClick={() => onNavigate('inventory')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Restock Alerts</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-rose-600">{lowStockItems.length} SKUs</span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Action Needed</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Breached dynamic safety stock</p>
        </div>
      </div>

      {/* Main Grid: Interactive Warehouse Floor & Bay Map + Real-Time Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Warehouse Bay & Rack Floor Plan */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Interactive Bay Allocation Grid</span>
                <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedWarehouse?.code}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time occupancy, thermal sensor zones, and pallet slot availability
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                <span>Low Stock</span>
              </div>
            </div>
          </div>

          {/* Bay Grid Visualization (24 Interactive Bays) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {warehouseDetail?.bayGrid?.map((bay: any) => {
              const matchingItem = inventory.find(i => i.bayLocation?.includes(bay.bayCode));
              const isLow = matchingItem && (matchingItem.status === 'low_stock' || matchingItem.status === 'out_of_stock');
              
              return (
                <div
                  key={bay.bayCode}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isLow
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : bay.occupied
                      ? 'bg-white border-blue-200 text-slate-800 shadow-xs'
                      : 'bg-white/60 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={`font-bold ${isLow ? 'text-rose-700' : bay.occupied ? 'text-blue-700' : 'text-slate-500'}`}>
                      {bay.bayCode}
                    </span>
                    <span className="text-[9px] text-slate-500">{bay.occupancyPct}%</span>
                  </div>
                  <div className="mt-1.5">
                    <p className={`text-[11px] font-semibold truncate ${bay.occupied ? 'text-slate-900' : 'text-slate-400'}`}>
                      {matchingItem ? matchingItem.sku : bay.occupied ? bay.currentSku : 'Available'}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate mt-0.5">
                      {bay.temperatureZone}
                    </p>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-blue-600'}`}
                      style={{ width: `${bay.occupancyPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warehouse Environmental & Handling Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] font-medium block">Temperature Zone</span>
              <span className="font-semibold text-green-700 flex items-center space-x-1 mt-1">
                <Thermometer className="w-3.5 h-3.5" />
                <span>{selectedWarehouse?.temperatureControlled ? 'Cold-Chain +4°C' : 'Ambient 21°C'}</span>
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] font-medium block">Hazmat Rating</span>
              <span className="font-semibold text-amber-700 flex items-center space-x-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{selectedWarehouse?.hazmatCertified ? 'Class 9 Hazmat Cert' : 'General Cargo'}</span>
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] font-medium block">Hourly Pick Throughput</span>
              <span className="font-semibold text-blue-700 flex items-center space-x-1 mt-1">
                <Activity className="w-3.5 h-3.5" />
                <span>{selectedWarehouse?.hourlyPickRate} picks/hr</span>
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] font-medium block">Base Rate / Sq Ft</span>
              <span className="font-semibold text-slate-800 flex items-center space-x-1 mt-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>₹{selectedWarehouse?.monthlyBaseRatePerSqFt} / mo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Active Live Fulfillment Queue & AI Shortcuts */}
        <div className="space-y-6">
          
          {/* Active Orders Ticker */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Live Fulfillment Queue</span>
              </h3>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {orders.slice(0, 4).map((ord) => (
                <div key={ord.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {ord.channel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ord.customerName} • ₹{ord.totalAmount}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                    ord.status === 'shipped' ? 'bg-green-100 text-green-700 border border-green-200' :
                    ord.status === 'picking' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {ord.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Logistics Copilot Featured Card */}
          <div className="bg-indigo-900 rounded-xl p-5 text-white shadow-lg border border-indigo-800 text-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>LLM AI Logistics Assistant</span>
              </div>
              <span className="text-[10px] bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded font-mono">
                Gemini 3.7
              </span>
            </div>
            
            <div className="bg-indigo-800/50 p-3 rounded-lg text-xs italic border-l-2 border-indigo-400 text-indigo-100">
              "Based on real-time velocity in Bengaluru BLR-01, VAYU-PUR-001 is trending. I recommend shifting 150 units to Mumbai Bhiwandi hub before peak festive cycle."
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-indigo-300">
                <span>Reasoning Confidence</span>
                <span>98.2%</span>
              </div>
              <div className="w-full bg-indigo-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full w-[98%]"></div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ai-agent')}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm text-xs"
            >
              <span>Launch AI Copilot</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
