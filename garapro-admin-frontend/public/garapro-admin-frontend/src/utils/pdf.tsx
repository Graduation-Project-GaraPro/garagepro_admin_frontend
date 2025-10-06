"use client";

import React, { forwardRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Hàm tạo PDF từ HTML
export const generatePdfFromHtml = async (htmlContent: string, fileName: string): Promise<void> => {
  try {
    // Tạo một div tạm thời để chứa HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    // Sử dụng html2canvas để chuyển đổi HTML thành canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Tăng độ phân giải
      useCORS: true, // Cho phép tải hình ảnh từ các domain khác
      logging: false, // Tắt log để tránh spam console
    });
    
    // Xóa div tạm thời
    document.body.removeChild(tempDiv);
    
    // Tính toán kích thước PDF (A4)
    const imgWidth = 210; // mm
    const pageHeight = 297; // mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Tạo PDF với định dạng A4
    const pdf = new jsPDF("p", "mm", "a4");
    
    // Thêm canvas vào PDF
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Thêm trang mới nếu nội dung quá dài
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Tải xuống PDF
    pdf.save(fileName);
  } catch (error) {
    console.error("Lỗi khi tạo PDF:", error);
    throw error;
  }
};


interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceProps {
  brand?: string;
  contact?: string;
  code: string;
  date: string;
  customerName: string;
  vehicle: string;
  licensePlate: string;
  address: string;
  phone: string;
  items: InvoiceItem[];
  taxRate?: number;
  total: number;
}

// forwardRef để html2canvas có thể lấy node DOM
const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(
  (
    {
      brand = "Garage PRO",
      contact = "Hotline: 1900 123 456 • Email: support@garagepro.com",
      code,
      date,
      customerName,
      vehicle,
      licensePlate,
      address,
      phone,
      items,
      taxRate = 0,
      total,
    },
    ref
  ) => {
    const tax = total * taxRate;
    const grandTotal = total + tax;

    return (
      <div
        ref={ref}
        className="bg-white text-black p-6 w-[210mm] min-h-[297mm] mx-auto"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{brand}</h1>
          <p className="text-sm">{contact}</p>
          <h2 className="text-xl font-semibold mt-4">INVOICE</h2>
        </div>

        {/* Info */}
        <div className="mb-4">
          <p>
            <strong>Invoice Code:</strong> {code}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
        </div>

        {/* Customer Info */}
        <div className="mb-4">
          <h3 className="font-semibold">Customer Information</h3>
          <p>
            <strong>Name:</strong> {customerName}
          </p>
          <p>
            <strong>Vehicle:</strong> {vehicle}
          </p>
          <p>
            <strong>License Plate:</strong> {licensePlate}
          </p>
          <p>
            <strong>Address:</strong> {address}
          </p>
          <p>
            <strong>Phone:</strong> {phone}
          </p>
        </div>

        {/* Items */}
        <table className="w-full border-collapse border border-gray-400 mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-400 px-2 py-1">Item</th>
              <th className="border border-gray-400 px-2 py-1">Quatity</th>
              <th className="border border-gray-400 px-2 py-1">Price</th>
              <th className="border border-gray-400 px-2 py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-gray-400 px-2 py-1">{item.name}</td>
                <td className="border border-gray-400 px-2 py-1">
                  {item.quantity}
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  ${item.price.toFixed(2)}
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="text-right">
          <p>
            <strong>Subtotal:</strong> ${total.toFixed(2)}
          </p>
          <p>
            <strong>Tax ({(taxRate * 100).toFixed(0)}%):</strong> ${tax.toFixed(2)}
          </p>
          <p className="text-lg font-bold">
            <strong>Total:</strong> ${grandTotal.toFixed(2)}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm">
          <p>Thank you for choosing {brand}!</p>
        </div>
      </div>
    );
  }
);

Invoice.displayName = "Invoice";
export default Invoice;
