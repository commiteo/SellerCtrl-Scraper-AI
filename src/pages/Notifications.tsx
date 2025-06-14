
import React from "react";

export default function Notifications() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-10 px-4">
      <div className="bg-[#161616] border border-[#232323] rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-[#FF7A00] mb-2">Notifications</h2>
        <p className="text-[#E0E0E0] mb-6">Configure when and how you want to be notified.</p>
        <div className="text-[#A3A3A3]">No notifications yet.</div>
      </div>
    </div>
  );
}
