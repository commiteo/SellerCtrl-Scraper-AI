
import React, { useRef, useState } from "react";
import { Image as ImageIcon, Upload, Save } from "lucide-react";

type AvatarUploaderProps = {
  avatar: string | null;
  onAvatarChange: (imageData: string) => void;
};

const MAX_SIZE = 256;

function resizeImage(file: File, callback: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      let [w, h] = [img.width, img.height];
      if (w > h) {
        if (w > MAX_SIZE) {
          h *= MAX_SIZE / w;
          w = MAX_SIZE;
        }
      } else {
        if (h > MAX_SIZE) {
          w *= MAX_SIZE / h;
          h = MAX_SIZE;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/png", 0.92));
      }
    };
    if (event.target?.result) {
      img.src = event.target.result as string;
    }
  };
  reader.readAsDataURL(file);
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatar,
  onAvatarChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      resizeImage(file, (resizedDataUrl) => {
        setPreview(resizedDataUrl);
      });
    }
  };

  const handleSave = () => {
    if (preview) {
      onAvatarChange(preview);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <div className="h-20 w-20 rounded-full bg-[#232323] overflow-hidden border-2 border-[#FF7A00] flex items-center justify-center shadow transition-all">
          {(preview || avatar) ? (
            <img
              src={preview || avatar || ""}
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
        {preview && (
          <button
            type="button"
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#232323] text-[#FF7A00] border-2 border-[#FF7A00] rounded-full px-3 py-0.5 shadow"
            onClick={handleSave}
            title="Save Avatar"
          >
            <Save className="inline mr-1 h-4 w-4" /> Save
          </button>
        )}
      </div>
      <span className="text-xs text-[#A3A3A3] mt-3">Upload new photo</span>
    </div>
  );
};
