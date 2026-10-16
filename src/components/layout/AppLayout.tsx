import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { cn } from '@/lib/utils';
import { isDemoModeEnabled, setDemoModeEnabled, api } from '@/lib/api';
import { Radio, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const isDemo = isDemoModeEnabled();

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col font-sans text-[#101828]">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main App Container */}
      <div
        className={cn(
          'flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out',
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Topbar
          onMobileMenuToggle={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Demo Mode Notice Banner */}
        {isDemo && !bannerDismissed && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2.5 text-amber-900">
            <div className="flex items-center gap-2 overflow-hidden">
              <Radio className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
              <span className="truncate">
                <strong>Демо-режим активен (Jana Post Hackathon Edition):</strong> данные изолированы локально в браузере. Все изменения сохраняются.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  api.demo.resetData();
                  window.location.reload();
                }}
                className="text-amber-800 hover:text-amber-950 underline text-[11px] font-medium"
                title="Сбросить все тестовые изменения в демо-данных"
              >
                Сбросить демо-данные
              </button>
              <button
                onClick={() => setDemoModeEnabled(false)}
                className="font-bold text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-950 transition-colors"
              >
                Подключить Live API →
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1 rounded text-amber-700 hover:text-amber-900"
                title="Скрыть уведомление"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
