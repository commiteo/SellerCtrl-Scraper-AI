
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Package, Zap } from 'lucide-react';

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
    <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-2xl">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="flex items-center gap-3 text-2xl text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          Product Data Extractor
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="asin" className="text-lg font-semibold text-white">
              Amazon ASIN Code
            </Label>
            <div className="relative">
              <Input
                id="asin"
                type="text"
                value={asin}
                onChange={(e) => setAsin(e.target.value)}
                className="pl-12 h-14 text-lg bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500"
                placeholder="e.g., B08N5WRWNW"
                required
                maxLength={10}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Enter a 10-character Amazon Standard Identification Number
            </p>
          </div>

          <div className="space-y-6">
            <Label className="text-lg font-semibold text-white">Select Data to Extract</Label>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="title"
                  checked={options.includeTitle}
                  onCheckedChange={(checked) => handleOptionChange('includeTitle', checked as boolean)}
                  className="border-gray-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="title" className="text-white font-medium cursor-pointer hover:text-orange-300 transition-colors">
                  Product Title
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="image"
                  checked={options.includeImage}
                  onCheckedChange={(checked) => handleOptionChange('includeImage', checked as boolean)}
                  className="border-gray-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="image" className="text-white font-medium cursor-pointer hover:text-orange-300 transition-colors">
                  Product Image
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="price"
                  checked={options.includePrice}
                  onCheckedChange={(checked) => handleOptionChange('includePrice', checked as boolean)}
                  className="border-gray-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="price" className="text-white font-medium cursor-pointer hover:text-orange-300 transition-colors">
                  Current Price
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="buybox"
                  checked={options.includeBuyboxWinner}
                  onCheckedChange={(checked) => handleOptionChange('includeBuyboxWinner', checked as boolean)}
                  className="border-gray-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="buybox" className="text-white font-medium cursor-pointer hover:text-orange-300 transition-colors">
                  Buybox Winner
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 col-span-2">
                <Checkbox
                  id="link"
                  checked={options.includeLink}
                  onCheckedChange={(checked) => handleOptionChange('includeLink', checked as boolean)}
                  className="border-gray-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="link" className="text-white font-medium cursor-pointer hover:text-orange-300 transition-colors">
                  Product Link
                </Label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !asin.trim()}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Extracting Data...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5" />
                Extract Product Data
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
