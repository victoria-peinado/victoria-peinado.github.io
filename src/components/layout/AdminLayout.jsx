// src/components/layout/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-100">
      {/* The Sidebar */}
      <AdminSidebar />
      
      {/* The Main Content Area */}
      <main className="flex-grow p-8">
        {/* The content from the specific page (e.g., AdminDashboard) 
            will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}