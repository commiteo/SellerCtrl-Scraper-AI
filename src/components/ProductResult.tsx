
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
    <Card className="w-full max-w-2xl mx-auto bg-[#171717] border-[#404040] text-[#FAFAFA]">
      <CardHeader className="border-b border-[#404040]">
        <CardTitle className="flex items-center gap-2 text-[#FAFAFA]">
          <Package className="h-5 w-5 text-[#EB5F01]" />
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
                className="w-24 h-24 object-cover rounded-lg border border-[#404040]"
              />
              <span className="text-sm text-[#A3A3A3]">Product Image</span>
            </div>
          </div>
        )}

        {product.title && (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs border-[#404040] text-[#A3A3A3] bg-[#0A0A0A]">
              Title
            </Badge>
            <p className="text-lg font-medium text-[#FAFAFA] leading-relaxed">{product.title}</p>
          </div>
        )}

        {product.price && (
          <div className="flex items-center gap-4">
            <DollarSign className="h-5 w-5 text-[#EB5F01]" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs border-[#404040] text-[#A3A3A3] bg-[#0A0A0A]">
                Price
              </Badge>
              <p className="text-2xl font-bold text-[#EB5F01]">{product.price}</p>
            </div>
          </div>
        )}

        {product.buyboxWinner && (
          <div className="flex items-center gap-4">
            <Award className="h-5 w-5 text-[#EB5F01]" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs border-[#404040] text-[#A3A3A3] bg-[#0A0A0A]">
                Buybox Winner
              </Badge>
              <p className="text-base font-medium text-[#FAFAFA]">{product.buyboxWinner}</p>
            </div>
          </div>
        )}

        {product.link && (
          <div className="flex items-center gap-4">
            <ExternalLink className="h-5 w-5 text-[#EB5F01]" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs border-[#404040] text-[#A3A3A3] bg-[#0A0A0A]">
                Product Link
              </Badge>
              <a 
                href={product.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#EB5F01] hover:text-[#D35400] underline break-all transition-colors"
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
