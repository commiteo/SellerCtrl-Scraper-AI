
import React from "react";

export default function Billing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-10 px-4">
      <div className="bg-[#161616] border border-[#232323] rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-[#FF7A00] mb-2">Billing</h2>
        <p className="text-[#E0E0E0] mb-6">View and manage your billing information and invoices.</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#FFFFFF] font-medium">Plan:</span>
            <span className="text-[#A3A3A3]">Free</span>
          </div>
          {/* Add more billing info as needed */}
        </div>
      </div>
    </div>
  );
}
