
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
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-2xl">
      <CardHeader className="border-b border-gray-700 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-2xl">Product Data Extracted</span>
            <p className="text-sm text-gray-400 font-normal mt-1">ASIN: {product.asin}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        {product.image && (
          <div className="flex flex-col md:flex-row items-start gap-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <ImageIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <Badge variant="outline" className="border-orange-500 text-orange-400 bg-orange-500/10">
                Product Image
              </Badge>
            </div>
            <div className="flex items-center gap-6">
              <img 
                src={product.image} 
                alt="Product" 
                className="w-32 h-32 object-cover rounded-xl border-2 border-gray-600 shadow-lg"
              />
              <span className="text-gray-300">High-resolution product image</span>
            </div>
          </div>
        )}

        {product.title && (
          <div className="space-y-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-500" />
              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                Product Title
              </Badge>
            </div>
            <p className="text-xl font-semibold text-white leading-relaxed pl-8">{product.title}</p>
          </div>
        )}

        {product.price && (
          <div className="space-y-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-500" />
              <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
                Current Price
              </Badge>
            </div>
            <p className="text-3xl font-bold text-green-400 pl-8">{product.price}</p>
          </div>
        )}

        {product.buyboxWinner && (
          <div className="space-y-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-yellow-500" />
              <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10">
                Buybox Winner
              </Badge>
            </div>
            <p className="text-lg font-semibold text-white pl-8">{product.buyboxWinner}</p>
          </div>
        )}

        {product.link && (
          <div className="space-y-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-purple-500" />
              <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-500/10">
                Product Link
              </Badge>
            </div>
            <a 
              href={product.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline break-all transition-colors text-lg pl-8 block"
            >
              {product.link}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
