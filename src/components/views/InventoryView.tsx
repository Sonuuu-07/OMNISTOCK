import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { InventoryItem, Warehouse } from '../../types';
import { 
  Boxes, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  Edit3, 
  RefreshCw, 
  X,
  Sparkles
} from 'lucide-react';

interface InventoryViewProps {
  onNavigateAi?: (prompt: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigateAi }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  // Form states
  const [newSku, setNewSku] = useState({
    sku: '',
    name: '',
    category: 'Electronics',
    warehouseCode: 'BLR-01',
    quantity: 100,
    reorderPoint: 40,
    unitCost: 1850.00,
    retailPrice: 4499.00,
    weightKg: 0.5,
    startupName: 'VayuTech CleanAir Dynamics',
  });

  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Routine cycle count audit');
  const [csvText, setCsvText] = useState(`sku,name,category,quantity,unitCost,retailPrice
NEX-WATCH-IND,NexFit Titanium Smartwatch,Electronics,120,3200.00,8999.00
AERO-CAP-IND,AeroVent Technical Running Cap,Apparel,350,450.00,1299.00
MOK-MIST-100ML,Rosewater Barrier Glow Mist 100ml,Health & Beauty,500,280.00,799.00`);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [invRes, whRes] = await Promise.all([
        api.getInventory(),
        api.getWarehouses(),
      ]);
      setItems(invRes.items);
      setWarehouses(whRes.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.sku || !newSku.name) return;
    try {
      const res = await api.createInventoryItem(newSku as any);
      if (res.success) {
        setItems(prev => [res.item, ...prev]);
        setShowAddModal(false);
        setNewSku({
          sku: '',
          name: '',
          category: 'Electronics',
          warehouseCode: 'ORD-01',
          quantity: 100,
          reorderPoint: 40,
          unitCost: 25.00,
          retailPrice: 69.99,
          weightKg: 0.5,
          startupName: 'Lumina Smart Home Inc.',
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      const res = await api.updateStock(activeItem.id, adjustQty, adjustReason);
      if (res.success) {
        setItems(prev => prev.map(i => i.id === activeItem.id ? res.item : i));
        setShowAdjustModal(false);
        setActiveItem(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCsvImport = async () => {
    try {
      const res = await api.importCsv(csvText);
      if (res.success) {
        setShowCsvModal(false);
        fetchInventory();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const exportCsv = () => {
    const header = 'SKU,Name,Category,Warehouse,Bay,Quantity,UnitCost,RetailPrice,Status,LotNumber\n';
    const rows = items.map(i => 
      `"${i.sku}","${i.name}","${i.category}","${i.warehouseCode}","${i.bayLocation}",${i.quantity},${i.unitCost},${i.retailPrice},"${i.status}","${i.batchLotNumber}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnistock-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.sku.toLowerCase().includes(search.toLowerCase()) || 
                          item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <span>Inventory Management & SKU Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-warehouse catalog, lot/batch tracking, automated reorder triggers, and channel sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Import</span>
          </button>

          <button
            onClick={exportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
        
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category & Status Dropdowns */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
            <option value="Health & Beauty">Health & Beauty</option>
            <option value="Industrial & Hardware">Industrial & Hardware</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            <option value="All">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (Alert)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">SKU & Product Name</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Warehouse & Bay</th>
                <th className="px-4 py-3.5">Stock Available</th>
                <th className="px-4 py-3.5">Reorder Point</th>
                <th className="px-4 py-3.5">Unit / Retail (₹)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No matching inventory SKUs found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="font-mono font-bold text-blue-700">{item.sku}</div>
                          <div className="text-slate-900 text-xs mt-0.5">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.batchLotNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="text-slate-900 font-semibold">{item.warehouseCode}</div>
                      <div className="text-slate-500 text-[10px]">{item.bayLocation}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.quantity.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">units</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Reserved: {item.reservedQuantity}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {item.reorderPoint} units
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="text-slate-800 font-medium">₹{item.unitCost.toFixed(2)}</div>
                      <div className="text-green-700 text-[10px] font-semibold">₹{item.retailPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        item.status === 'in_stock'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : item.status === 'low_stock'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setAdjustQty(item.quantity);
                            setShowAdjustModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Adjust Stock & Cycle Count"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setShowBarcodeModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Generate QR / Barcode Tag"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        {onNavigateAi && item.status !== 'in_stock' && (
                          <button
                            onClick={() => onNavigateAi(`Draft an automated purchase order restock recommendation for SKU ${item.sku} at warehouse ${item.warehouseCode}`)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                            title="Ask AI to Draft PO"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New SKU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Register New Product SKU</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSku} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">SKU Identifier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LUM-CAM-4K"
                    value={newSku.sku}
                    onChange={(e) => setNewSku({ ...newSku, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Category *</label>
                  <select
                    value={newSku.category}
                    onChange={(e) => setNewSku({ ...newSku, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Industrial & Hardware">Industrial & Hardware</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumina 4K Night Vision Security Camera"
                  value={newSku.name}
                  onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newSku.quantity}
                    onChange={(e) => setNewSku({ ...newSku, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Reorder Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={newSku.reorderPoint}
                    onChange={(e) => setNewSku({ ...newSku, reorderPoint: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Warehouse Hub</label>
                  <select
                    value={newSku.warehouseCode}
                    onChange={(e) => setNewSku({ ...newSku, warehouseCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.code}>{w.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Unit Cost Basis (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSku.unitCost}
                    onChange={(e) => setNewSku({ ...newSku, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Retail Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSku.retailPrice}
                    onChange={(e) => setNewSku({ ...newSku, retailPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock */}
      {showAdjustModal && activeItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Stock Adjustment Audit Log</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-mono font-bold text-blue-700">{activeItem.sku}</p>
                <p className="text-slate-900 font-medium">{activeItem.name}</p>
                <p className="text-[11px] text-slate-500 mt-1">Current on hand: {activeItem.quantity} units</p>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">New Counted Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Audit Adjustment Reason *</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Routine cycle count audit">Routine cycle count audit</option>
                  <option value="Inbound supplier shipment receipt">Inbound supplier shipment receipt</option>
                  <option value="Damaged / Quarantined items write-off">Damaged / Quarantined write-off</option>
                  <option value="Customer return restocked">Customer return restocked</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV Bulk Import */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Bulk CSV Inventory Ingestion</span>
              </h3>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>Paste or edit CSV payload with columns: <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-800 font-mono">sku,name,category,quantity,unitCost,retailPrice</code></p>
              <textarea
                rows={7}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs"
              >
                Execute Bulk Ingest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Barcode / QR Tag Simulator */}
      {showBarcodeModal && activeItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-6 text-center space-y-4 shadow-xl">
            <div className="flex justify-end">
              <button onClick={() => setShowBarcodeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl inline-block shadow-inner">
              <QrCode className="w-28 h-28 mx-auto text-slate-900" />
              <p className="font-mono font-bold text-xs mt-2 text-slate-900">{activeItem.sku}</p>
              <p className="text-[10px] text-slate-600 truncate">{activeItem.name}</p>
              <p className="text-[9px] font-mono text-slate-500 mt-1">{activeItem.warehouseCode} • {activeItem.bayLocation}</p>
            </div>
            <p className="text-xs text-slate-500">
              Scannable by Zebra / Honeywell handheld WMS terminal scanners during pick-and-pack routing.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
