import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { MaterialItem } from '../types';
import {
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowDownLeft,
  Truck,
  IndianRupee,
  Search,
  Filter,
  FileText
} from 'lucide-react';

export const MaterialInventoryView: React.FC = () => {
  const {
    materials,
    vendors,
    receiveMaterial,
    consumeMaterial,
    addMaterial,
    activeProjectId
  } = useCasabuild();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);

  // Inward Form State
  const [inwardMaterialId, setInwardMaterialId] = useState(materials[0]?.id || '');
  const [inwardVendorId, setInwardVendorId] = useState(vendors[0]?.id || '');
  const [inwardQty, setInwardQty] = useState('50');
  const [inwardRate, setInwardRate] = useState('395');
  const [inwardInvoiceNo, setInwardInvoiceNo] = useState('');

  // Consume Form State
  const [consumeQty, setConsumeQty] = useState('10');
  const [consumeReason, setConsumeReason] = useState('Slab casting & plastering');

  // New Material Catalog Item State
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState<any>('Civil');
  const [matUnit, setMatUnit] = useState('Bags');
  const [matBalance, setMatBalance] = useState('100');
  const [matThreshold, setMatThreshold] = useState('30');
  const [matCost, setMatCost] = useState('400');

  const filteredMaterials = materials.filter(m => {
    const matchCat = categoryFilter === 'All' || m.category === categoryFilter;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStockCount = materials.filter(m => m.status === 'Low Stock' || m.status === 'Critical').length;
  const totalInventoryValue = materials.reduce((acc, curr) => acc + (curr.currentBalance * curr.unitCost), 0);

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inwardMaterialId || !inwardQty) return;
    receiveMaterial(
      inwardMaterialId,
      Number(inwardQty),
      Number(inwardRate),
      inwardVendorId,
      inwardInvoiceNo || `CH-${Math.floor(1000 + Math.random() * 9000)}`
    );
    setShowInwardModal(false);
    setInwardQty('50');
  };

  const handleConsume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !consumeQty) return;
    consumeMaterial(selectedMaterial.id, Number(consumeQty), consumeReason);
    setShowConsumeModal(false);
    setSelectedMaterial(null);
  };

  const handleAddNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName) return;
    addMaterial({
      name: matName,
      category: matCategory,
      unit: matUnit,
      currentBalance: Number(matBalance) || 0,
      minThreshold: Number(matThreshold) || 20,
      unitCost: Number(matCost) || 100,
      supplier: vendors[0]?.name || 'Local Building Material Supplier'
    });
    setShowAddMaterialModal(false);
    setMatName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 4
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-['Outfit',sans-serif]">
              Material Inventory & Stock Balances
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Live stock balances for Cement, Steel, AAC Blocks, and finishes with minimum threshold alerts and automated vendor challan logging.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="inventory-receive-btn"
            onClick={() => setShowInwardModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            <Truck className="h-4 w-4 stroke-[2.5]" />
            <span>Receive Material (Inward)</span>
          </button>
          <button
            id="inventory-add-item-btn"
            onClick={() => setShowAddMaterialModal(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Inventory Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Items Tracked</span>
          <p className="mt-2 text-2xl font-extrabold text-zinc-100">{materials.length}</p>
          <span className="text-[10px] text-zinc-500">Across 6 construction categories</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Low Stock Warnings</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-extrabold ${lowStockCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {lowStockCount}
            </span>
            <span className="text-[10px] text-zinc-400">Reorder needed</span>
          </div>
          <span className="text-[10px] text-zinc-500">AAC Blocks, Paint below min</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Asset Value</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400">
              ₹{(totalInventoryValue / 100000).toFixed(2)}L
            </span>
            <span className="text-[10px] text-zinc-400">At site stores</span>
          </div>
          <span className="text-[10px] text-zinc-500">Includes steel reinforcement</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Primary Cement Stock</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">
              {materials.find(m => m.name.includes('Cement'))?.currentBalance || 56} Bags
            </span>
            <span className="text-[10px] text-zinc-400">UltraTech 53</span>
          </div>
          <span className="text-[10px] text-zinc-500">Next delivery Friday</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search cement, steel, bricks, paint..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 focus:border-amber-500/60 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Civil">Civil</option>
            <option value="Steel">Steel</option>
            <option value="Finishes">Finishes</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Woodwork">Woodwork</option>
          </select>
        </div>

        <div className="text-xs text-zinc-400">
          Showing <span className="font-semibold text-zinc-200">{filteredMaterials.length}</span> warehouse & site items
        </div>
      </div>

      {/* Inventory Grid Cards (Matches Video Blueprint: Cement 56 Bags, Steel 580 Kg, AAC Blocks 120 Nos Low Stock) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map(item => {
          const isLow = item.status === 'Low Stock' || item.status === 'Critical';
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 transition shadow-xl ${
                isLow
                  ? 'border-rose-500/30 bg-rose-500/10'
                  : 'border-zinc-800 bg-[#161922] hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    {item.category}
                  </span>
                  <h4 className="mt-1.5 text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">{item.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Supplier: {item.supplier}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  item.status === 'Adequate'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">Current Balance</span>
                  <p className="text-xl font-extrabold text-zinc-100">
                    {item.currentBalance} <span className="text-xs font-normal text-zinc-400">{item.unit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">Min Threshold</span>
                  <p className="text-xs font-bold text-zinc-300">{item.minThreshold} {item.unit}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 pt-2.5 border-t border-zinc-800">
                <span>Rate: ₹{item.unitCost} / {item.unit}</span>
                <span>Val: ₹{(item.currentBalance * item.unitCost).toLocaleString('en-IN')}</span>
              </div>

              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => {
                    setInwardMaterialId(item.id);
                    setInwardRate(String(item.unitCost));
                    setShowInwardModal(true);
                  }}
                  className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
                >
                  Inward (+ Recv)
                </button>
                <button
                  onClick={() => {
                    setSelectedMaterial(item);
                    setShowConsumeModal(true);
                  }}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
                >
                  Log Issue (- Use)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inward Modal */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">
              Receive Material (Stock Inward Entry)
            </h3>
            <form onSubmit={handleReceive} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Select Material</label>
                <select
                  value={inwardMaterialId}
                  onChange={e => setInwardMaterialId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Quantity Received</label>
                  <input
                    type="number"
                    required
                    value={inwardQty}
                    onChange={e => setInwardQty(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Unit Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={inwardRate}
                    onChange={e => setInwardRate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Vendor / Supplier</label>
                <select
                  value={inwardVendorId}
                  onChange={e => setInwardVendorId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Challan / Invoice No</label>
                <input
                  type="text"
                  placeholder="e.g., CH-9421"
                  value={inwardInvoiceNo}
                  onChange={e => setInwardInvoiceNo(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowInwardModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition">
                  Confirm Inward & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consume Modal */}
      {showConsumeModal && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Log Material Consumption</h3>
            <p className="text-xs text-zinc-400 mt-1">Item: {selectedMaterial.name} (Available: {selectedMaterial.currentBalance} {selectedMaterial.unit})</p>
            <form onSubmit={handleConsume} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Quantity Used</label>
                <input
                  type="number"
                  required
                  max={selectedMaterial.currentBalance}
                  value={consumeQty}
                  onChange={e => setConsumeQty(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Activity / Area Used</label>
                <input
                  type="text"
                  required
                  value={consumeReason}
                  onChange={e => setConsumeReason(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowConsumeModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition">
                  Deduct from Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Material Item to Catalog */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Add New Catalog Material</h3>
            <form onSubmit={handleAddNewMaterial} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kajaria 600x1200 Glazed Vitrified Tiles"
                  value={matName}
                  onChange={e => setMatName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={matCategory}
                    onChange={e => setMatCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  >
                    <option value="Civil">Civil</option>
                    <option value="Steel">Steel</option>
                    <option value="Finishes">Finishes</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Woodwork">Woodwork</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={matUnit}
                    onChange={e => setMatUnit(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Initial Qty</label>
                  <input
                    type="number"
                    value={matBalance}
                    onChange={e => setMatBalance(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={matThreshold}
                    onChange={e => setMatThreshold(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={matCost}
                    onChange={e => setMatCost(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddMaterialModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition">Add Material</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
