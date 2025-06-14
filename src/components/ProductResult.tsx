
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
    <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-700 text-white">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="h-5 w-5 text-blue-500" />
          Product Data for ASIN: {product.asin}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {product.image && (
          <div className="flex items-center gap-4">
            <ImageIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-4">
              <img 
                src={product.image} 
                alt="Product" 
                className="w-24 h-24 object-cover rounded-lg border border-gray-600"
              />
              <span className="text-sm text-gray-300">Product Image</span>
            </div>
          </div>
        )}

        {product.title && (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
              Title
            </Badge>
            <p className="text-lg font-medium text-white leading-relaxed">{product.title}</p>
          </div>
        )}

        {product.price && (
          <div className="flex items-center gap-4">
            <DollarSign className="h-5 w-5 text-green-500" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                Price
              </Badge>
              <p className="text-2xl font-bold text-green-400">{product.price}</p>
            </div>
          </div>
        )}

        {product.buyboxWinner && (
          <div className="flex items-center gap-4">
            <Award className="h-5 w-5 text-yellow-500" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                Buybox Winner
              </Badge>
              <p className="text-base font-medium text-white">{product.buyboxWinner}</p>
            </div>
          </div>
        )}

        {product.link && (
          <div className="flex items-center gap-4">
            <ExternalLink className="h-5 w-5 text-blue-500" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                Product Link
              </Badge>
              <a 
                href={product.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline break-all transition-colors"
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
