
import React from "react";

export default function Account() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-10 px-4">
      <div className="bg-[#161616] border border-[#232323] rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-[#FF7A00] mb-2">Account</h2>
        <p className="text-[#E0E0E0] mb-6">Manage your personal information and account details.</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#FFFFFF] font-medium">Name:</span>
            <span className="text-[#A3A3A3]">Ali Hassan</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#FFFFFF] font-medium">Email:</span>
            <span className="text-[#A3A3A3]">3lol@sellerctrl.com</span>
          </div>
          {/* Add more account info as needed */}
        </div>
      </div>
    </div>
  );
}
