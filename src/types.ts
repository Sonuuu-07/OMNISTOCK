export type UserRole = 'ADMIN' | 'WAREHOUSE_MANAGER' | 'STARTUP_MERCHANT' | 'OPERATIONS_AUDITOR';

export interface User {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  startupId?: string;
  assignedWarehouseCode?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  country: string;
  coordinates: [number, number];
  totalCapacitySqFt: number;
  usedCapacitySqFt: number;
  totalBays: number;
  occupiedBays: number;
  temperatureControlled: boolean;
  hazmatCertified: boolean;
  securityRating: string;
  hourlyPickRate: number;
  monthlyBaseRatePerSqFt: number;
  supportedCarriers: string[];
  status: 'active' | 'maintenance' | 'full';
  contactPerson: string;
  contactEmail: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Electronics' | 'Apparel' | 'Health & Beauty' | 'Beverages & Food' | 'Industrial & Hardware';
  warehouseId: string;
  warehouseCode: string;
  bayLocation: string;
  quantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  safetyStock: number;
  unitCost: number;
  retailPrice: number;
  weightKg: number;
  batchLotNumber: string;
  expiryDate?: string;
  supplierId: string;
  startupOwnerId: string;
  startupName: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'quarantined';
  lastCountedAt: string;
  syncedChannels: string[];
  tags: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  startupId: string;
  startupName: string;
  channel: 'Shopify' | 'Amazon' | 'ONDC' | 'WooCommerce' | 'Dukaan' | 'QuickCommerce' | 'Manual' | string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'picking' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  assignedWarehouseId: string;
  carrier: 'Delhivery' | 'Shadowfax' | 'Xpressbees' | 'Blue Dart' | 'Ecom Express' | string;
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
}

export interface InboundShipment {
  id: string;
  shipmentNumber: string;
  supplierName: string;
  startupName: string;
  destinationWarehouseId: string;
  expectedDate: string;
  actualDate?: string;
  totalUnits: number;
  receivedUnits: number;
  status: 'draft' | 'in_transit' | 'customs_hold' | 'dock_arrival' | 'received' | 'discrepancy';
  palletsCount: number;
  billOfLading: string;
  items: Array<{
    sku: string;
    expectedQty: number;
    receivedQty: number;
  }>;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  logo: string;
  status: string;
  lastSync: string;
  ordersToday?: number;
  syncFrequency: string;
  rateLimitRemaining?: string;
  settlementBalance?: string;
  mode?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  toolInvocations?: Array<{
    name: string;
    args: any;
    result: any;
  }>;
  ragSources?: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
  }>;
  securityReport?: {
    sanitized: boolean;
    injectionAlerts: string[];
  };
  telemetry?: {
    promptTokens: number;
    candidateTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    latencyMs: number;
    model: string;
  };
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}
