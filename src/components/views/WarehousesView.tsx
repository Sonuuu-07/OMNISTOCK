import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Warehouse, InventoryItem } from '../../types';
import { LOGI_MASCOT } from '../../assets/mascot';
import { WarehouseMapSatelliteView } from './WarehouseMapSatelliteView';
import { InsideWarehouseModal } from '../warehouse/InsideWarehouseModal';
import { 
  Building, 
  MapPin, 
  Thermometer, 
  ShieldCheck, 
  Truck, 
  Zap, 
  Calculator, 
  CheckCircle2, 
  X,
  Sparkles,
  ArrowRight,
  Globe,
  Eye,
  Layers,
  Radio
} from 'lucide-react';

export const WarehousesView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'map' | 'directory'>('map');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Digital Twin Inside Warehouse State
  const [selectedWarehouseForInside, setSelectedWarehouseForInside] = useState<Warehouse | null>(null);

  // Quote Calculator State
  const [calcSqFt, setCalcSqFt] = useState(6000);
  const [calcPallets, setCalcPallets] = useState(25);
  const [calcUnits, setCalcUnits] = useState(4500);
  const [calcTemp, setCalcTemp] = useState(false);
  const [calcHazmat, setCalcHazmat] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any>(null);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHubForBooking, setSelectedHubForBooking] = useState<Warehouse | null>(null);
  const [bookingForm, setBookingForm] = useState({
    startupName: 'VayuTech CleanAir Dynamics',
    contactEmail: 'aarav.sharma@vayutech.in',
    requestedSqFt: 6000,
    palletSlots: 25,
    notes: 'Requires dust-controlled ESD anti-static storage for IoT sensor assemblies.',
  });
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);

  useEffect(() => {
    fetchWarehouses();
    runQuote();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const [whRes, invRes] = await Promise.all([
        api.getWarehouses(),
        api.getInventory().catch(() => ({ total: 0, items: [] })),
      ]);
      setWarehouses(whRes.data);
      setInventory(invRes.items || []);
      if (whRes.data.length > 0) setSelectedHubForBooking(whRes.data[0]);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  const runQuote = async () => {
    try {
      const res = await api.calculateQuote({
        sqFt: calcSqFt,
        palletSlots: calcPallets,
        monthlyUnits: calcUnits,
        tempControlled: calcTemp,
        hazmat: calcHazmat,
      });
      setQuoteResult(res);
    } catch (err) {
      console.error('Quote error:', err);
    }
  };

  useEffect(() => {
    runQuote();
  }, [calcSqFt, calcPallets, calcUnits, calcTemp, calcHazmat]);

  const handleBookSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHubForBooking) return;
    try {
      const res = await api.bookWarehouseSpace({
        ...bookingForm,
        warehouseId: selectedHubForBooking.id,
      });
      setBookingConfirmation(res);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openInsideWarehouse = (wh: Warehouse) => {
    setSelectedWarehouseForInside(wh);
  };

  const handleQuickBook = (wh: Warehouse) => {
    setSelectedHubForBooking(wh);
    setShowBookingModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top View Selector & Mascot Bar */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3.5">
          <div className="relative group shrink-0">
            <img
              src={LOGI_MASCOT.avatar}
              alt="Logi Mascot"
              className="w-12 h-12 rounded-xl object-cover border-2 border-orange-500 shadow-md shadow-orange-500/20"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Pan-India Smart Warehousing & Proximity Map</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live satellite tracking, closest fulfillment hub locator, and 3D digital twin rack explorer.
            </p>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🛰️ Satellite Map & Closest Finder</span>
            </button>

            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'directory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>📋 Hub Directory & RFP</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (warehouses.length > 0) setSelectedHubForBooking(warehouses[0]);
              setShowBookingModal(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs shrink-0"
          >
            <span>Reserve Space</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main SubTab Surface */}
      {activeSubTab === 'map' ? (
        <WarehouseMapSatelliteView
          onSelectWarehouse={(wh) => openInsideWarehouse(wh)}
          onBookSpace={(wh) => handleQuickBook(wh)}
        />
      ) : (
        <div className="space-y-6">
          
          {/* Warehouse Facilities Cards Grid (All Indian Hubs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {warehouses.map((wh) => {
              const occupancyPct = Math.round((wh.usedCapacitySqFt / wh.totalCapacitySqFt) * 100);
              return (
                <div
                  key={wh.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {wh.code}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            {wh.country}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-tight">{wh.name}</h3>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" title="Active & Accepting Inbound"></span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{wh.location}</span>
                    </p>

                    {/* Capacity Bar */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Capacity Utilization</span>
                        <span className="font-mono font-bold text-slate-800">{occupancyPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${occupancyPct > 85 ? 'bg-rose-500' : 'bg-blue-600'}`}
                          style={{ width: `${occupancyPct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>{(wh.usedCapacitySqFt / 1000).toFixed(0)}k sq ft used</span>
                        <span>{(wh.totalCapacitySqFt / 1000).toFixed(0)}k total</span>
                      </div>
                    </div>

                    {/* Capabilities Badges */}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {wh.temperatureControlled && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1 font-medium">
                          <Thermometer className="w-3 h-3" />
                          <span>Cold-Chain +4°C</span>
                        </span>
                      )}
                      {wh.hazmatCertified && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1 font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Hazmat Class 9</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">
                        {wh.hourlyPickRate} picks/hr
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">
                        ₹{wh.monthlyBaseRatePerSqFt}/sq ft
                      </span>
                    </div>

                    {/* Carriers */}
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{wh.supportedCarriers.join(' • ')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openInsideWarehouse(wh)}
                      className="flex-1 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Step Inside</span>
                    </button>
                    
                    <button
                      onClick={() => handleQuickBook(wh)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                    >
                      Book Space
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Startup Storage & 3PL Fee Calculator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Instant Startup 3PL Storage & Fulfillment Estimator</h2>
                <p className="text-xs text-slate-500">Calculate all-inclusive transparent monthly rates for storage, pallet handling, and order picks in INR (₹).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Sliders and Toggles */}
              <div className="space-y-5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-700 font-semibold mb-1">
                    <span>Allocated Warehouse Footprint:</span>
                    <span className="font-mono text-blue-700">{calcSqFt.toLocaleString()} sq ft</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="25000"
                    step="500"
                    value={calcSqFt}
                    onChange={(e) => setCalcSqFt(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>1,000 sq ft (Starter)</span>
                    <span>25,000 sq ft (Enterprise)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-semibold mb-1">
                    <span>Pallet Storage Slots:</span>
                    <span className="font-mono text-blue-700">{calcPallets} Pallets</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={calcPallets}
                    onChange={(e) => setCalcPallets(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-semibold mb-1">
                    <span>Estimated Monthly Order Units:</span>
                    <span className="font-mono text-blue-700">{calcUnits.toLocaleString()} units</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="30000"
                    step="500"
                    value={calcUnits}
                    onChange={(e) => setCalcUnits(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcTemp}
                      onChange={(e) => setCalcTemp(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Requires Cold-Room (+4°C)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcHazmat}
                      onChange={(e) => setCalcHazmat(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Requires Class 9 Hazmat Storage</span>
                  </label>
                </div>
              </div>

              {/* Rate Output Card */}
              {quoteResult && (
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>Recommended Facility Match:</span>
                      <span className="font-mono font-bold text-blue-700">{quoteResult.recommendedWarehouse.name}</span>
                    </div>
                    <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                      <div className="flex justify-between text-slate-600">
                        <span>Base Storage Fee ({calcSqFt.toLocaleString()} sq ft @ ₹{quoteResult.recommendedWarehouse.monthlyBaseRatePerSqFt}):</span>
                        <span className="font-mono font-semibold text-slate-800">₹{quoteResult.baseStorageCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Pallet Handling ({calcPallets} pallets @ ₹450):</span>
                        <span className="font-mono font-semibold text-slate-800">₹{quoteResult.palletHandlingCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Pick & Pack Services ({calcUnits.toLocaleString()} units @ ₹25):</span>
                        <span className="font-mono font-semibold text-slate-800">₹{quoteResult.pickingCost.toLocaleString()}</span>
                      </div>
                      {calcTemp && (
                        <div className="flex justify-between text-blue-600 font-medium">
                          <span>Cold-Chain Surcharge (+25%):</span>
                          <span className="font-mono font-semibold">+₹{quoteResult.tempSurcharge.toLocaleString()}</span>
                        </div>
                      )}
                      {calcHazmat && (
                        <div className="flex justify-between text-amber-600 font-medium">
                          <span>Hazmat Class 9 Compliance (+40%):</span>
                          <span className="font-mono font-semibold">+₹{quoteResult.hazmatSurcharge.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs text-slate-500 block">Total Estimated Monthly 3PL Cost</span>
                        <span className="text-[10px] text-slate-400">All warehousing, labor, and telemetry included</span>
                      </div>
                      <span className="text-2xl font-bold font-mono text-blue-700">
                        ₹{quoteResult.totalEstimatedMonthlyCost.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedHubForBooking(quoteResult.recommendedWarehouse);
                        setBookingForm({
                          ...bookingForm,
                          requestedSqFt: calcSqFt,
                          palletSlots: calcPallets,
                        });
                        setShowBookingModal(true);
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Lock In Monthly Rate & Reserve Bay</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* Inside Warehouse Modal (Digital Twin) */}
      {selectedWarehouseForInside && (
        <InsideWarehouseModal
          warehouse={selectedWarehouseForInside}
          inventory={inventory}
          onClose={() => setSelectedWarehouseForInside(null)}
          onBookSpace={(wh) => handleQuickBook(wh)}
        />
      )}

      {/* Booking RFP Modal */}
      {showBookingModal && selectedHubForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedHubForBooking.code} Reservation
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Book Warehouse Space</h3>
                <p className="text-xs text-slate-500">{selectedHubForBooking.name} ({selectedHubForBooking.location})</p>
              </div>
              <button onClick={() => { setShowBookingModal(false); setBookingConfirmation(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmation ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-2 text-emerald-800">
                <div className="flex items-center space-x-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Space Reservation Confirmed!</span>
                </div>
                <p>Contract Number: <strong className="font-mono">{bookingConfirmation.contractNumber}</strong></p>
                <p>Allocated Footprint: <strong>{bookingConfirmation.requestedSqFt.toLocaleString()} sq ft</strong></p>
                <p>Monthly Base Rate: <strong>₹{bookingConfirmation.monthlyRate.toLocaleString()}</strong></p>
                <p className="text-[11px] text-emerald-700">A fulfillment agreement and API gateway credentials have been dispatched to {bookingConfirmation.contactEmail}.</p>
                <button
                  onClick={() => { setShowBookingModal(false); setBookingConfirmation(null); }}
                  className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookSpace} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company / Startup Legal Entity</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.startupName}
                    onChange={(e) => setBookingForm({ ...bookingForm, startupName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Requested Sq Ft</label>
                    <input
                      type="number"
                      required
                      value={bookingForm.requestedSqFt}
                      onChange={(e) => setBookingForm({ ...bookingForm, requestedSqFt: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pallet Slots</label>
                    <input
                      type="number"
                      required
                      value={bookingForm.palletSlots}
                      onChange={(e) => setBookingForm({ ...bookingForm, palletSlots: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Email for Inbound SOPs</label>
                  <input
                    type="email"
                    required
                    value={bookingForm.contactEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Special Handling Instructions (Cold-room, ESD, Hazmat)</label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Confirm Space Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
