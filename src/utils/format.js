export const formatCurrency = (value = 0, currency = 'INR') => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

export const formatDate = (value, options = {}) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
};

export const titleCase = (value = '') => value.toLowerCase().replace(/(^|\s|_)(\w)/g, (_, prefix, letter) => `${prefix === '_' ? ' ' : prefix}${letter.toUpperCase()}`);

export const statusColor = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'secondary',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  PAID: 'success',
  REFUNDED: 'info',
  FAILED: 'error',
};
