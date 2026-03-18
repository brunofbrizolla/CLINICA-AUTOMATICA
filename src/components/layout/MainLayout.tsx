import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};
