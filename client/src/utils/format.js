export const formatCurrency = (value, currency = 'INR') => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const statusStyles = {
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  partial: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  pending: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const statusLabels = {
  paid: 'Paid',
  partial: 'Partial',
  pending: 'Pending',
};

export const methodLabels = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
};
