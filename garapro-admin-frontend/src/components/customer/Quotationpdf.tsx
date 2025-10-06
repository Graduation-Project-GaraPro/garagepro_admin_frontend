"use client";

import React, { forwardRef } from "react";

interface QuotationPdfProps {
  brand: string;
  contact: string;
  code: number;
  date: string;
  vehicle: string;
  licensePlate: string;
  issue: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
}

const QuotationPdf = forwardRef<HTMLDivElement, QuotationPdfProps>(
  (
    {
      brand,
      contact,
      code,
      date,
      vehicle,
      licensePlate,
      issue,
      partsCost,
      laborCost,
      totalCost,
    },
    ref
  ) => {
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
          <h2 className="text-xl font-semibold mt-4">QUOTATION</h2>
        </div>

        {/* Info */}
        <div className="mb-4">
          <p><strong>Quotation Code:</strong> {code}</p>
          <p><strong>Date:</strong> {date}</p>
        </div>

        {/* Vehicle Info */}
        <div className="mb-4">
          <h3 className="font-semibold">Vehicle Information</h3>
          <p><strong>Vehicle:</strong> {vehicle}</p>
          <p><strong>License Plate:</strong> {licensePlate}</p>
          <p><strong>Issue:</strong> {issue}</p>
        </div>

        {/* Costs */}
        <div className="mb-4">
          <p><strong>Parts Cost:</strong> {partsCost.toLocaleString("vi-VN")} VNĐ</p>
          <p><strong>Labor Cost:</strong> {laborCost.toLocaleString("vi-VN")} VNĐ</p>
          <p className="font-bold text-lg"><strong>Total:</strong> {totalCost.toLocaleString("vi-VN")} VNĐ</p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm">
          <p>Thank you for choosing {brand}!</p>
        </div>
      </div>
    );
  }
);

QuotationPdf.displayName = "QuotationPdf";
export default QuotationPdf;
