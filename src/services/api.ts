import { InventoryItem, Order, Warehouse, IntegrationStatus, AiChatMessage } from '../types';

class ApiService {
  private token: string | null = localStorage.getItem('omnistock_jwt');

  setToken(t: string | null) {
    this.token = t;
    if (t) localStorage.setItem('omnistock_jwt', t);
    else localStorage.removeItem('omnistock_jwt');
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errBody: any = {};
      try {
        errBody = await response.json();
      } catch {
        errBody = { message: response.statusText };
      }
      throw new Error(errBody.message || `API error (${response.status})`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ success: boolean; token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async switchRole(role: string) {
    return this.request<{ success: boolean; token: string; user: any }>('/api/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async getDemoUsers() {
    return this.request<any[]>('/api/auth/demo-users');
  }

  async submitContactInquiry(payload: { name: string; email: string; department: string; message: string }) {
    return this.request<{ success: boolean; ticketId: string; message: string; estimatedResponseTime: string }>('/api/contact/inquiry', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Warehouses
  async getWarehouses() {
    return this.request<{ source: string; data: Warehouse[] }>('/api/warehouses');
  }

  async getWarehouseDetail(id: string) {
    return this.request<{ warehouse: Warehouse; inventoryCount: number; bayGrid: any[] }>(`/api/warehouses/${id}`);
  }

  async calculateQuote(payload: { sqFt: number; palletSlots: number; monthlyUnits: number; tempControlled: boolean; hazmat: boolean }) {
    return this.request<any>('/api/warehouses/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async bookWarehouseSpace(payload: any) {
    return this.request<any>('/api/warehouses/book-space', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Inventory
  async getInventory(params: { category?: string; warehouse?: string; status?: string; search?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ total: number; items: InventoryItem[] }>(`/api/inventory?${query}`);
  }

  async createInventoryItem(item: Partial<InventoryItem>) {
    return this.request<{ success: boolean; item: InventoryItem }>('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateStock(id: string, quantity: number, reason: string) {
    return this.request<{ success: boolean; item: InventoryItem; message: string }>(`/api/inventory/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, reason }),
    });
  }

  async importCsv(csvData: string) {
    return this.request<{ success: boolean; importedCount: number; totalCatalogSize: number }>('/api/inventory/import-csv', {
      method: 'POST',
      body: JSON.stringify({ csvData }),
    });
  }

  // Orders
  async getOrders(params: { status?: string; channel?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ total: number; orders: Order[] }>(`/api/orders?${query}`);
  }

  async createOrder(order: any) {
    return this.request<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(id: string, status: string, note?: string) {
    return this.request<{ success: boolean; order: Order }>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  }

  // Integrations
  async getIntegrations() {
    return this.request<IntegrationStatus[]>('/api/integrations');
  }

  async forceSync() {
    return this.request<{ success: boolean; message: string; timestamp: string }>('/api/integrations/sync', {
      method: 'POST',
    });
  }

  // Reports
  async getReportsSummary() {
    return this.request<any>('/api/reports/summary');
  }

  async getCronJobs() {
    return this.request<any[]>('/api/cron/jobs');
  }

  async triggerCronJob(id: string) {
    return this.request<any>(`/api/cron/trigger/${id}`, {
      method: 'POST',
    });
  }

  // AI Assistant
  async sendAiPrompt(prompt: string, role?: string) {
    return this.request<any>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, role }),
    });
  }

  async getAiEvals() {
    return this.request<any>('/api/ai/evals');
  }

  // Database Explorer
  async executeSql(query: string) {
    return this.request<any>('/api/database/sql', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async executeMongo(collection: string, pipeline: any[]) {
    return this.request<any>('/api/database/mongo', {
      method: 'POST',
      body: JSON.stringify({ collection, pipeline }),
    });
  }

  async getRedisMetrics() {
    return this.request<any>('/api/database/redis');
  }

  async flushRedis() {
    return this.request<any>('/api/database/redis/flush', {
      method: 'POST',
    });
  }

  // Tests
  async runTests() {
    return this.request<any>('/api/tests/run');
  }

  async getAuditLogs() {
    return this.request<any[]>('/api/audit-logs');
  }
}

export const api = new ApiService();
