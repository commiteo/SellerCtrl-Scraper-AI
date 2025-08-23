import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Play } from 'lucide-react';

interface ASINInputProps {
  onScrape: (asins: string[]) => void;
  isLoading: boolean;
}

export const ASINInput = ({ onScrape, isLoading }: ASINInputProps) => {
  const [asinInput, setAsinInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Split ASINs by newlines, commas or whitespace, and filter out empties and dupes:
    const raw = asinInput.split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
    // Only keep unique, non-empty, 10-char entries:
    const asins = Array.from(new Set(raw.filter(a => a.length === 10)));
    if (asins.length > 0) {
      onScrape(asins);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="space-y-2">
        <Label htmlFor="asins" className="text-sm sm:text-base font-medium text-[#FFFFFF] font-inter">
          Amazon ASINs
        </Label>
        <div className="relative">
          <textarea
            id="asins"
            value={asinInput}
            onChange={(e) => setAsinInput(e.target.value)}
            rows={3}
            className="pl-10 text-sm sm:text-lg bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] placeholder-[#A3A3A3] focus:border-[#FF7A00] font-inter rounded w-full resize-y min-h-[48px] max-h-[150px] transition-colors"
            placeholder="e.g., B0C42HJRBF, B08N5WRWNW, B002QYW8LW or one ASIN per line"
            required
          />
          <Search className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-[#A3A3A3] pointer-events-none" />
        </div>
        <p className="text-xs sm:text-sm text-[#A3A3A3]">
          Enter one or more 10-character Amazon ASINs, separated by commas, spaces, or new lines.
        </p>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || !asinInput.trim()}
        className="w-full bg-[#FF7A00] hover:bg-[#ff9100] text-white font-semibold h-10 sm:h-11 transition-all duration-200"
      >
        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
        {isLoading ? 'Scraping...' : 'Start Scraping'}
      </Button>
    </form>
  );
};
