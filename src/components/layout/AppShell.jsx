import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import './AppShell.css';

/**
 * AppShell container for authenticated portal views
 * Coordinates Sidebar (desktop), Topbar, and MobileNav drawer.
 */
export function AppShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="app-shell__body">
        <Topbar onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)} />
        <main className="app-shell__content" id="app-main-content">
          {children}
        </main>
      </div>

      {/* Mobile Slide-in Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}

export default AppShell;
