// utils/formatters.js
export const formatCurrency = (value) => {
  // Đảm bảo value là số
  const num = Number(value);

  // Format với dấu chấm phân cách hàng nghìn, không thập phân
  const formatted = num.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  // Thêm ký hiệu 'đ' vào cuối
  return `${formatted}đ`;
};
  
  export const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };