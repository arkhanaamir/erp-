/**
 * The Casabuild ERP v3.0
 * Architecture | Interiors | Construction
 * Unified Enterprise Construction & Design Management Software
 */

import React, { useState } from 'react';
import { CasabuildProvider, useCasabuild } from './context/CasabuildContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProjectManagementView } from './components/ProjectManagementView';
import { DailySiteReportView } from './components/DailySiteReportView';
import { LabourAttendanceView } from './components/LabourAttendanceView';
import { MaterialInventoryView } from './components/MaterialInventoryView';
import { VendorPaymentsView } from './components/VendorPaymentsView';
import { QuoteGeneratorView } from './components/QuoteGeneratorView';
import { SitePhotosView } from './components/SitePhotosView';
import { InteriorSelectionView } from './components/InteriorSelectionView';
import { ClientPortalView } from './components/ClientPortalView';
import { ReportsCenterView } from './components/ReportsCenterView';
import { QuickActionModal } from './components/QuickActionModal';
import { LoginView } from './components/LoginView';
import {
  Menu,
  LayoutDashboard,
  ClipboardCheck,
  Users2,
  Boxes,
  Plus
} from 'lucide-react';

function CasabuildMainApp() {
  const { currentUser, currentRole, setRole } = useCasabuild();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // If switched to client role, ensure they see client portal or safe view
  React.useEffect(() => {
    if (currentUser && currentRole === 'client' && currentTab !== 'client-portal' && currentTab !== 'photos' && currentTab !== 'selections') {
      setCurrentTab('client-portal');
    }
  }, [currentUser, currentRole, currentTab]);

  // If user is not authenticated, show Login & Predefined Role Portal
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#0d0f15] text-zinc-100 font-['Outfit',sans-serif] antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header Navbar */}
      <div className="px-3 pt-3 sm:px-6 sm:pt-4 max-w-[1600px] mx-auto">
        <Navbar
          onOpenQuickAction={() => setQuickActionOpen(true)}
          onNavigateToTab={(tab) => setCurrentTab(tab)}
        />
      </div>

      {/* Main Workspace Frame */}
      <div className="mx-auto flex max-w-[1600px] min-h-[calc(100vh-5.5rem)] px-3 py-4 sm:px-6 sm:py-5 gap-6">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Primary Content Screen */}
        <main className="flex-1 overflow-y-auto min-w-0 pb-24 lg:pb-8">
          {/* Mobile Top Bar for Hamburger & Current View Title */}
          <div className="mb-4 flex items-center justify-between lg:hidden border border-zinc-800 bg-[#161922] rounded-xl p-3 shadow-lg">
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center space-x-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-zinc-200 hover:text-white transition"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Menu</span>
            </button>

            <span className="text-xs font-bold text-amber-400 capitalize px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
              {currentTab.replace('-', ' ')}
            </span>
          </div>

          {/* Module Views */}
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenQuickAction={() => setQuickActionOpen(true)}
            />
          )}
          {currentTab === 'projects' && <ProjectManagementView />}
          {currentTab === 'daily-reports' && <DailySiteReportView />}
          {currentTab === 'labour' && <LabourAttendanceView />}
          {currentTab === 'inventory' && <MaterialInventoryView />}
          {currentTab === 'finance' && <VendorPaymentsView />}
          {currentTab === 'boq-quotes' && <QuoteGeneratorView />}
          {currentTab === 'photos' && <SitePhotosView />}
          {currentTab === 'selections' && <InteriorSelectionView />}
          {currentTab === 'client-portal' && (
            <ClientPortalView
              onNavigateToSelections={() => setCurrentTab('selections')}
              onNavigateToPhotos={() => setCurrentTab('photos')}
            />
          )}
          {currentTab === 'reports' && <ReportsCenterView />}
        </main>
      </div>

      {/* Mobile Sticky Bottom Fast-Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-zinc-800 bg-[#12151d] px-2 py-2 lg:hidden shadow-2xl">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            currentTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="h-4 w-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('daily-reports')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            currentTab === 'daily-reports' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ClipboardCheck className="h-4 w-4 mb-0.5" />
          <span>DSR</span>
        </button>

        <button
          onClick={() => setQuickActionOpen(true)}
          className="flex h-11 w-11 -mt-5 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 shadow-xl shadow-amber-500/30 hover:bg-amber-400 transition"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setCurrentTab('labour')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            currentTab === 'labour' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users2 className="h-4 w-4 mb-0.5" />
          <span>Labour</span>
        </button>

        <button
          onClick={() => setCurrentTab('inventory')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            currentTab === 'inventory' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Boxes className="h-4 w-4 mb-0.5" />
          <span>Stock</span>
        </button>
      </div>

      {/* Quick Action Overlay Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CasabuildProvider>
      <CasabuildMainApp />
    </CasabuildProvider>
  );
}
