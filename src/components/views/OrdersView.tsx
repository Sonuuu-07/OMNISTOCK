import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { 
  Truck, 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Send,
  X,
  ExternalLink
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New order dispatch state
  const [newOrder, setNewOrder] = useState({
    customerName: 'Karthik Ramanathan',
    customerEmail: 'karthik.r@indiamail.in',
    channel: 'ONDC',
    sku: 'VAYU-PUR-001',
    quantity: 1,
    street: '88 Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560038',
    country: 'India',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      setOrders(res.orders);
      if (res.orders.length > 0) setSelectedOrder(res.orders[0]);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: newOrder.customerName,
        customerEmail: newOrder.customerEmail,
        channel: newOrder.channel,
        items: [{ sku: newOrder.sku, quantity: newOrder.quantity }],
        shippingAddress: {
          street: newOrder.street,
          city: newOrder.city,
          state: newOrder.state,
          zip: newOrder.zip,
          country: newOrder.country,
        },
      };
      const res = await api.createOrder(payload);
      if (res.success) {
        setOrders(prev => [res.order, ...prev]);
        setSelectedOrder(res.order);
        setShowCreateModal(false);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
        setSelectedOrder(res.order);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchChannel = channelFilter === 'All' || o.channel === channelFilter;
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchChannel && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>Real-Time Orders & Transit Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end fulfillment timeline from channel webhook ingest to carrier delivery milestone.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Inbound Order</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split View (Order List + Live Tracking Milestone Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Filterable Order Pipeline */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Order Stream</h2>
            <div className="flex items-center space-x-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-[11px] rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="picking">Picking</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      ord.status === 'shipped' ? 'bg-green-100 text-green-700' :
                      ord.status === 'picking' ? 'bg-amber-100 text-amber-700' :
                      ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium truncate">{ord.customerName}</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                    <span>{ord.channel} • {ord.carrier}</span>
                    <span className="font-mono font-bold text-blue-700">₹{ord.totalAmount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Live Transit Detail & Carrier Route Map */}
        <div className="lg:col-span-2 space-y-4">
          {selectedOrder ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-slate-900 font-mono">{selectedOrder.orderNumber}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedOrder.channel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer: <span className="text-slate-900 font-medium">{selectedOrder.customerName}</span> ({selectedOrder.customerEmail})
                  </p>
                </div>

                {/* State Transition Actions */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500">Advance Stage:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">1. Pending Ingest</option>
                    <option value="picking">2. AGV Picking</option>
                    <option value="packed">3. Packed & Weighed</option>
                    <option value="shipped">4. Carrier Handover</option>
                    <option value="delivered">5. Delivered</option>
                  </select>
                </div>
              </div>

              {/* Carrier & Tracking Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Assigned Carrier</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 flex items-center space-x-1">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>{selectedOrder.carrier}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Tracking Number</span>
                  <span className="font-mono font-bold text-blue-700 text-xs mt-0.5 block">
                    {selectedOrder.trackingNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Estimated Delivery</span>
                  <span className="text-slate-700 font-medium text-xs mt-0.5 block">
                    {new Date(selectedOrder.estimatedDelivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Contents</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-white flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-blue-700">{it.sku}</span>
                        <p className="text-slate-700">{it.name}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-500">{it.quantity} × ₹{it.unitPrice.toFixed(2)}</span>
                        <div className="font-bold text-slate-900">₹{it.total.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Tracking Timeline */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Fulfillment Milestone Timeline</span>
                </h3>

                <div className="space-y-3 pl-2 border-l-2 border-slate-200 ml-2">
                  {selectedOrder.timeline.map((step, sIdx) => (
                    <div key={sIdx} className="relative pl-4 text-xs">
                      <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{step.status}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{step.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Address */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Ship-To Destination</span>
                  <p className="text-slate-800 font-medium">
                    {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}, {selectedOrder.shippingAddress.country}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-xs shadow-xs">
              Select an order from the list to view live fulfillment milestones.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Dispatch Simulated Order */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Simulate E-Commerce Inbound Order</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Channel</label>
                  <select
                    value={newOrder.channel}
                    onChange={(e) => setNewOrder({ ...newOrder, channel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ONDC">ONDC Network</option>
                    <option value="Shopify">Shopify D2C</option>
                    <option value="Amazon">Amazon India</option>
                    <option value="Dukaan">Dukaan Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">SKU to Order</label>
                  <select
                    value={newOrder.sku}
                    onChange={(e) => setNewOrder({ ...newOrder, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VAYU-PUR-001">VAYU-PUR-001 (VayuAir HEPA Pro)</option>
                    <option value="AURA-RING-01">AURA-RING-01 (Smart Sleep Ring)</option>
                    <option value="MOK-SER-KUM">MOK-SER-KUM (Kumkumadi Night Elixir)</option>
                    <option value="KAV-DRN-BAT">KAV-DRN-BAT (Drone Li-Po Pack 120Wh)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Shipping Address (Street)</label>
                <input
                  type="text"
                  value={newOrder.street}
                  onChange={(e) => setNewOrder({ ...newOrder, street: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    value={newOrder.city}
                    onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">State</label>
                  <input
                    type="text"
                    value={newOrder.state}
                    onChange={(e) => setNewOrder({ ...newOrder, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Zip</label>
                  <input
                    type="text"
                    value={newOrder.zip}
                    onChange={(e) => setNewOrder({ ...newOrder, zip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Ingest Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
