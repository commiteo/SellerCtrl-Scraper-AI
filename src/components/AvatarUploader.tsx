
import React, { useRef } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

type AvatarUploaderProps = {
  avatar: string | null;
  setAvatar: (url: string) => void;
};

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatar,
  setAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <div className="h-20 w-20 rounded-full bg-[#232323] overflow-hidden border-2 border-[#FF7A00] flex items-center justify-center shadow transition-all">
          {avatar ? (
            <img
              src={avatar}
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-[#FF7A00]" />
          )}
        </div>
        <button
          type="button"
          className="absolute bottom-0 right-0 bg-[#FF7A00] hover:bg-[#ffa53a] text-white rounded-full p-1 shadow-md border-2 border-white"
          onClick={() => fileInputRef.current?.click()}
          title="Change Image"
        >
          <Upload className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <span className="text-xs text-[#A3A3A3] mt-1">Upload new photo</span>
    </div>
  );
};
