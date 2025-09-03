// Test page for wallet authentication
'use client';

import { WalletAuthDemo } from '@/components/auth/WalletAuthDemo';

export default function WalletTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            StacksPay Wallet Authentication Test
          </h1>
          <p className="text-gray-600">
            Test the frontend wallet authentication integration with backend
          </p>
        </div>
        
        <WalletAuthDemo />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This demo connects your Stacks wallet and authenticates with the StacksPay backend.
            <br />
            Make sure your backend is running on localhost:4000
          </p>
        </div>
      </div>
    </div>
  );
}
