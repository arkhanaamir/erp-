import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { InteriorSelectionItem } from '../types';
import { exportToExcel } from '../utils/excelExport';
import {
  Palette,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ThumbsUp,
  Image,
  Layers,
  Sparkles,
  ExternalLink,
  FileSpreadsheet
} from 'lucide-react';

export const InteriorSelectionView: React.FC = () => {
  const { interiorSelections, updateInteriorSelection, activeProject, currentRole } = useCasabuild();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<InteriorSelectionItem | null>(null);

  const categories = ['All', 'Kitchen', 'Wardrobes', 'Paint', 'Sanitaryware', 'Flooring', 'Lighting'];

  const filteredItems = interiorSelections.filter(item => {
    return categoryFilter === 'All' || item.category === categoryFilter;
  });

  const handleExportFinishes = () => {
    const headers = [
      'Selection Item ID',
      'Category',
      'Finish / Fixture Name',
      'Brand & Specifications',
      'Selected Option / Shade Code',
      'Approval Status',
      'Client Feedback / Notes'
    ];
    const rows = interiorSelections.map(item => [
      item.id,
      item.category,
      item.name,
      item.specifications,
      item.selectedOption,
      item.status,
      item.clientFeedback || 'No feedback'
    ]);
    exportToExcel(`casabuild_interior_finishes_schedule`, headers, rows);
  };

  const handleStatusChange = (id: string, newStatus: 'Pending' | 'Approved' | 'Revision Requested' | 'Ordered') => {
    updateInteriorSelection(id, {
      status: newStatus,
      clientFeedback: newStatus === 'Approved' ? 'Approved by client via Casabuild portal.' : 'Revision requested on color shade.'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 8
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-['Outfit',sans-serif]">
              Interior Selections & Material Finishes
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Interactive client approval hub for Kitchen Tiles, Wardrobe Laminates, Asian Paints shades, Grohe sanitaryware, and Italian marbles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportFinishes}
            className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
            title="Export full finishes schedule to Excel"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Finishes (Excel)</span>
          </button>

          <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-3 py-1 text-xs font-semibold border border-emerald-500/30">
            {(interiorSelections || []).filter(i => i?.status === 'Approved').length} / {interiorSelections?.length || 0} Approved
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-xl px-3.5 py-1.5 font-medium transition ${
              categoryFilter === cat
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selections Grid (Matches Video Blueprint: Kitchen Tiles, Wardrobe Laminate, Wall Paint, Grohe Sanitary fittings) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="group rounded-2xl border border-zinc-800 bg-[#161922] overflow-hidden transition hover:border-amber-500/40 shadow-xl"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
              <img
                src={item.imageUrl}
                alt={item.item}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="absolute top-2.5 left-2.5 rounded-lg bg-zinc-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-zinc-700">
                {item.category}
              </span>
              <span className={`absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                item.status === 'Approved'
                  ? 'bg-emerald-500/80 text-white border-emerald-400/50'
                  : item.status === 'Ordered'
                  ? 'bg-blue-500/80 text-white border-blue-400/50'
                  : item.status === 'Revision Requested'
                  ? 'bg-red-500/80 text-white border-red-400/50'
                  : 'bg-amber-500/80 text-zinc-950 border-amber-300/50'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h4 className="text-base font-bold text-zinc-100 group-hover:text-amber-300 transition">
                  {item.item}
                </h4>
                <p className="text-xs font-medium text-amber-400 mt-0.5">
                  Brand / Spec: {item.brand}
                </p>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.specifications}
                </p>
              </div>

              {item.clientFeedback && (
                <div className="rounded-xl bg-zinc-900/80 p-2.5 text-[11px] text-zinc-300 border border-zinc-800">
                  <span className="font-bold text-zinc-400">Client Feedback: </span>
                  {item.clientFeedback}
                </div>
              )}

              {/* Approval controls (Client or Architect or Owner) */}
              <div className="flex space-x-2 pt-2 border-t border-zinc-800 text-xs">
                <button
                  onClick={() => handleStatusChange(item.id, 'Approved')}
                  className={`flex-1 rounded-xl py-2 font-semibold transition flex items-center justify-center space-x-1 ${
                    item.status === 'Approved'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, 'Revision Requested')}
                  className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 px-3 py-2 text-zinc-300 hover:text-white transition"
                >
                  Revise
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, 'Ordered')}
                  className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 px-3 py-2 text-zinc-300 hover:text-white transition"
                >
                  Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
