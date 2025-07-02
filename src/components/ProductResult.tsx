import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Package, DollarSign, Award, Image as ImageIcon } from 'lucide-react';

interface ProductData {
  asin: string;
  title?: string;
  image?: string;
  price?: string;
  buyboxWinner?: string;
  link?: string;
}

interface ScrapingOptions {
  includeTitle: boolean;
  includeImage: boolean;
  includePrice: boolean;
  includeBuyboxWinner: boolean;
  includeLink: boolean;
}

interface ProductResultProps {
  product: ProductData;
  options: ScrapingOptions;
}

export const ProductResult = ({ product, options }: ProductResultProps) => {
  return (
    <Card className="w-full max-w-6xl mx-auto dashboard-card font-inter">
      <CardHeader className="border-b border-[#2A2A2A]">
        <CardTitle className="flex items-center gap-2 text-[#FFFFFF] font-inter">
          <Package className="h-5 w-5 text-[#FF7A00]" />
          Product Data for ASIN:
          <span className="ml-2 px-2 py-1 rounded bg-[#232323] text-[#FF7A00] font-mono text-base">{product.asin}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Image on the left */}
          {options.includeImage && product.image && (
            <div className="flex flex-col items-center md:items-start min-w-[140px] max-w-[200px] w-full md:w-auto">
              <div className="bg-[#181818] rounded-lg border border-[#2A2A2A] shadow mb-2 flex items-center justify-center" style={{ width: '140px', height: '140px' }}>
                <img
                  src={product.image}
                  alt="Product"
                  className="object-contain w-full h-full rounded-lg"
                  style={{ maxWidth: '130px', maxHeight: '130px' }}
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ImageIcon className="h-4 w-4 text-[#A3A3A3] flex-shrink-0" />
                <span className="text-xs text-[#A3A3A3] font-inter">Product Image</span>
              </div>
            </div>
          )}

          {/* Other data on the right */}
          <div className="flex-1 space-y-5 w-full">
            {options.includeTitle && product.title && (
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs border-[#2A2A2A] text-[#A3A3A3] bg-[#1F1F1F] font-inter">
                  Title
                </Badge>
                <p className="text-lg font-medium text-[#E0E0E0] leading-relaxed font-inter">{product.title}</p>
              </div>
            )}

            {options.includePrice && product.price && (
              <div className="flex items-center gap-4">
                <DollarSign className="h-5 w-5 text-[#FF7A00]" />
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs border-[#2A2A2A] text-[#A3A3A3] bg-[#1F1F1F] font-inter">
                    Price
                  </Badge>
                  <p className="text-2xl font-bold text-[#FF7A00] font-inter">{product.price}</p>
                </div>
              </div>
            )}

            {options.includeBuyboxWinner && product.buyboxWinner && (
              <div className="flex items-center gap-4">
                <Award className="h-5 w-5 text-[#FF7A00]" />
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs border-[#2A2A2A] text-[#A3A3A3] bg-[#1F1F1F] font-inter">
                    Buybox Winner
                  </Badge>
                  <p className="text-base font-medium text-[#E0E0E0] font-inter">{product.buyboxWinner}</p>
                </div>
              </div>
            )}

            {options.includeLink && product.link && (
              <div className="flex items-center gap-4">
                <ExternalLink className="h-5 w-5 text-[#FF7A00]" />
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs border-[#2A2A2A] text-[#A3A3A3] bg-[#1F1F1F] font-inter">
                    Product Link
                  </Badge>
                  <a 
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF7A00] hover:text-[#ff9100] underline break-all transition-colors font-inter"
                  >
                    {product.link}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

