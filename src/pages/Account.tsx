
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Lock, Key } from "lucide-react";
import { AvatarUploader } from "@/components/AvatarUploader";
import { useUser } from "@/components/UserContext";

export default function Account() {
  const { user, setAvatar } = useUser();
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("+1 888 888 8888");
  const [password, setPassword] = useState("••••••••");

  // This will be set after "Save" in AvatarUploader
  const handleAvatarChange = (data: string) => {
    setAvatar(data); // Updates user context, reflects everywhere
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-10 px-4">
      <div className="bg-[#161616] border border-[#232323] rounded-2xl shadow-md p-8 w-full max-w-lg flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col items-center mb-1">
          <AvatarUploader avatar={user.avatar} onAvatarChange={handleAvatarChange} />
          <h2 className="text-2xl font-semibold text-[#FF7A00] text-center mt-2">Account</h2>
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
              {email}
              <Button
                variant="link"
                size="sm"
                className="text-[#FF7A00] p-0 h-auto underline ml-2 hover:text-[#ffa53a]"
                onClick={() => alert("Email change functionality would require Supabase integration.")}
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
              {password}
              <Button
                variant="link"
                size="sm"
                className="text-[#FF7A00] p-0 h-auto underline ml-2 hover:text-[#ffa53a]"
                onClick={() => alert("Password change functionality would require Supabase integration.")}
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
              {phone}
              <Button
                variant="link"
                size="sm"
                className="text-[#FF7A00] p-0 h-auto underline ml-2 hover:text-[#ffa53a]"
                onClick={() => alert("Phone number change functionality would require Supabase integration.")}
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
