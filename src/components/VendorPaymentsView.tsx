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
  DollarSign,
  FileSpreadsheet,
  Ban,
  UserX,
  Edit3,
  Trash2,
  ShieldAlert,
  Lock,
  Check
} from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

export const VendorPaymentsView: React.FC = () => {
  const {
    expenses,
    vendors,
    addExpense,
    settleVendorPayment,
    addVendor,
    updateVendor,
    deleteVendor,
    toggleVendorBlacklist,
    toggleVendorDisabled,
    currentUser,
    activeProjectId,
    projects
  } = useCasabuild();

  const isOwner = currentUser?.role === 'owner' || currentUser?.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com';

  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'vendors' | 'contractors'>('expenses');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState<VendorItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Vendor Status Filter
  const [vendorFilter, setVendorFilter] = useState<'All' | 'Active' | 'Blacklisted' | 'Disabled'>('All');
  const [vendorSearch, setVendorSearch] = useState('');

  // Vendor Edit Modal (Owner Only)
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<VendorItem | null>(null);
  const [editVenName, setEditVenName] = useState('');
  const [editVenCat, setEditVenCat] = useState('');
  const [editVenContact, setEditVenContact] = useState('');
  const [editVenPhone, setEditVenPhone] = useState('');
  const [editVenGst, setEditVenGst] = useState('');

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
  const totalVendorOutstanding = vendors.reduce((acc, curr) => acc + (curr.pendingAmount ?? curr.balanceOutstanding ?? 0), 0);
  const totalVendorBilled = vendors.reduce((acc, curr) => acc + curr.totalBilled, 0);

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.phone.includes(vendorSearch);
    const matchesFilter =
      vendorFilter === 'All' ? true :
      vendorFilter === 'Blacklisted' ? !!v.isBlacklisted :
      vendorFilter === 'Disabled' ? !!v.disabled :
      !v.isBlacklisted && !v.disabled;
    return matchesSearch && matchesFilter;
  });

  const handleOpenVendorEdit = (v: VendorItem) => {
    setSelectedVendorForEdit(v);
    setEditVenName(v.name);
    setEditVenCat(v.category);
    setEditVenContact(v.contactPerson);
    setEditVenPhone(v.phone);
    setEditVenGst(v.gstNumber || v.gstin || '');
  };

  const handleSaveVendorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForEdit || !isOwner) return;

    updateVendor(selectedVendorForEdit.id, {
      name: editVenName.trim(),
      category: editVenCat.trim(),
      contactPerson: editVenContact.trim(),
      phone: editVenPhone.trim(),
      gstNumber: editVenGst.trim()
    });

    setSelectedVendorForEdit(prev => prev ? {
      ...prev,
      name: editVenName.trim(),
      category: editVenCat.trim(),
      contactPerson: editVenContact.trim(),
      phone: editVenPhone.trim(),
      gstNumber: editVenGst.trim()
    } : null);
  };

  const handleToggleVendorBlacklist = (v: VendorItem) => {
    if (!isOwner) {
      alert('Blacklisting vendors, contractors, and suppliers can only be performed by Managing Owner Ar. Aamir Khan.');
      return;
    }

    if (v.isBlacklisted) {
      if (window.confirm(`Restore ${v.name} from the blacklist back to active partner status?`)) {
        toggleVendorBlacklist(v.id);
        if (selectedVendorForEdit?.id === v.id) {
          setSelectedVendorForEdit(prev => prev ? { ...prev, isBlacklisted: false, blacklistReason: undefined } : null);
        }
      }
    } else {
      const reason = window.prompt(`Enter reason for blacklisting ${v.name}:`, 'Quality default / delivery delays / financial irregularity');
      if (reason !== null) {
        toggleVendorBlacklist(v.id, reason || 'Blacklisted by Managing Owner');
        if (selectedVendorForEdit?.id === v.id) {
          setSelectedVendorForEdit(prev => prev ? { ...prev, isBlacklisted: true, blacklistReason: reason || 'Blacklisted by Managing Owner' } : null);
        }
      }
    }
  };

  const handleToggleVendorDisabled = (v: VendorItem) => {
    if (!isOwner) {
      alert('Disabling vendor accounts can only be performed by Managing Owner Ar. Aamir Khan.');
      return;
    }
    toggleVendorDisabled(v.id);
    if (selectedVendorForEdit?.id === v.id) {
      setSelectedVendorForEdit(prev => prev ? { ...prev, disabled: !prev.disabled } : null);
    }
  };

  const handleDeleteVendor = (v: VendorItem) => {
    if (!isOwner) {
      alert('Deleting vendor profiles is strictly restricted to Managing Owner Ar. Aamir Khan.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete supplier account for "${v.name}"?`)) {
      deleteVendor(v.id);
      setSelectedVendorForEdit(null);
    }
  };

  const handleExportExpenses = () => {
    const headers = [
      'Voucher / ID',
      'Expense Date',
      'Expense Title',
      'Category',
      'Paid To Entity',
      'Payment Mode',
      'Amount (INR)',
      'Invoice / Ref No',
      'Payment Status'
    ];
    const rows = expenses.map(e => [
      e.id,
      e.date,
      e.title || e.category || 'Site Expense',
      e.category,
      e.paidTo || e.vendorPayee,
      e.paymentMode,
      e.amount,
      e.invoiceNumber || e.receiptNumber || 'N/A',
      e.status
    ]);
    exportToExcel('casabuild_expense_disbursements', headers, rows);
  };

  const handleExportVendors = () => {
    const headers = [
      'Vendor ID',
      'Company / Vendor Name',
      'Category / Trade',
      'Contact Person',
      'Phone Number',
      'GSTIN Number',
      'Total Billed Amount (INR)',
      'Total Paid Amount (INR)',
      'Pending Outstanding (INR)',
      'Blacklisted Flag',
      'Blacklist Reason',
      'Account Profile Status'
    ];
    const rows = vendors.map(v => [
      v.id,
      v.name,
      v.category,
      v.contactPerson,
      v.phone,
      v.gstNumber || v.gstin || 'N/A',
      v.totalBilled,
      v.paidAmount ?? v.totalPaid ?? 0,
      v.pendingAmount ?? v.balanceOutstanding ?? 0,
      v.isBlacklisted ? 'YES' : 'NO',
      v.blacklistReason || 'N/A',
      v.disabled ? 'Disabled' : 'Active'
    ]);
    exportToExcel('casabuild_vendors_contractors_ledger', headers, rows);
  };

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="finance-export-expenses-btn"
            onClick={handleExportExpenses}
            className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
            title="Export full disbursement vouchers log to Microsoft Excel / CSV"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Expenses</span>
          </button>

          <button
            id="finance-export-vendors-btn"
            onClick={handleExportVendors}
            className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
            title="Export vendor, supplier & contractor ledgers to Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export Ledgers</span>
          </button>

          <button
            id="finance-record-exp-btn"
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
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
            <span className="text-2xl font-extrabold text-zinc-100">{vendors?.length || 0}</span>
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
          Expense Vouchers ({expenses?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('vendors')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeSubTab === 'vendors'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
          }`}
        >
          Vendor & Contractor Ledgers ({vendors?.length || 0})
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
                      <span className="text-[10px] text-zinc-500">{exp.invoiceNumber || exp.receiptNumber || 'VCH-AUTO'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-zinc-100">{exp.title || exp.category || 'Site Expense'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-medium">
                      {exp.paidTo || exp.vendorPayee}
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
        <div className="space-y-4">
          {/* Vendor Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search supplier, contact, phone..."
                  value={vendorSearch}
                  onChange={e => setVendorSearch(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="inline-flex rounded-xl bg-zinc-900 p-0.5 border border-zinc-800 text-xs">
                <button
                  onClick={() => setVendorFilter('All')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    vendorFilter === 'All' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All ({vendors?.length || 0})
                </button>
                <button
                  onClick={() => setVendorFilter('Active')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    vendorFilter === 'Active' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setVendorFilter('Blacklisted')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    vendorFilter === 'Blacklisted' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Blacklisted ({(vendors || []).filter(v => v?.isBlacklisted).length})
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-400">
              Showing <span className="font-semibold text-zinc-200">{filteredVendors?.length || 0}</span> suppliers & subcontractors
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map(vendor => (
              <div
                key={vendor.id}
                className={`rounded-2xl border bg-[#161922] p-5 shadow-xl transition flex flex-col justify-between ${
                  vendor.isBlacklisted
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : vendor.disabled
                    ? 'border-zinc-800 opacity-60'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                          {vendor.category}
                        </span>
                        {vendor.isBlacklisted && (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-500/30">
                            BLACKLISTED
                          </span>
                        )}
                        {vendor.disabled && (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400 border border-zinc-700">
                            DISABLED
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1.5 text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">{vendor.name}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Contact: {vendor.contactPerson} ({vendor.phone})</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">GSTIN: {vendor.gstNumber || vendor.gstin || 'N/A'}</p>
                    </div>

                    <button
                      onClick={() => handleOpenVendorEdit(vendor)}
                      className="rounded-xl border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition shrink-0"
                      title="Manage supplier account and contact details"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {vendor.isBlacklisted && (
                    <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-300 flex items-start space-x-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
                      <span>{vendor.blacklistReason || 'Suspended from purchase orders and site access.'}</span>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-zinc-400">Total Billed</span>
                      <p className="font-bold text-zinc-100 mt-0.5">₹{(vendor.totalBilled / 100000).toFixed(2)}L</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-zinc-400">Total Paid</span>
                      <p className="font-bold text-emerald-400 mt-0.5">₹{(((vendor.paidAmount ?? vendor.totalPaid ?? 0)) / 100000).toFixed(2)}L</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] uppercase text-zinc-400 font-semibold">Pending Outstanding</span>
                      <span className="font-extrabold text-amber-400">
                        ₹{(vendor.pendingAmount ?? vendor.balanceOutstanding ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedVendorForPayment(vendor);
                      setPaymentAmount(String(vendor.pendingAmount ?? vendor.balanceOutstanding ?? 0));
                    }}
                    disabled={vendor.isBlacklisted || vendor.disabled}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Settle Payment
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => handleToggleVendorBlacklist(vendor)}
                      className={`p-2 rounded-xl border text-xs transition shrink-0 ${
                        vendor.isBlacklisted
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      }`}
                      title={vendor.isBlacklisted ? 'Clear from Blacklist' : 'Add to Blacklist'}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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

      {/* Vendor Profile & Governance Modal (Owner Editing, Blacklist, Disable & Delete) */}
      {selectedVendorForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100 my-8">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    {selectedVendorForEdit.category}
                  </span>
                  {selectedVendorForEdit.isBlacklisted && (
                    <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                      BLACKLISTED
                    </span>
                  )}
                  {selectedVendorForEdit.disabled && (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 border border-zinc-700">
                      DISABLED
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">
                  {selectedVendorForEdit.name}
                </h3>
                <p className="text-xs text-zinc-400">Account ID: {selectedVendorForEdit.id}</p>
              </div>

              <button
                onClick={() => setSelectedVendorForEdit(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Blacklist Warning */}
            {selectedVendorForEdit.isBlacklisted && (
              <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-bold">Blacklisted Contractor / Supplier:</span>
                  <p className="mt-0.5 text-[11px] text-rose-300/80">
                    {selectedVendorForEdit.blacklistReason || 'Suspended from purchase orders and site payments.'}
                  </p>
                </div>
              </div>
            )}

            {/* Owner vs Non-Owner Access Note */}
            {!isOwner && (
              <div className="mt-3 flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs text-zinc-400">
                <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Contact details modification, blacklisting, and profile deletion are restricted to Managing Owner Ar. Aamir Khan.</span>
              </div>
            )}

            {/* Edit Details Form (Owner) or Read-Only Summary (Staff) */}
            {isOwner ? (
              <form onSubmit={handleSaveVendorEdit} className="mt-4 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                  <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Profile & Contact Details</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">Owner Access Granted</span>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Company / Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={editVenName}
                    onChange={e => setEditVenName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Trade / Category</label>
                    <input
                      type="text"
                      required
                      value={editVenCat}
                      onChange={e => setEditVenCat(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={editVenGst}
                      onChange={e => setEditVenGst(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Contact Person</label>
                    <input
                      type="text"
                      required
                      value={editVenContact}
                      onChange={e => setEditVenContact(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editVenPhone}
                      onChange={e => setEditVenPhone(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-zinc-950 hover:bg-amber-400 shadow transition"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Save Contact Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-2 rounded-xl bg-zinc-900/60 p-4 text-xs border border-zinc-800">
                <div className="flex justify-between py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Contact Person</span>
                  <span className="font-semibold text-zinc-100">{selectedVendorForEdit.contactPerson}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Phone Number</span>
                  <span className="font-semibold text-zinc-100">{selectedVendorForEdit.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-400">GSTIN</span>
                  <span className="font-mono text-zinc-100">{selectedVendorForEdit.gstNumber || selectedVendorForEdit.gstin || 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Financial Ledger Snapshot */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-zinc-900/60 p-3 text-xs border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Total Billed</span>
                <p className="font-bold text-zinc-100 mt-0.5">₹{selectedVendorForEdit.totalBilled.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Total Paid</span>
                <p className="font-bold text-emerald-400 mt-0.5">₹{(selectedVendorForEdit.paidAmount ?? selectedVendorForEdit.totalPaid ?? 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Pending Due</span>
                <p className="font-bold text-amber-400 mt-0.5">₹{(selectedVendorForEdit.pendingAmount ?? selectedVendorForEdit.balanceOutstanding ?? 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Owner Governance Controls */}
            {isOwner && (
              <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Owner Administrative Governance
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleToggleVendorBlacklist(selectedVendorForEdit)}
                    className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedVendorForEdit.isBlacklisted
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        : 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                    }`}
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>{selectedVendorForEdit.isBlacklisted ? 'Remove Blacklist' : 'Blacklist Supplier'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleVendorDisabled(selectedVendorForEdit)}
                    className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition"
                  >
                    <UserX className="h-3.5 w-3.5 text-amber-400" />
                    <span>{selectedVendorForEdit.disabled ? 'Enable Account' : 'Disable Account'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteVendor(selectedVendorForEdit)}
                    className="flex items-center space-x-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition ml-auto"
                    title="Permanently remove vendor profile"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
