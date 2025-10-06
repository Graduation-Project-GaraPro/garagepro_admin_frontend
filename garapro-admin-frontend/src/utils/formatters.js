// utils/formatters.js
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  export const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };