import React, { useState, useEffect } from 'react';
import { Warehouse, InventoryItem } from '../../types';
import { LOGI_MASCOT } from '../../assets/mascot';
import { 
  X, 
  Layers, 
  Thermometer, 
  ShieldCheck, 
  Cpu, 
  Truck, 
  Box, 
  Radio, 
  CheckCircle2, 
  Activity, 
  Eye, 
  Flame, 
  Snowflake, 
  Sparkles,
  Zap,
  Maximize2,
  Minimize2,
  Camera,
  RefreshCw,
  Info,
  Sliders
} from 'lucide-react';

interface InsideWarehouseModalProps {
  warehouse: Warehouse;
  onClose: () => void;
  onBookSpace?: (wh: Warehouse) => void;
  inventory?: InventoryItem[];
}

interface WarehouseZone {
  id: string;
  name: string;
  code: string;
  type: 'racks' | 'cold_chain' | 'agv_zone' | 'inbound' | 'outbound' | 'hazmat';
  capacityPct: number;
  temperature?: string;
  humidity?: string;
  description: string;
  mascotTip: string;
  bays: Array<{
    id: string;
    label: string;
    sku?: string;
    productName?: string;
    units: number;
    maxUnits: number;
    category: string;
    status: 'optimal' | 'full' | 'low' | 'quarantine';
  }>;
}

