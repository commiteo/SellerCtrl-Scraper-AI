
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Package } from 'lucide-react';

interface ASINInputProps {
  onScrape: (asin: string, options: ScrapingOptions) => void;
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
  const [asin, setAsin] = useState('');
  const [options, setOptions] = useState<ScrapingOptions>({
    includeTitle: true,
    includeImage: true,
    includePrice: true,
    includeBuyboxWinner: true,
    includeLink: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (asin.trim()) {
      onScrape(asin.trim().toUpperCase(), options);
    }
  };

  const handleOptionChange = (option: keyof ScrapingOptions, checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-2 text-2xl text-white">
          <Package className="h-6 w-6 text-orange-500" />
          Amazon Product Scraper
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="asin" className="text-base font-medium text-gray-200">
              Amazon ASIN
            </Label>
            <div className="relative">
              <Input
                id="asin"
                type="text"
                value={asin}
                onChange={(e) => setAsin(e.target.value)}
                className="pl-10 text-lg bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500"
                placeholder="e.g., B08N5WRWNW"
                required
                maxLength={10}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">
              Enter a 10-character Amazon Standard Identification Number
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-200">Select data to extract:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="title"
                  checked={options.includeTitle}
                  onCheckedChange={(checked) => handleOptionChange('includeTitle', checked as boolean)}
                />
                <Label htmlFor="title" className="text-sm font-normal cursor-pointer text-gray-300">
                  Product Title
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="image"
                  checked={options.includeImage}
                  onCheckedChange={(checked) => handleOptionChange('includeImage', checked as boolean)}
                />
                <Label htmlFor="image" className="text-sm font-normal cursor-pointer text-gray-300">
                  Product Image
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price"
                  checked={options.includePrice}
                  onCheckedChange={(checked) => handleOptionChange('includePrice', checked as boolean)}
                />
                <Label htmlFor="price" className="text-sm font-normal cursor-pointer text-gray-300">
                  Price
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="buybox"
                  checked={options.includeBuyboxWinner}
                  onCheckedChange={(checked) => handleOptionChange('includeBuyboxWinner', checked as boolean)}
                />
                <Label htmlFor="buybox" className="text-sm font-normal cursor-pointer text-gray-300">
                  Buybox Winner
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 col-span-2">
                <Checkbox
                  id="link"
                  checked={options.includeLink}
                  onCheckedChange={(checked) => handleOptionChange('includeLink', checked as boolean)}
                />
                <Label htmlFor="link" className="text-sm font-normal cursor-pointer text-gray-300">
                  Product Link
                </Label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !asin.trim()}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg border-0"
          >
            {isLoading ? "Scraping..." : "Scrape Product Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
