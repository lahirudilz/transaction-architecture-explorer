import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main-area">
        <TopNav />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
