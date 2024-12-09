export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
} 


export const formatMetric = (value, formatter = (v) => v) => {
  if (value === undefined || value === null) return '0';
  if (typeof value === 'number' && isNaN(value)) return '0';
  return formatter(value);
};