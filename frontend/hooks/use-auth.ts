import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api/auth-api';
import type { LoginRequest, RegisterRequest, WalletAuthRequest, WalletRegisterRequest } from '@/lib/api/auth-api';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, isAuthenticated, setUser, setLoading, setError, logout: storeLogout } = useAuthStore();

  // Get current user query
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated && !!localStorage.getItem('authToken'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Email/Password Login
  const loginWithEmailMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => apiClient.loginWithEmail(credentials),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      if (response.success && response.merchant) {
        setUser({
          id: response.merchant.id,
          name: response.merchant.name,
          email: response.merchant.email,
          stacksAddress: response.merchant.stacksAddress,
          emailVerified: response.merchant.emailVerified,
          verificationLevel: response.merchant.verificationLevel,
          businessType: response.merchant.businessType,
          walletConnected: !!response.merchant.stacksAddress,
        });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else {
        setError(response.error || 'Login failed');
      }
      setLoading(false);
    },
    onError: (error: any) => {
      setError(error.message || 'Login failed');
      setLoading(false);
    },
  });

  // Email/Password Registration
  const registerWithEmailMutation = useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.registerWithEmail(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      if (response.success && response.merchant) {
        setUser({
          id: response.merchant.id,
          name: response.merchant.name,
          email: response.merchant.email,
          stacksAddress: response.merchant.stacksAddress,
          emailVerified: response.merchant.emailVerified,
          verificationLevel: response.merchant.verificationLevel,
          businessType: response.merchant.businessType,
          walletConnected: !!response.merchant.stacksAddress,
        });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else {
        setError(response.error || 'Registration failed');
      }
      setLoading(false);
    },
    onError: (error: any) => {
      setError(error.message || 'Registration failed');
      setLoading(false);
    },
  });

  // Wallet Login
  const loginWithWalletMutation = useMutation({
    mutationFn: (walletData: WalletAuthRequest) => apiClient.loginWithWallet(walletData),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      if (response.success && response.merchant) {
        setUser({
          id: response.merchant.id,
          name: response.merchant.name,
          email: response.merchant.email,
          stacksAddress: response.merchant.stacksAddress,
          emailVerified: response.merchant.emailVerified,
          verificationLevel: response.merchant.verificationLevel,
          businessType: response.merchant.businessType,
          walletConnected: true,
        });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else {
        setError(response.error || 'Wallet login failed');
      }
      setLoading(false);
    },
    onError: (error: any) => {
      setError(error.message || 'Wallet login failed');
      setLoading(false);
    },
  });

  // Wallet Registration
  const registerWithWalletMutation = useMutation({
    mutationFn: (walletData: WalletRegisterRequest) => apiClient.registerWithWallet(walletData),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      if (response.success && response.merchant) {
        setUser({
          id: response.merchant.id,
          name: response.merchant.name,
          email: response.merchant.email,
          stacksAddress: response.merchant.stacksAddress,
          emailVerified: response.merchant.emailVerified,
          verificationLevel: response.merchant.verificationLevel,
          businessType: response.merchant.businessType,
          walletConnected: true,
        });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else {
        setError(response.error || 'Wallet registration failed');
      }
      setLoading(false);
    },
    onError: (error: any) => {
      setError(error.message || 'Wallet registration failed');
      setLoading(false);
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      storeLogout();
      queryClient.clear();
      router.push('/login');
    },
  });

  // Generate wallet challenge
  const generateWalletChallengeMutation = useMutation({
    mutationFn: ({ 
      address, 
      type, 
      paymentId, 
      amount 
    }: { 
      address: string; 
      type: 'connection' | 'payment'; 
      paymentId?: string; 
      amount?: number; 
    }) => apiClient.generateWalletChallenge(address, type, paymentId, amount),
  });

  // Verify wallet signature
  const verifyWalletSignatureMutation = useMutation({
    mutationFn: (walletData: WalletAuthRequest) => apiClient.verifyWalletSignature(walletData),
  });

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoadingUser || useAuthStore.getState().isLoading,
    error: useAuthStore.getState().error,

    // Email/Password Authentication
    loginWithEmail: loginWithEmailMutation.mutate,
    isLoginLoading: loginWithEmailMutation.isPending,
    loginError: loginWithEmailMutation.error,

    registerWithEmail: registerWithEmailMutation.mutate,
    isRegisterLoading: registerWithEmailMutation.isPending,
    registerError: registerWithEmailMutation.error,

    // Wallet Authentication
    loginWithWallet: loginWithWalletMutation.mutate,
    isWalletLoginLoading: loginWithWalletMutation.isPending,
    walletLoginError: loginWithWalletMutation.error,

    registerWithWallet: registerWithWalletMutation.mutate,
    isWalletRegisterLoading: registerWithWalletMutation.isPending,
    walletRegisterError: registerWithWalletMutation.error,

    // Wallet Challenge & Verification
    generateWalletChallenge: generateWalletChallengeMutation.mutate,
    isGeneratingChallenge: generateWalletChallengeMutation.isPending,
    challengeData: generateWalletChallengeMutation.data,

    verifyWalletSignature: verifyWalletSignatureMutation.mutate,
    isVerifyingSignature: verifyWalletSignatureMutation.isPending,
    verificationResult: verifyWalletSignatureMutation.data,

    // Logout
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    // Utilities
    clearError: useAuthStore.getState().clearError,
  };
};
