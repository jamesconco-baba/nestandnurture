export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateReference() {
  return `NN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
