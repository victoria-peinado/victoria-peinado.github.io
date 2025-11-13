import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * A "kiosk mode" layout component that has NO Navbar.
 * Used for fullscreen pages like the StreamPage.
 */
export default function KioskLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}