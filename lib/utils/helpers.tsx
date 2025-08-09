import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'BTC') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'BTC' ? 'USD' : currency,
    minimumFractionDigits: currency === 'BTC' ? 8 : 2,
  }).format(amount);
}

export function truncateAddress(address: string, length = 6) {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
