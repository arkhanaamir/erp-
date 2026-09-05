import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { ExpenseRecord, VendorItem } from '../types';
import {
  Receipt,
  Plus,
  IndianRupee,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Banknote,
  Send,
  Phone,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';

export const VendorPaymentsView: React.FC = () => {
  const {
    expenses,
    vendors,
    addExpense,
    settleVendorPayment,
    addVendor,
    activeProjectId,
    projects
  } = useCasabuild();

  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'vendors' | 'contractors'>('expenses');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState<VendorItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('25000');
  const [expCategory, setExpCategory] = useState<'Materials' | 'Labour' | 'Equipment' | 'Subcontractor' | 'Permits & Legal' | 'Site Overheads'>('Materials');
  const [expVendorId, setExpVendorId] = useState(vendors[0]?.id || '');
  const [expPaymentMode, setExpPaymentMode] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque'>('UPI');
  const [expInvoiceNo, setExpInvoiceNo] = useState('');

  // New Vendor Form State
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCat, setNewVendorCat] = useState('Cement & ReadyMix');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorGst, setNewVendorGst] = useState('');

  // Stats computation
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalVendorOutstanding = vendors.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  const totalVendorBilled = vendors.reduce((acc, curr) => acc + curr.totalBilled, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    const ven = vendors.find(v => v.id === expVendorId);

    addExpense({
      projectId: activeProjectId,
      title: expTitle,
      category: expCategory,
      amount: Number(expAmount),
      date: new Date().toISOString().split('T')[0],
      paidTo: ven?.name || 'Site Vendor',
      vendorId: expVendorId,
      paymentMode: expPaymentMode,
      status: 'Paid',
      invoiceNumber: expInvoiceNo || `INV-${Math.floor(1000 + Math.random() * 9000)}`
    });

    setShowAddExpenseModal(false);
    setExpTitle('');
    setExpAmount('25000');
  };

  const handleSettleVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForPayment || !paymentAmount) return;
    settleVendorPayment(
      selectedVendorForPayment.id,
      Number(paymentAmount),
      'UPI Transfer'
    );
    setSelectedVendorForPayment(null);
    setPaymentAmount('');
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName) return;
    addVendor({
      name: newVendorName,
      category: newVendorCat,
      contactPerson: newVendorContact || 'Operations Manager',
      phone: newVendorPhone || '+91 98111 22334',
      gstNumber: newVendorGst || '07AABCT1234F1Z5'
    });
    setShowAddVendorModal(false);
    setNewVendorName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 5
            </span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl font-['Outfit',sans-serif]">
              Vendors & Expense Management
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Supplier accounts, subcontractor ledgers, UPI / NEFT expense disbursements, and invoice compliance.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="finance-record-exp-btn"
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Record Expense</span>
          </button>
          <button
            id="finance-add-vendor-btn"
            onClick={() => setShowAddVendorModal(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
          >
            <Building2 className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Expenses Logged</span>
          <p className="mt-2 text-2xl font-extrabold text-zinc-100">
            ₹{(totalExpenses / 100000).toFixed(2)} Lakhs
          </p>
          <span className="text-[10px] text-zinc-500">Across all projects</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Supplier Outstanding</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400">
              ₹{(totalVendorOutstanding / 100000).toFixed(2)}L
            </span>
            <span className="text-[10px] text-zinc-400">Due within 30d</span>
          </div>
          <span className="text-[10px] text-zinc-500">UltraTech & Jindal Steel</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Billed Volume</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">
              ₹{(totalVendorBilled / 100000).toFixed(2)}L
            </span>
            <span className="text-[10px] text-zinc-400">Total POs</span>
          </div>
          <span className="text-[10px] text-zinc-500">GST verified vendors</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Active Suppliers</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-100">{vendors.length}</span>
            <span className="text-[10px] text-zinc-400">Partner Ledgers</span>
          </div>
          <span className="text-[10px] text-zinc-500">Materials & Trades</span>
        </div>
      </div>

      {/* Subtabs: Expenses vs Vendors Ledger */}
      <div className="flex space-x-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeSubTab === 'expenses'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
          }`}
        >
          Expense Vouchers ({expenses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('vendors')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeSubTab === 'vendors'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
          }`}
        >
          Vendor & Contractor Ledgers ({vendors.length})
        </button>
      </div>

      {/* View 1: Expense Vouchers List */}
      {activeSubTab === 'expenses' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 uppercase tracking-wider text-zinc-400 text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Date & Voucher</th>
                  <th className="py-3 px-4">Expense Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-200">{exp.date}</p>
                      <span className="text-[10px] text-zinc-500">{exp.invoiceNumber || 'VCH-AUTO'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-zinc-100">{exp.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-medium">
                      {exp.paidTo}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {exp.paymentMode}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-zinc-100">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        exp.status === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Vendor Ledgers */}
      {activeSubTab === 'vendors' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map(vendor => (
            <div key={vendor.id} className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl hover:border-zinc-700 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    {vendor.category}
                  </span>
                  <h4 className="mt-1.5 text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">{vendor.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Contact: {vendor.contactPerson} ({vendor.phone})</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-zinc-400">Total Billed</span>
                  <p className="font-bold text-zinc-100 mt-0.5">₹{(vendor.totalBilled / 100000).toFixed(2)}L</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-400">Total Paid</span>
                  <p className="font-bold text-emerald-400 mt-0.5">₹{(vendor.paidAmount / 100000).toFixed(2)}L</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] uppercase text-zinc-400 font-semibold">Pending Outstanding</span>
                  <span className="font-extrabold text-amber-400">
                    ₹{vendor.pendingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedVendorForPayment(vendor);
                    setPaymentAmount(String(vendor.pendingAmount));
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 py-2.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
                >
                  Settle Payment (Disburse)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Record Site Expense / Payment</h3>
            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., UltraTech 50 Bags Cement delivery batch 3"
                  value={expTitle}
                  onChange={e => setExpTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labour">Labour Wages</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Equipment">Equipment / Machinery</option>
                    <option value="Site Overheads">Site Overheads</option>
                    <option value="Permits & Legal">Permits & Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Payment Mode</label>
                  <select
                    value={expPaymentMode}
                    onChange={e => setExpPaymentMode(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Bank Transfer">NEFT / RTGS</option>
                    <option value="Cash">Cash (Petty Cash)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Invoice / Ref No</label>
                  <input
                    type="text"
                    placeholder="e.g., INV-8821"
                    value={expInvoiceNo}
                    onChange={e => setExpInvoiceNo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Paid To / Supplier</label>
                <select
                  value={expVendorId}
                  onChange={e => setExpVendorId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition">
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Vendor Modal */}
      {selectedVendorForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Disburse Vendor Payment</h3>
            <p className="text-xs text-zinc-400 mt-1">Vendor: {selectedVendorForPayment.name} (Pending: ₹{selectedVendorForPayment.pendingAmount.toLocaleString('en-IN')})</p>
            <form onSubmit={handleSettleVendor} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Disbursement Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setSelectedVendorForPayment(null)} className="px-3 py-1.5 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Register New Supplier / Contractor</h3>
            <form onSubmit={handleCreateVendor} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Company / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Asian Paints Commercial Distribution"
                  value={newVendorName}
                  onChange={e => setNewVendorName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Category / Trade</label>
                  <input
                    type="text"
                    value={newVendorCat}
                    onChange={e => setNewVendorCat(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newVendorContact}
                    onChange={e => setNewVendorContact(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newVendorPhone}
                    onChange={e => setNewVendorPhone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={newVendorGst}
                    onChange={e => setNewVendorGst(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddVendorModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition">Add Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
