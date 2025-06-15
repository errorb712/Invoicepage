
export const formatCurrency = (amount, currencyCode = 'MYR', minimumFractionDigits = 2) => {
  const localeMap = {
    'USD': 'en-US',
    'MYR': 'ms-MY',
    'INR': 'en-IN'
  };
  
  const locale = localeMap[currencyCode] || 'en-US';
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits 
  }).format(amount);
};

export const getCurrencySymbol = (currencyCode) => {
  return formatCurrency(0, currencyCode).replace(/[\d.,\s]/g, '');
};

export const getCurrencyOptions = () => [
  { value: 'MYR', label: 'MYR (RM)', symbol: 'RM' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' }
];
