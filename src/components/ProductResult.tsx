
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600" />
          Product Data for ASIN: {product.asin}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {product.image && (
          <div className="flex items-center gap-3">
            <ImageIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex items-center gap-3">
              <img 
                src={product.image} 
                alt="Product" 
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <span className="text-sm text-gray-600">Product Image</span>
            </div>
          </div>
        )}

        {product.title && (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">Title</Badge>
            <p className="text-lg font-medium text-gray-800">{product.title}</p>
          </div>
        )}

        {product.price && (
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Price</Badge>
              <p className="text-xl font-bold text-green-600">{product.price}</p>
            </div>
          </div>
        )}

        {product.buyboxWinner && (
          <div className="flex items-center gap-3">
            <Award className="h-4 w-4 text-yellow-600" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Buybox Winner</Badge>
              <p className="text-base font-medium">{product.buyboxWinner}</p>
            </div>
          </div>
        )}

        {product.link && (
          <div className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Product Link</Badge>
              <a 
                href={product.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
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
