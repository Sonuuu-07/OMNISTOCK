import React, { useState } from 'react';
import { 
  Server, 
  Layers, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send, 
  Terminal, 
  Code, 
  Cpu, 
  Workflow, 
  FileCheck,
  ShieldCheck,
  Zap,
  Radio,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { LOGI_MASCOT } from '../../assets/mascot';

export const BackendDesignView: React.FC = () => {
  // REST API Explorer State
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState('/api/inventory');
  const [requestBody, setRequestBody] = useState('{\n  "sku": "SKU-TEST-01",\n  "name": "Smart Fitness Band",\n  "quantity": 100,\n  "warehouse_id": "wh_blr_01"\n}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string; timestamp: string; status: string }>>([
    { name: 'bill_of_lading_BLR_0921.pdf', size: '248 KB', type: 'application/pdf', timestamp: '10:42 AM', status: 'Parsed & Indexed' },
    { name: 'asn_manifest_delhivery_3pl.csv', size: '64 KB', type: 'text/csv', timestamp: '11:15 AM', status: 'Validated' }
  ]);
  const [dragActive, setDragActive] = useState(false);

  // Middleware Pipeline Active Step Simulator
  const [activeMiddlewareStep, setActiveMiddlewareStep] = useState<number>(0);

  const handleExecuteRequest = async () => {
    setApiLoading(true);
    setActiveMiddlewareStep(1);
    
    setTimeout(async () => {
      setActiveMiddlewareStep(2);
      try {
        let res: any;
        if (method === 'GET' && endpoint === '/api/inventory') {
          res = await api.getInventory();
          setStatusCode(200);
        } else if (method === 'GET' && endpoint === '/api/warehouses') {
          res = await api.getWarehouses();
          setStatusCode(200);
        } else if (method === 'GET' && endpoint === '/api/orders') {
          res = await api.getOrders();
          setStatusCode(200);
        } else if (method === 'POST' && endpoint === '/api/orders') {
          const body = JSON.parse(requestBody);
          res = await api.createOrder(body);
          setStatusCode(201);
        } else {
          // General execution fallback
          res = {
            status: 'ok',
            method,
            endpoint,
            timestamp: new Date().toISOString(),
            payloadReceived: method !== 'GET' ? JSON.parse(requestBody) : undefined,
            serverHeaders: {
              'x-powered-by': 'Express 4.21.2',
              'content-type': 'application/json; charset=utf-8',
              'x-rate-limit-remaining': 178
            }
          };
          setStatusCode(200);
        }
        setApiResponse(res);
        setActiveMiddlewareStep(4);
      } catch (err: any) {
        setStatusCode(400);
        setApiResponse({
          error: 'Bad Request',
          message: err.message || 'Validation failed on request body schema',
          details: [
            { field: 'quantity', issue: 'must be an integer greater than 0' }
          ]
        });
        setActiveMiddlewareStep(5);
      } finally {
        setApiLoading(false);
      }
    }, 400);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const newFile = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || 'document/customs',
      timestamp: new Date().toLocaleTimeString(),
      status: 'Uploaded & Verified'
    };
    setUploadedFiles(prev => [newFile, ...prev]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={LOGI_MASCOT.avatar}
            alt="Logi Mascot"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md shadow-blue-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Backend & System Design Workbench</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                Express Port 3000
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Interactive RESTful API inspector, middleware pipeline simulator, HTTP status code matrix, body validation, and customs file upload handlers.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Gateway: <strong>SINGLE PORT 3000 INGRESS</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE REST API EXPLORER & RUNNER */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">RESTful Endpoint Explorer & Request Runner</h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
            Node.js Express 4.x
          </span>
        </div>

        {/* Request Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs border focus:ring-2 focus:ring-blue-500 cursor-pointer ${
              method === 'GET' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
              method === 'POST' ? 'bg-blue-50 text-blue-700 border-blue-300' :
              method === 'PUT' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/api/resource"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleExecuteRequest}
              disabled={apiLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{apiLoading ? 'Processing...' : 'Send Request'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold">Quick Endpoints:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setMethod('GET'); setEndpoint('/api/inventory'); }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono cursor-pointer"
            >
              GET /api/inventory
            </button>
            <button
              onClick={() => { setMethod('GET'); setEndpoint('/api/warehouses'); }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono cursor-pointer"
            >
              GET /api/warehouses
            </button>
            <button
              onClick={() => { setMethod('GET'); setEndpoint('/api/orders'); }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono cursor-pointer"
            >
              GET /api/orders
            </button>
            <button
              onClick={() => { setMethod('POST'); setEndpoint('/api/orders'); }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono cursor-pointer"
            >
              POST /api/orders
            </button>
          </div>
        </div>

        {/* Request & Response Split Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Request Body & Headers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold">Request Body (JSON Payload):</span>
              <span className="font-mono text-[10px] text-slate-400">Content-Type: application/json</span>
            </div>
            <textarea
              rows={8}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              disabled={method === 'GET'}
              className="w-full p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs border border-slate-800 disabled:opacity-40"
            />
          </div>

          {/* Response Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Server Response:</span>
              {statusCode && (
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                  statusCode >= 200 && statusCode < 300 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  Status: {statusCode} {statusCode === 200 ? 'OK' : statusCode === 201 ? 'Created' : 'Error'}
                </span>
              )}
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs min-h-[160px] max-h-60 overflow-y-auto">
              {apiResponse ? (
                <pre className="text-slate-200 text-[11px] whitespace-pre-wrap">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-500 flex items-center justify-center h-32">
                  Execute request to view server response headers and JSON body...
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MIDDLEWARE EXECUTION PIPELINE */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Express Middleware Request Pipeline</h2>
          </div>
          <span className="text-xs text-slate-500">Sequential Execution Chain</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center space-x-1.5 text-blue-700 font-bold">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Audit Logger</span>
            </div>
            <p className="text-[11px] text-slate-500">Captures incoming HTTP method, IP, user-agent, and high-res timestamp.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-700 font-bold">
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Rate Limiter</span>
            </div>
            <p className="text-[11px] text-slate-500">Sliding token bucket (180 req/min). Returns 429 if window exceeded.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center space-x-1.5 text-indigo-700 font-bold">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Auth & RBAC</span>
            </div>
            <p className="text-[11px] text-slate-500">Decodes Bearer JWT, validates PBKDF2 signature, matches role permissions.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center space-x-1.5 text-purple-700 font-bold">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">4</span>
              <span>Body Sanitizer</span>
            </div>
            <p className="text-[11px] text-slate-500">Recursive validation stripping XSS script tags and prompt injection.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">5</span>
              <span>Error Handler</span>
            </div>
            <p className="text-[11px] text-slate-500">Global catch-all converting uncaught exceptions into standard JSON errors.</p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HTTP STATUS CODES & FILE UPLOAD INTAKE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HTTP Status Code Reference */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Standard HTTP Status Code Matrix</h2>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-mono">
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">200 OK</span>
                <span className="text-slate-600">GET /api/inventory</span>
              </div>
              <span className="text-[11px] text-slate-400">Standard successful query</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">201 Created</span>
                <span className="text-slate-600">POST /api/orders</span>
              </div>
              <span className="text-[11px] text-slate-400">Resource successfully created</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">400 Bad Request</span>
                <span className="text-slate-600">POST /api/inventory</span>
              </div>
              <span className="text-[11px] text-slate-400">Invalid payload schema</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">401 Unauthorized</span>
                <span className="text-slate-600">Any Endpoint</span>
              </div>
              <span className="text-[11px] text-slate-400">Missing or invalid JWT</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">403 Forbidden</span>
                <span className="text-slate-600">/api/admin/*</span>
              </div>
              <span className="text-[11px] text-slate-400">Role lacks permission</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">429 Rate Limit</span>
                <span className="text-slate-600">Token Bucket</span>
              </div>
              <span className="text-[11px] text-slate-400">Too many requests</span>
            </div>
          </div>
        </div>

        {/* Customs & Manifest File Upload Intake */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Customs & ASN Document Upload</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Multipart/form-data</span>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-2 transition-all ${
              dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Drag & Drop Bill of Lading, ASN Manifest, or Packing List</p>
            <p className="text-[11px] text-slate-500">Supports PDF, CSV, XLSX, and scanned invoice images up to 25MB</p>
            <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs transition-colors">
              Browse Local Files
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </label>
          </div>

          {/* Uploaded Files Table */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Processed Inbound Documents:</span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="p-2.5 bg-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800">{f.name}</span>
                      <div className="text-[10px] text-slate-400 font-mono">{f.size} • {f.type}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
