import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '../common/ToastContainer';
import { SearchModal } from '../common/SearchModal';
import { NotificationsDrawer } from '../common/NotificationsDrawer';
import { AlertCircle, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDisclaimerBanner, setShowDisclaimerBanner] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B1020] text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#11192B] z-10">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Synthetic Demo Disclaimer Banner */}
        {showDisclaimerBanner && (
          <div className="bg-[#172238] border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-3.5 h-3.5 text-[#39D6C4] shrink-0" />
              <span className="truncate text-[11px]">
                <strong className="text-slate-100 font-semibold">SYNTHETIC DATA DEMO:</strong> Designed around a fictional national payer (Aegis Health Plan). All claims, providers, metrics, and models are synthetic estimates for portfolio demonstration. Not an official EXL operational system.
              </span>
            </div>
            <button
              onClick={() => setShowDisclaimerBanner(false)}
              className="text-slate-400 hover:text-slate-200 p-0.5 shrink-0"
              aria-label="Dismiss disclaimer banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <TopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Scrollable Viewport Frame */}
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Overlays & Feedback */}
      <SearchModal />
      <NotificationsDrawer />
      <ToastContainer />
    </div>
  );
};