export const InsideWarehouseModal: React.FC<InsideWarehouseModalProps> = ({
  warehouse,
  onClose,
  onBookSpace,
  inventory = [],
}) => {
  const [activeZoneId, setActiveZoneId] = useState<string>('zone-a');
  const [selectedBay, setSelectedBay] = useState<any>(null);
  const [cctvMode, setCctvMode] = useState<boolean>(false);
  const [thermalMode, setThermalMode] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [agvActiveIndex, setAgvActiveIndex] = useState<number>(0);
  const [mascotBubbleOpen, setMascotBubbleOpen] = useState<boolean>(true);
  const [mascotVoiceAction, setMascotVoiceAction] = useState<string>('scanning');

  // Filter matching inventory for this warehouse
  const whInventory = inventory.filter(i => i.warehouseCode === warehouse.code || i.warehouseId === warehouse.id);

  // Generate dynamic zones based on warehouse capabilities
  const zones: WarehouseZone[] = [
    {
      id: 'zone-a',
      name: 'Zone A: High-Density Automated Pallet Racks (ASRS)',
      code: 'RACK-A',
      type: 'racks',
      capacityPct: 88,
      temperature: '21.4°C (Ambient)',
      humidity: '46% RH',
      description: 'Vertical 6-tier motorized pallet racking with optical barcode telemetry and automated bin locators.',
      mascotTip: `Beep boop! This is Zone A where we store fast-moving electronics and consumer products. AGV tracks run directly through aisles 1 to 6!`,
      bays: [
        { id: 'A1-R01', label: 'Bay A1-R01', sku: 'VAYU-PUR-001', productName: 'VayuAir HEPA Pro Smart Air Purifier', units: 320, maxUnits: 350, category: 'Electronics', status: 'optimal' },
        { id: 'A1-R02', label: 'Bay A1-R02', sku: 'AURA-RING-01', productName: 'AuraSmart Titanium Sleep Ring', units: 140, maxUnits: 200, category: 'Electronics', status: 'optimal' },
        { id: 'A2-R01', label: 'Bay A2-R01', sku: 'ECO-MAT-IND', productName: 'EcoStride Natural Cork Yoga Mat', units: 410, maxUnits: 450, category: 'Apparel', status: 'optimal' },
        { id: 'A2-R02', label: 'Bay A2-R02', sku: 'NEX-FIT-02', productName: 'NexFit AMOLED Smart Fitness Tracker', units: 85, maxUnits: 300, category: 'Electronics', status: 'low' },
        { id: 'A3-R01', label: 'Bay A3-R01', sku: 'IND-MUG-001', productName: 'ChaiCraft Ceramic Double-Walled Tumbler', units: 520, maxUnits: 550, category: 'Industrial & Hardware', status: 'optimal' },
        { id: 'A3-R02', label: 'Bay A3-R02', sku: 'VOLT-CBL-IND', productName: 'VoltLink 100W Braided SuperCable', units: 620, maxUnits: 650, category: 'Electronics', status: 'full' },
      ],
    },
    {
      id: 'zone-b',
      name: 'Zone B: FSSAI Certified Cold-Chain Cryo-Vault',
      code: 'COLD-B',
      type: 'cold_chain',
      capacityPct: 74,
      temperature: '+4.2°C (Cold-Chain)',
      humidity: '58% RH',
      description: 'Dual-redundant chill chambers engineered for Ayurvedic serologicals, probiotic beverages, and temperature-sensitive cosmetics.',
      mascotTip: `Brrr! Welcome to Zone B! I keep the temperature locked at +4°C with automated excursion alerts to protect certified serums and organics.`,
      bays: [
        { id: 'B1-C01', label: 'Bay B1-C01', sku: 'MOK-SER-KUM', productName: 'Moksha Kumkumadi Saffron Night Elixir 30ml', units: 580, maxUnits: 700, category: 'Health & Beauty', status: 'optimal' },
        { id: 'B1-C02', label: 'Bay B1-C02', sku: 'MOK-HYA-50ML', productName: 'Moksha Pure Vedic Hyaluronic Gel', units: 430, maxUnits: 600, category: 'Health & Beauty', status: 'optimal' },
        { id: 'B2-C01', label: 'Bay B2-C01', sku: 'PRA-PRO-BEV', productName: 'PranaKombucha Live Probiotic Tonic', units: 280, maxUnits: 400, category: 'Beverages & Food', status: 'optimal' },
        { id: 'B2-C02', label: 'Bay B2-C02', sku: 'VED-OIL-100', productName: 'VedicCold Ayurvedic Scalp Nectar', units: 190, maxUnits: 300, category: 'Health & Beauty', status: 'optimal' },
      ],
    },
    {
      id: 'zone-c',
      name: 'Zone C: Autonomous Mobile Robot (AGV) Sortation Hub',
      code: 'ROBO-C',
      type: 'agv_zone',
      capacityPct: 92,
      temperature: '22.0°C (Controlled)',
      humidity: '42% RH',
      description: 'Fleet of 16 LiDAR-guided AGVs moving at 2.4 m/s for instant bin-to-packer parcel sorting with 99.98% pick accuracy.',
      mascotTip: `This is my home playground! My robotic buddies are navigating LiDAR grid lines, carrying pick bins to the packing stations in under 90 seconds!`,
      bays: [
        { id: 'C1-AGV1', label: 'AGV Station 01', sku: 'AUTO-SORT', productName: 'High-Speed Cross-Belt Sorter 01', units: 48, maxUnits: 50, category: 'Industrial & Hardware', status: 'optimal' },
        { id: 'C1-AGV2', label: 'AGV Station 02', sku: 'AUTO-SORT', productName: 'High-Speed Cross-Belt Sorter 02', units: 45, maxUnits: 50, category: 'Industrial & Hardware', status: 'optimal' },
        { id: 'C2-CHRG', label: 'RoboCharge Bay', sku: 'SYS-PWR', productName: 'Inductive Fast-Charge Dock (8 Docks)', units: 8, maxUnits: 8, category: 'Industrial & Hardware', status: 'optimal' },
        { id: 'C2-QCTR', label: 'QA Dimensioner', sku: '3D-SCAN', productName: 'Optical Weigh-and-Scan Arch 04', units: 1, maxUnits: 1, category: 'Industrial & Hardware', status: 'optimal' },
      ],
    },
    {
      id: 'zone-d',
      name: 'Zone D: Inbound Receiving Dock & Optical QA Arch',
      code: 'INB-D',
      type: 'inbound',
      capacityPct: 65,
      temperature: 'Ambient',
      humidity: '48% RH',
      description: '4 hydraulic loading bays equipped with dynamic conveyor scans, pallet weighbridges, and instantaneous ERP lot creation.',
      mascotTip: `Incoming stock arrives here! We scan container QR codes, verify purchase orders, and generate lot numbers before moving to racking.`,
      bays: [
        { id: 'D1-DK01', label: 'Inbound Dock 01', sku: 'TRUCK-IN', productName: 'Container Unloading Bay #01 (Active)', units: 12, maxUnits: 20, category: 'Industrial & Hardware', status: 'optimal' },
        { id: 'D1-DK02', label: 'Inbound Dock 02', sku: 'TRUCK-IN', productName: 'Domestic LTL Trailer Bay #02', units: 8, maxUnits: 20, category: 'Industrial & Hardware', status: 'optimal' },
        { id: 'D2-STG1', label: 'QA Staging Bay', sku: 'STAGE-LOT', productName: 'Quarantine & Batch Verification Zone', units: 4, maxUnits: 15, category: 'Industrial & Hardware', status: 'optimal' },
      ],
    },
    {
      id: 'zone-e',
      name: 'Zone E: Multi-Carrier Fast-Pack & Express Handover',
      code: 'OUT-E',
      type: 'outbound',
      capacityPct: 95,
      temperature: 'Ambient',
      humidity: '45% RH',
      description: '12 ergonomic automated packaging stations with tamper-evident barcoded security tape and dedicated carrier chutes for Delhivery, Blue Dart & Shadowfax.',
      mascotTip: `Orders get packed and labeled here! Ready for same-day cutoff dispatch with direct carrier API tracking manifests!`,
      bays: [
        { id: 'E1-DLV', label: 'Delhivery Surface Chute', sku: 'CARRIER-OUT', productName: 'Pallet Staging #01 (Delhivery 18:30 SLA)', units: 140, maxUnits: 150, category: 'Industrial & Hardware', status: 'optimal' },
        { id: 'E1-BLU', label: 'Blue Dart Air Priority', sku: 'CARRIER-OUT', productName: 'Next Flight Out Air Staging #02', units: 88, maxUnits: 100, category: 'Industrial & Hardware', status: 'optimal' },
        { id: 'E2-SHD', label: 'Shadowfax D2C Hyperlocal', sku: 'CARRIER-OUT', productName: 'QuickCommerce Same-Day Chute #03', units: 62, maxUnits: 80, category: 'Industrial & Hardware', status: 'optimal' },
      ],
    },
    {
      id: 'zone-f',
      name: 'Zone F: DGCA / IATA Hazmat & Drone Battery Containment',
      code: 'HAZ-F',
      type: 'hazmat',
      capacityPct: 58,
      temperature: '19.0°C (FM-200 Fire Sup)',
      humidity: '38% RH',
      description: 'Reinforced Class 4 fire-suppressed vault equipped with thermal surveillance and isolated explosion-proof storage for Li-Po drone batteries.',
      mascotTip: `Safety first! Zone F is our Class 4 Hazmat Vault with FM-200 clean-agent fire suppression for drone batteries and EV components.`,
      bays: [
        { id: 'F1-BAT01', label: 'Hazmat Bay F1', sku: 'KAV-DRN-BAT', productName: 'Kavach Sentinel Drone 120Wh Li-Po Battery Pack', units: 190, maxUnits: 300, category: 'Electronics', status: 'optimal' },
        { id: 'F1-BAT02', label: 'Hazmat Bay F2', sku: 'KAV-ESC-4IN1', productName: 'Kavach High-Amp ESC Flight Controller Board', units: 145, maxUnits: 250, category: 'Electronics', status: 'optimal' },
        { id: 'F2-ISO01', label: 'Hazmat Quarantine', sku: 'HAZ-QUAR', productName: 'State of Charge (SoC ≤30%) Verification Bay', units: 15, maxUnits: 50, category: 'Industrial & Hardware', status: 'optimal' },
      ],
    },
  ];

  const currentZone = zones.find(z => z.id === activeZoneId) || zones[0];

  // AGV animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setAgvActiveIndex(prev => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const occupancy = Math.round((warehouse.usedCapacitySqFt / warehouse.totalCapacitySqFt) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 sm:px-6 flex items-center justify-between flex-wrap gap-3">
          
          <div className="flex items-center space-x-3">
            {/* Mascot Avatar Icon */}
            <div className="relative group">
              <img
                src={LOGI_MASCOT.avatar}
                alt="Logi Mascot"
                className="w-10 h-10 rounded-xl object-cover border-2 border-orange-500 shadow-md shadow-orange-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded">
                  {warehouse.code} DIGITAL TWIN
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live Telemetry Active</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>{warehouse.name}</span>
                <span className="text-xs text-slate-400 font-normal hidden sm:inline">• Inside View & Bay Map</span>
              </h2>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Vision Toggles */}
            <button
              onClick={() => setThermalMode(!thermalMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                thermalMode 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Toggle Thermal Heatmap View"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thermal Mode</span>
            </button>

            <button
              onClick={() => setCctvMode(!cctvMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                cctvMode 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Toggle CCTV Optical Sensor Feed"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CCTV Cam</span>
            </button>

            {onBookSpace && (
              <button
                onClick={() => onBookSpace(warehouse)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center space-x-1"
              >
                <span>Reserve Bay</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mascot Banner Callout */}
        <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-blue-950/40 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={LOGI_MASCOT.avatar}
              alt="Logi Mascot Guide"
              className="w-8 h-8 rounded-lg object-cover border border-orange-500/50 shrink-0"
            />
            <div className="text-xs text-slate-200">
              <span className="font-bold text-orange-400 mr-1.5">Logi (AI Logistics Guide):</span>
              <span className="italic">{currentZone.mascotTip}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden md:inline">
            Telemetry Feed: 30 FPS • WebSocket Synced
          </span>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Quick Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Footprint</span>
              <span className="text-sm font-bold text-white font-mono">{warehouse.totalCapacitySqFt.toLocaleString()} sq ft</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Capacity Utilization</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-emerald-400 font-mono">{occupancy}%</span>
                <span className="text-[10px] text-slate-400">({warehouse.occupiedBays}/{warehouse.totalBays} Bays)</span>
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Zone Temp</span>
              <span className="text-sm font-bold text-cyan-300 font-mono flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentZone.temperature}</span>
              </span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Zone Humidity</span>
              <span className="text-sm font-bold text-indigo-300 font-mono">{currentZone.humidity}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Autonomous AGVs</span>
              <span className="text-sm font-bold text-amber-400 font-mono flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>14 Active / 2 Docked</span>
              </span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Hourly Pick Rate</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{warehouse.hourlyPickRate} units/hr</span>
            </div>
          </div>

          {/* Interactive Zone Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            {zones.map((zone) => {
              const isActive = zone.id === activeZoneId;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setActiveZoneId(zone.id);
                    setSelectedBay(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-2 border ${
                    isActive
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{zone.code}</span>
                  <span className="text-[10px] opacity-75 font-normal">({zone.bays.length} bays)</span>
                </button>
              );
            })}
          </div>

          {/* Floorplan Visual Stage */}
          <div className={`relative border rounded-2xl overflow-hidden transition-all duration-300 ${
            thermalMode 
              ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-orange-950 border-amber-500/50' 
              : cctvMode
              ? 'bg-emerald-950/40 border-emerald-500/50 font-mono'
              : 'bg-slate-950 border-slate-800'
          }`}>
            
            {/* Overlay indicators */}
            <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-slate-900/90 border border-slate-700 rounded-lg text-[10px] font-mono text-emerald-400 flex items-center space-x-1.5">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>GRID: {currentZone.code}</span>
              </span>
              {thermalMode && (
                <span className="px-2.5 py-1 bg-amber-500/90 text-slate-950 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1">
                  <Flame className="w-3 h-3" />
                  <span>FLIR THERMAL 8.4μm - 14μm</span>
                </span>
              )}
              {cctvMode && (
                <span className="px-2.5 py-1 bg-emerald-500/90 text-slate-950 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1">
                  <Camera className="w-3 h-3" />
                  <span>CAM-04 [LIVE REC 1080P]</span>
                </span>
              )}
            </div>

            {/* Simulated LiDAR Grid Background */}
            <div className="p-6 pt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentZone.bays.map((bay, idx) => {
                const isSelected = selectedBay?.id === bay.id;
                const fillPct = Math.round((bay.units / bay.maxUnits) * 100);
                
                return (
                  <div
                    key={bay.id}
                    onClick={() => setSelectedBay(bay)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-blue-900/40 border-blue-400 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/50'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Bay Label */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-blue-400 bg-blue-950/80 border border-blue-800/50 px-2 py-0.5 rounded">
                          {bay.label}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1.5 group-hover:text-blue-300 transition-colors line-clamp-1">
                          {bay.productName || 'General Pallet Staging'}
                        </h4>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${
                        bay.status === 'optimal' ? 'bg-emerald-400' : bay.status === 'low' ? 'bg-amber-400' : 'bg-rose-500'
                      }`}></span>
                    </div>

                    {/* SKU & Category */}
                    {bay.sku && (
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2 font-mono">
                        <span className="text-slate-300">{bay.sku}</span>
                        <span>•</span>
                        <span className="text-slate-400">{bay.category}</span>
                      </div>
                    )}

                    {/* Fill Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Occupancy</span>
                        <span className="font-mono font-bold text-slate-200">{bay.units} / {bay.maxUnits} units ({fillPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className={`h-full rounded-full transition-all ${
                            fillPct > 90 
                              ? 'bg-rose-500' 
                              : fillPct > 50 
                              ? 'bg-blue-500' 
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${fillPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Thermal / CCTV Visual Highlights */}
                    {thermalMode && (
                      <div className="mt-2 text-[10px] font-mono text-amber-400 flex items-center justify-between border-t border-amber-900/30 pt-1.5">
                        <span>Thermal: {21 + (idx * 0.4)}°C</span>
                        <span className="text-amber-300">Heat Sign: Normal</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Moving AGV Robot Track Visual in Zone C or below */}
            <div className="border-t border-slate-800/80 bg-slate-900/90 p-4 px-6 flex items-center justify-between flex-wrap gap-4 text-xs">
              <div className="flex items-center space-x-3">
                <Cpu className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <div>
                  <span className="font-bold text-white">LiDAR AGV Robotic Navigation Grid</span>
                  <p className="text-[11px] text-slate-400">16 autonomous mobile transport vehicles operating on magnetic & SLAM tracks.</p>
                </div>
              </div>

              {/* Animated AGV Status Pills */}
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((agvNum, i) => {
                  const isCurrent = i === agvActiveIndex;
                  return (
                    <div
                      key={agvNum}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center space-x-1.5 transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <Box className="w-3 h-3" />
                      <span>AGV-{agvNum.toString().padStart(2, '0')}</span>
                      <span className="text-[9px] text-emerald-400">RUN</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Bay Detail Drawer if Clicked */}
          {selectedBay && (
            <div className="bg-slate-800/90 border border-blue-500/50 rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-blue-400 font-bold">{selectedBay.label} Inspection</span>
                    <h3 className="text-base font-bold text-white">{selectedBay.productName}</h3>
                    <p className="text-xs text-slate-400 font-mono">SKU: {selectedBay.sku} • Category: {selectedBay.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBay(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Available Units</span>
                  <span className="text-lg font-bold text-white font-mono">{selectedBay.units} Units</span>
                  <span className="text-[10px] text-slate-400 block">Max capacity: {selectedBay.maxUnits} units</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Storage Health</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">Optimal</span>
                  <span className="text-[10px] text-slate-400 block">Optical barcode sync: 100% verified</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Allocated Startup</span>
                  <span className="text-sm font-bold text-blue-300 truncate block">VayuTech Innovations</span>
                  <span className="text-[10px] text-slate-400 block">Cycle count: 2 hours ago</span>
                </div>
              </div>
            </div>
          )}

          {/* Warehouse Facility Highlights & Mascot Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Mascot Spotlight Card */}
            <div className="bg-gradient-to-br from-orange-950/50 via-slate-900 to-slate-900 border border-orange-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={LOGI_MASCOT.full}
                  alt="Logi Fulfillment Robot Mascot"
                  className="w-20 h-20 rounded-xl object-contain bg-slate-950/60 p-1 border border-orange-500/40 shadow-lg"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-white">Logi Assistant</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-orange-500 text-slate-950">AI BOT</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-tight">
                    Your real-time automated robotic companion guiding fulfillment, bay allocation, and logistics SLAs.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Logi Status:</span>
                  <span className="text-emerald-400 font-mono font-bold">Online • 98% Battery</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Scanner Mode:</span>
                  <span className="text-orange-400 font-mono">Laser 1D/2D QR Engine</span>
                </div>
              </div>
            </div>

            {/* Warehouse Specifications */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security & Certification Standards</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Facility Security Tier:</span>
                  <span className="font-bold text-white">{warehouse.securityRating}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Cold Chain Chamber:</span>
                  <span className={`font-bold ${warehouse.temperatureControlled ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {warehouse.temperatureControlled ? 'Active (+2°C to +8°C)' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Hazmat Class 9 Drone Vault:</span>
                  <span className={`font-bold ${warehouse.hazmatCertified ? 'text-amber-400' : 'text-slate-500'}`}>
                    {warehouse.hazmatCertified ? 'Certified (DGCA / IATA)' : 'Standard Only'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Primary Hub Contact:</span>
                  <span className="font-bold text-blue-300">{warehouse.contactPerson} ({warehouse.contactEmail})</span>
                </div>
              </div>
            </div>

            {/* Carrier Handover & Dispatch SLA */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Integrated Indian Carrier Cut-Offs</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="font-bold text-slate-200">Delhivery Surface / Express</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Cut-Off 18:30 IST</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="font-bold text-slate-200">Blue Dart Air Priority</span>
                  <span className="text-blue-400 font-mono text-[11px]">Cut-Off 19:00 IST</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="font-bold text-slate-200">Shadowfax D2C Hyperlocal</span>
                  <span className="text-amber-400 font-mono text-[11px]">Cut-Off 20:00 IST</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 px-6 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Located at: <strong className="text-slate-200">{warehouse.location}</strong></span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-colors"
            >
              Close Digital Twin
            </button>
            {onBookSpace && (
              <button
                onClick={() => onBookSpace(warehouse)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/30 flex items-center space-x-1.5"
              >
                <span>Request Bay Reservation at {warehouse.code}</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
