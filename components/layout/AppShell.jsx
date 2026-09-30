'use client';

import { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="content">{children}</main>
      </div>
    </>
  );
}