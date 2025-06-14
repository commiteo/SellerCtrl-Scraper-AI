
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

interface ProductResultProps {
  product: ProductData;
}

export const ProductResult = ({ product }: ProductResultProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto dashboard-card font-inter">
      <CardHeader className="border-b border-[#2A2A2A]">
        <CardTitle className="flex items-center gap-2 text-[#FFFFFF] font-inter">
          <Package className="h-5 w-5 text-[#FF7A00]" />
          Product Data for ASIN: {product.asin}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {product.image && (
          <div className="flex items-center gap-4">
            <ImageIcon className="h-5 w-5 text-[#A3A3A3] flex-shrink-0" />
            <div className="flex items-center gap-4">
              <img 
                src={product.image} 
                alt="Product"
                className="w-24 h-24 object-cover rounded-lg border border-[#2A2A2A] shadow"
              />
              <span className="text-sm text-[#A3A3A3] font-inter">Product Image</span>
            </div>
          </div>
        )}

        {product.title && (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs border-[#2A2A2A] text-[#A3A3A3] bg-[#1F1F1F] font-inter">
              Title
            </Badge>
            <p className="text-lg font-medium text-[#E0E0E0] leading-relaxed font-inter">{product.title}</p>
          </div>
        )}

        {product.price && (
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

        {product.buyboxWinner && (
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

        {product.link && (
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
      </CardContent>
    </Card>
  );
};

