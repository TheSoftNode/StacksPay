import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar will go here */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            {/* Navigation menu will go here */}
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
