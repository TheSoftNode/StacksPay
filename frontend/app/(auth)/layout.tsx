import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            sBTC Payment Gateway
          </h1>
          <p className="text-gray-600">
            Enterprise-grade Bitcoin payments on Stacks
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}