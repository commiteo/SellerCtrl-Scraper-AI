import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Package } from 'lucide-react';

interface ASINInputProps {
  onScrape: (asins: string[], options: ScrapingOptions) => void;
  isLoading: boolean;
}

interface ScrapingOptions {
  includeTitle: boolean;
  includeImage: boolean;
  includePrice: boolean;
  includeBuyboxWinner: boolean;
  includeLink: boolean;
}

export const ASINInput = ({ onScrape, isLoading }: ASINInputProps) => {
  const [asinInput, setAsinInput] = useState('');
  const [options, setOptions] = useState<ScrapingOptions>({
    includeTitle: true,
    includeImage: true,
    includePrice: true,
    includeBuyboxWinner: true,
    includeLink: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Split ASINs by newlines, commas or whitespace, and filter out empties and dupes:
    let raw = asinInput.split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
    // Only keep unique, non-empty, 10-char entries:
    let asins = Array.from(new Set(raw.filter(a => a.length === 10)));
    if (asins.length > 0) {
      onScrape(asins, options);
    }
  };

  const handleOptionChange = (option: keyof ScrapingOptions, checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto dashboard-card font-inter">
      <CardHeader className="border-b border-[#2A2A2A]">
        <CardTitle className="flex items-center gap-2 text-2xl text-[#FFFFFF] font-inter">
          <Package className="h-6 w-6 text-[#FF7A00]" />
          Amazon Product Scraper
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="asins" className="text-base font-medium text-[#FFFFFF] font-inter">
              Amazon ASINs
            </Label>
            <div className="relative">
              <textarea
                id="asins"
                value={asinInput}
                onChange={(e) => setAsinInput(e.target.value)}
                rows={3}
                className="pl-10 text-lg bg-[#1F1F1F] border-[#2A2A2A] text-[#FFFFFF] placeholder-[#A3A3A3] focus:border-[#FF7A00] font-inter rounded w-full resize-y min-h-[48px] max-h-[150px]"
                placeholder="e.g., B08N5WRWNW, B002QYW8LW or one ASIN per line"
                required
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#A3A3A3] pointer-events-none" />
            </div>
            <p className="text-sm text-[#A3A3A3]">
              Enter one or more 10-character Amazon ASINs, separated by commas, spaces, or new lines.
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium text-[#FFFFFF] font-inter">Select data to extract:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="title"
                  checked={options.includeTitle}
                  onCheckedChange={(checked) => handleOptionChange('includeTitle', checked as boolean)}
                />
                <Label htmlFor="title" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Product Title</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="image"
                  checked={options.includeImage}
                  onCheckedChange={(checked) => handleOptionChange('includeImage', checked as boolean)}
                />
                <Label htmlFor="image" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Product Image</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price"
                  checked={options.includePrice}
                  onCheckedChange={(checked) => handleOptionChange('includePrice', checked as boolean)}
                />
                <Label htmlFor="price" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Price</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="buybox"
                  checked={options.includeBuyboxWinner}
                  onCheckedChange={(checked) => handleOptionChange('includeBuyboxWinner', checked as boolean)}
                />
                <Label htmlFor="buybox" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Buybox Winner</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <Checkbox
                  id="link"
                  checked={options.includeLink}
                  onCheckedChange={(checked) => handleOptionChange('includeLink', checked as boolean)}
                />
                <Label htmlFor="link" className="text-sm font-normal cursor-pointer text-[#E0E0E0]">Product Link</Label>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !asinInput.trim()}
            className="w-full btn-glow py-3 text-lg border-0 font-inter"
          >
            {isLoading ? "Scraping..." : "Scrape Product Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
