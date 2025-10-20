const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF',
  minimumFractionDigits: 0,
});

export function formatCurrency(value) {
  const number = Number(value ?? 0);
  return formatter.format(number);
}

export function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function normalizeStatus(status) {
  switch (status) {
    case 'out_of_stock':
      return 'Out of stock';
    case 'low_stock':
      return 'Low stock';
    case 'in_stock':
    default:
      return 'In stock';
  }
}

export function formatUnits(value) {
  const number = Number(value ?? 0);
  return `${number} Packets`;
}
