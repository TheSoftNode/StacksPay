import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar placeholder */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          </div>
          <nav className="px-6 pb-6">
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm text-gray-600">Navigation</div>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}