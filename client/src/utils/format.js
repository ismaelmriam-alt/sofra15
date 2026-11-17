export const money = (n) => `$${Number(n || 0).toFixed(2)}`;
export const formatDate = (d) =>
  new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
