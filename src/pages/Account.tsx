
import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Lock, Key, Image as ImageIcon } from "lucide-react";

export default function Account() {
  // Static demo data; real values will come once Supabase is integrated
  const user = {
    name: "Ali Hassan",
    email: "3lol@sellerctrl.com",
    phone: "+1 888 888 8888",
    avatar: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=facearea&w=128&q=80",
    provider: "Google",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-10 px-4">
      <div className="bg-[#161616] border border-[#232323] rounded-2xl shadow-md p-8 w-full max-w-lg flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col items-center mb-1">
          <div className="h-20 w-20 rounded-full bg-[#232323] overflow-hidden border-2 border-[#FF7A00] mb-2 flex items-center justify-center shadow">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-10 w-10 text-[#FF7A00]" />
            )}
          </div>
          <h2 className="text-2xl font-semibold text-[#FF7A00] text-center">Account</h2>
          <p className="text-[#E0E0E0] text-center">Manage your personal information and account details.</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#FFF] font-medium">Name:</span>
            <span className="text-[#A3A3A3]">{user.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#FFF] font-medium">Email:</span>
            <span className="text-[#A3A3A3] flex items-center gap-2">
              {user.email}
              <Button
                variant="link"
                size="sm"
                className="text-[#FF7A00] p-0 h-auto underline ml-2 hover:text-[#ffa53a]"
                onClick={() => alert("Implement email change after setting up Supabase.")}
              >
                Change
              </Button>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#FFF] font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#A3A3A3]" />
              Password:
            </span>
            <span className="text-[#A3A3A3] flex items-center gap-2">
              ••••••••
              <Button
                variant="link"
                size="sm"
                className="text-[#FF7A00] p-0 h-auto underline ml-2 hover:text-[#ffa53a]"
                onClick={() => alert("Implement password change after setting up Supabase.")}
              >
                Change
              </Button>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#FFF] font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#A3A3A3]" />
              Phone:
            </span>
            <span className="text-[#A3A3A3] flex items-center gap-2">
              {user.phone}
              <Button
                variant="link"
                size="sm"
                className="text-[#FF7A00] p-0 h-auto underline ml-2 hover:text-[#ffa53a]"
                onClick={() => alert("Implement phone change after setting up Supabase.")}
              >
                Change
              </Button>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#FFF] font-medium flex items-center gap-2">
              <Key className="h-4 w-4 text-[#A3A3A3]" />
              Google Login:
            </span>
            <span className="text-[#E0E0E0] bg-[#212121] text-xs rounded px-3 py-1 font-semibold flex items-center gap-1 shadow-inner border border-[#FF7A00]">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-4 h-4 mr-1" />
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
