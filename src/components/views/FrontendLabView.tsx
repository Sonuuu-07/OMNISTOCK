import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Cpu, 
  Zap, 
  Layers, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Terminal, 
  Boxes, 
  Activity,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { LOGI_MASCOT } from '../../assets/mascot';

export const FrontendLabView: React.FC = () => {
  // Event Loop Interactive Simulation State
  const [callStack, setCallStack] = useState<string[]>([]);
  const [webApis, setWebApis] = useState<string[]>([]);
  const [microtaskQueue, setMicrotaskQueue] = useState<string[]>([]);
  const [taskQueue, setTaskQueue] = useState<string[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [eventLoopRunning, setEventLoopRunning] = useState(false);

  // Closures & Lexical Scope Sandbox State
  const [closureCounter, setClosureCounter] = useState(0);
  const [closureStep, setClosureStep] = useState(1);
  const [closureHistory, setClosureHistory] = useState<string[]>([]);

  // Controlled Form & Validation State
  const [formSku, setFormSku] = useState('SKU-IOT-SENSOR-09');
  const [formUnits, setFormUnits] = useState('50');
  const [formEmail, setFormEmail] = useState('manager@omnistock.io');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Async/Await vs Promises vs Callbacks State
  const [asyncMode, setAsyncMode] = useState<'async_await' | 'promises' | 'callbacks'>('async_await');
  const [asyncLog, setAsyncLog] = useState<string[]>([]);
  const [asyncLoading, setAsyncLoading] = useState(false);

  // Run Event Loop Simulation
  const runEventLoopSimulation = async () => {
    if (eventLoopRunning) return;
    setEventLoopRunning(true);
    setCallStack([]);
    setWebApis([]);
    setMicrotaskQueue([]);
    setTaskQueue([]);
    setConsoleOutput([]);

    const log = (msg: string) => setConsoleOutput(prev => [...prev, msg]);

    // Step 1: console.log('1: Synchronous Script Start')
    setCallStack(['console.log("1: Sync Start")']);
    log('1: Synchronous Script Start');
    await new Promise(r => setTimeout(r, 600));

    // Step 2: setTimeout(() => log('4: MacroTask (Timer)'), 0)
    setCallStack(['setTimeout(callback, 0)']);
    setWebApis(['Timer 0ms (MacroTask)']);
    await new Promise(r => setTimeout(r, 600));
    setCallStack([]);
    setTaskQueue(['callback: "4: MacroTask"']);
    setWebApis([]);
    await new Promise(r => setTimeout(r, 600));

    // Step 3: Promise.resolve().then(() => log('3: MicroTask (Promise)'))
    setCallStack(['Promise.resolve().then(...)']);
    setMicrotaskQueue(['Promise.then: "3: MicroTask"']);
    await new Promise(r => setTimeout(r, 600));
    setCallStack([]);

    // Step 4: console.log('2: Synchronous Script End')
    setCallStack(['console.log("2: Sync End")']);
    log('2: Synchronous Script End');
    await new Promise(r => setTimeout(r, 600));
    setCallStack([]);

    // Step 5: Process MicroTask Queue First (VIP Queue)
    setCallStack(['runMicrotask()']);
    log('3: MicroTask (Promise.then - VIP Queue Priority)');
    setMicrotaskQueue([]);
    await new Promise(r => setTimeout(r, 700));
    setCallStack([]);

    // Step 6: Process Task Queue (Macrotask)
    setCallStack(['runMacrotask()']);
    log('4: MacroTask (setTimeout)');
    setTaskQueue([]);
    await new Promise(r => setTimeout(r, 600));
    setCallStack([]);

    setEventLoopRunning(false);
  };

  // Closure Increment Helper
  const handleClosureIncrement = () => {
    const nextVal = closureCounter + closureStep;
    setClosureCounter(nextVal);
    setClosureHistory(prev => [`closureInstance(step=${closureStep}) -> Count: ${nextVal}`, ...prev.slice(0, 5)]);
  };

  // Form Validation Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formSku.startsWith('SKU-')) {
      errors.sku = 'SKU must begin with standard "SKU-" prefix';
    }
    if (parseInt(formUnits, 10) <= 0 || isNaN(parseInt(formUnits, 10))) {
      errors.units = 'Quantity must be a positive integer > 0';
    }
    if (!formEmail.includes('@') || !formEmail.includes('.')) {
      errors.email = 'Valid corporate email address required';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3500);
    }
  };

  // Async Execution Pattern Test
  const handleRunAsyncDemo = async () => {
    setAsyncLoading(true);
    setAsyncLog([]);

    if (asyncMode === 'async_await') {
      setAsyncLog(prev => [...prev, 'try { const res = await fetchWarehouseStock("BLR-01"); }']);
      await new Promise(r => setTimeout(r, 400));
      setAsyncLog(prev => [...prev, '✓ Awaiting completed cleanly without nesting hell. Received: { stock: 450 }']);
    } else if (asyncMode === 'promises') {
      setAsyncLog(prev => [...prev, 'fetchWarehouseStock("BLR-01").then(data => {...}).catch(err => {...})']);
      await new Promise(r => setTimeout(r, 400));
      setAsyncLog(prev => [...prev, '✓ Promise chain resolved. Chained .then() executed with stock: 450']);
    } else {
      setAsyncLog(prev => [...prev, 'fetchWarehouseCallback("BLR-01", (err, data) => { if (err) ... })']);
      await new Promise(r => setTimeout(r, 400));
      setAsyncLog(prev => [...prev, '✓ Callback executed. Pyramid of doom / error-first callback pattern handled.']);
    }
    setAsyncLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={LOGI_MASCOT.avatar}
            alt="Logi Mascot"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500 shadow-md shadow-purple-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Frontend Engineering & JavaScript Lab</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                React 18 + ES2024
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Visual event loop simulator (Call Stack vs Microtasks vs Tasks), closure state retainment, controlled form validation, and Async/Await vs Promise mechanics.
            </p>
          </div>
        </div>

        <button
          onClick={runEventLoopSimulation}
          disabled={eventLoopRunning}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Play className={`w-4 h-4 fill-white ${eventLoopRunning ? 'animate-spin' : ''}`} />
          <span>{eventLoopRunning ? 'Simulating Tick...' : 'Run Event Loop Visualizer'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. JAVASCRIPT EVENT LOOP VISUALIZER */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">JavaScript Event Loop & Microtask Priority Visualizer</h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
            Single Threaded Non-Blocking I/O
          </span>
        </div>

        {/* 4 Pipeline Containers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Call Stack */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-h-[140px]">
            <div className="flex items-center justify-between font-bold text-blue-700">
              <span>Call Stack (LIFO)</span>
              <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded">Execution</span>
            </div>
            <div className="space-y-1">
              {callStack.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic">Stack is idle (empty)</div>
              ) : (
                callStack.map((item, i) => (
                  <div key={i} className="p-1.5 bg-blue-600 text-white rounded font-mono text-[11px] animate-pulse">
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Web APIs */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-h-[140px]">
            <div className="flex items-center justify-between font-bold text-amber-700">
              <span>Web APIs (Browser / C++)</span>
              <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">Timers/Fetch</span>
            </div>
            <div className="space-y-1">
              {webApis.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic">No async background ops</div>
              ) : (
                webApis.map((item, i) => (
                  <div key={i} className="p-1.5 bg-amber-500 text-white rounded font-mono text-[11px]">
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Microtask Queue */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-h-[140px]">
            <div className="flex items-center justify-between font-bold text-emerald-700">
              <span>Microtask Queue (VIP)</span>
              <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Promises</span>
            </div>
            <div className="space-y-1">
              {microtaskQueue.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic">Queue is empty</div>
              ) : (
                microtaskQueue.map((item, i) => (
                  <div key={i} className="p-1.5 bg-emerald-600 text-white rounded font-mono text-[11px]">
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Macrotask Queue */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-h-[140px]">
            <div className="flex items-center justify-between font-bold text-rose-700">
              <span>Task / Macrotask Queue</span>
              <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded">setTimeout</span>
            </div>
            <div className="space-y-1">
              {taskQueue.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic">Queue is empty</div>
              ) : (
                taskQueue.map((item, i) => (
                  <div key={i} className="p-1.5 bg-rose-600 text-white rounded font-mono text-[11px]">
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Console Log Stream */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Standard Console Output:</span>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 min-h-[70px] space-y-1">
            {consoleOutput.length === 0 ? (
              <span className="text-slate-500">Click "Run Event Loop Visualizer" above to trace async scheduling...</span>
            ) : (
              consoleOutput.map((c, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="text-slate-600">&gt;</span>
                  <span>{c}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid of Closures, Forms & Async Paradigms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========================================================================= */}
        {/* 2. CLOSURES & LEXICAL SCOPE SANDBOX */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">JavaScript Closures</h2>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              A closure is the combination of a function bundled together with references to its surrounding lexical environment.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Enclosed Step Size:</span>
                <div className="flex gap-1">
                  {[1, 5, 10].map(s => (
                    <button
                      key={s}
                      onClick={() => setClosureStep(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        closureStep === s ? 'bg-amber-600 text-white' : 'bg-white border text-slate-600'
                      }`}
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-700">Retained Value:</span>
                <span className="text-2xl font-bold font-mono text-amber-700">{closureCounter}</span>
              </div>
            </div>

            <button
              onClick={handleClosureIncrement}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Invoke Closure: increment()
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Call Execution Log:</span>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-amber-300 space-y-1 max-h-28 overflow-y-auto">
                {closureHistory.length === 0 ? (
                  <span className="text-slate-500">No invocations yet.</span>
                ) : (
                  closureHistory.map((h, i) => <div key={i}>{h}</div>)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CONTROLLED INPUTS & FORM VALIDATION */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Controlled Form & Validation</h2>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">SKU Code (Controlled State):</label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className={`w-full p-2 bg-slate-50 border rounded-lg font-mono text-xs ${
                  formErrors.sku ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300'
                }`}
              />
              {formErrors.sku && <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.sku}</p>}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Reorder Units:</label>
              <input
                type="number"
                value={formUnits}
                onChange={(e) => setFormUnits(e.target.value)}
                className={`w-full p-2 bg-slate-50 border rounded-lg font-mono text-xs ${
                  formErrors.units ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300'
                }`}
              />
              {formErrors.units && <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.units}</p>}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Manager Corporate Email:</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className={`w-full p-2 bg-slate-50 border rounded-lg text-xs ${
                  formErrors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300'
                }`}
              />
              {formErrors.email && <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.email}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Validate & Submit Form
            </button>

            {formSubmitted && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-1.5 text-emerald-800 text-[11px] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Form validated cleanly with zero state errors!</span>
              </div>
            )}
          </form>
        </div>

        {/* ========================================================================= */}
        {/* 4. ASYNC/AWAIT VS PROMISES VS CALLBACKS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Async Patterns Comparison</h2>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setAsyncMode('async_await')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  asyncMode === 'async_await' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                }`}
              >
                async/await
              </button>
              <button
                onClick={() => setAsyncMode('promises')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  asyncMode === 'promises' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                }`}
              >
                Promises .then()
              </button>
              <button
                onClick={() => setAsyncMode('callbacks')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  asyncMode === 'callbacks' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                }`}
              >
                Callbacks
              </button>
            </div>

            <button
              onClick={handleRunAsyncDemo}
              disabled={asyncLoading}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {asyncLoading ? 'Executing Async Flow...' : `Test ${asyncMode.replace('_', '/')} Flow`}
            </button>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-300 min-h-[96px] space-y-1">
              {asyncLog.length === 0 ? (
                <span className="text-slate-500">Click test to execute the selected async paradigm...</span>
              ) : (
                asyncLog.map((l, i) => <div key={i}>{l}</div>)
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
