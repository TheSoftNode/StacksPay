'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface EmailVerificationBannerProps {
  user: {
    emailVerified: boolean;
    email: string;
  };
}

export default function EmailVerificationBanner({ user }: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resendVerificationEmail, isResendingVerification, resendVerificationError } = useAuth();

  // Don't show if email is verified or banner is dismissed
  if (user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendVerification = () => {
    console.log('Attempting to resend verification email to:', user.email);
    resendVerificationEmail(user.email);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 5000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500"
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Email Verification Required
                </h3>
                <div className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  <p>
                    Please verify your email address ({user.email}) to unlock all features. 
                    Check your inbox for the verification email.
                  </p>
                  {emailSent && !resendVerificationError && (
                    <p className="mt-2 text-green-700 dark:text-green-300 font-medium">
                      Verification email sent successfully! Check your inbox.
                    </p>
                  )}
                  {resendVerificationError && (
                    <p className="mt-2 text-red-700 dark:text-red-300 font-medium">
                      {resendVerificationError.message || 'Failed to resend email'}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex space-x-3">
                  <Button
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                    variant="outline"
                    className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-600"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {isResendingVerification ? 'Sending...' : 'Resend Email'}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}