'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { walletService } from '@/lib/services/wallet-service';
import { walletAuthService } from '@/lib/services/wallet-auth-service';

interface SignInFormProps {
  redirectUrl?: string;
  showTitle?: boolean;
}

export function SignInForm({ redirectUrl = '/dashboard', showTitle = true }: SignInFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to dashboard or specified URL
        router.push(redirectUrl);
      } else {
        setError(result.message || 'Sign in failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        {showTitle && (
          <>
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your sBTC payment gateway merchant account
            </CardDescription>
          </>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Business Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="merchant@yourcompany.com"
                className="pl-10 pr-4"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500">
              Use the email address you registered with your merchant account
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your secure password"
                className="pl-10 pr-12"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-600">Keep me signed in</span>
            </label>
            
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={loading || !formData.email || !formData.password}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Sign in to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        {/* Security Notice */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Your connection is secured with enterprise-grade encryption</span>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            New to sBTC payments?{' '}
            <Link 
              href="/auth/register" 
              className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
            >
              Create merchant account
            </Link>
          </p>
        </div>

        {/* Additional Links */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <Link href="/support" className="hover:text-gray-700 hover:underline">
            Need help?
          </Link>
          <span>•</span>
          <Link href="/docs" className="hover:text-gray-700 hover:underline">
            API Docs
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-gray-700 hover:underline">
            Contact Sales
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default SignInForm;
