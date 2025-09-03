// Demo component to test wallet authentication with backend
'use client';

import React, { useState } from 'react';
import { useWalletAuth } from '@/hooks/use-wallet-auth';
import { useAuthStore } from '@/stores/auth-store';

export const WalletAuthDemo: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    register,
    login,
    verifyPayment,
    isRegistering,
    isLoggingIn,
    isVerifyingPayment,
    registerError,
    loginError,
    verifyPaymentError,
    walletStatus,
    disconnectWallet,
  } = useWalletAuth();

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('ecommerce');
  const [email, setEmail] = useState('');

  const handleRegister = () => {
    if (!businessName.trim()) {
      alert('Please enter a business name');
      return;
    }
    register({ businessName, businessType, email: email || undefined });
  };

  const handleLogin = () => {
    login();
  };

  const handleVerifyPayment = () => {
    // Demo payment verification
    verifyPayment({ 
      paymentId: 'demo-payment-' + Date.now(), 
      amount: 100 
    });
  };

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          ✅ Wallet Connected!
        </h2>
        
        <div className="space-y-3 mb-6">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Stacks Address:</strong> {user.stacksAddress}</p>
          <p><strong>Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
          <p><strong>Level:</strong> {user.verificationLevel}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerifyPayment}
            disabled={isVerifyingPayment}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isVerifyingPayment ? 'Verifying...' : 'Test Payment Verification'}
          </button>

          <button
            onClick={disconnectWallet}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Disconnect Wallet
          </button>
        </div>

        {verifyPaymentError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Payment Error: {verifyPaymentError.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        StacksPay Wallet Auth
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Type *
          </label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ecommerce">E-commerce</option>
            <option value="retail">Retail</option>
            <option value="service">Service</option>
            <option value="nonprofit">Non-profit</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleRegister}
          disabled={isRegistering}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isRegistering ? 'Registering...' : 'Register with Wallet'}
        </button>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoggingIn ? 'Logging in...' : 'Login with Wallet'}
        </button>
      </div>

      {registerError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Register Error: {registerError.message}
        </div>
      )}

      {loginError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Login Error: {loginError.message}
        </div>
      )}

      {walletStatus && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Wallet Status: {walletStatus.isConnected ? 'Connected' : 'Disconnected'}
        </div>
      )}
    </div>
  );
};
