import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "wouter";
import {
  useGetSellerById,
  getGetSellerByIdQueryKey,
  useListProducts,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { ArrowLeft, MapPin, Star, ShieldCheck } from "lucide-react";

const SELLER_TYPE_LABELS: Record<string, string> = {
  forager: "Forager",
  commercial_supplier: "Commercial Supplier",
  restaurant: "Restaurant",
  individual: "Individual",
};

export default function SellerProfilePage() {
  const params = useParams<{ id: string }>();
  const sellerId = Number(params.id);

  const { data: seller, isLoading: sellerLoading } = useGetSellerById(sellerId, {
    query: { enabled: !!sellerId, queryKey: getGetSellerByIdQueryKey(sellerId) },
  });

  const { data: products, isLoading: productsLoading } = useListProducts(
    { sellerId: String(sellerId) },
    {
      query: {
        enabled: !!sellerId,
        queryKey: getListProductsQueryKey({ sellerId: String(sellerId) }),
      },
    }
  );

  if (sellerLoading) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-48 w-full mb-8" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!seller) {
    return (
      <PageLayout>
        <div className="text-center py-24">
          <h2 className="text-2xl font-serif font-bold text-primary">Seller not found</h2>
          <Button asChild className="mt-6 rounded-none" variant="outline">
            <Link href="/sellers">Back to Sellers</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-6 text-primary-foreground/60 hover:text-primary-foreground -ml-2 gap-2">
            <Link href="/sellers"><ArrowLeft className="w-4 h-4" /> All Sellers</Link>
          </Button>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-20 h-20 bg-primary-foreground/10 flex items-center justify-center font-serif italic text-3xl text-primary-foreground/50 overflow-hidden flex-shrink-0">
              {seller.imageUrl ? (
                <img src={seller.imageUrl} alt={seller.displayName} className="w-full h-full object-cover" />
              ) : (
                seller.displayName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-serif font-bold" data-testid="text-seller-name">{seller.displayName}</h1>
                {seller.isVerified && (
                  <Badge className="rounded-none bg-secondary text-secondary-foreground border-0 gap-1 text-xs">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-primary-foreground/70 mt-1">
                {SELLER_TYPE_LABELS[seller.sellerType] ?? seller.sellerType}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-primary-foreground/60">
                {seller.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{seller.location}</span>}
                {seller.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-secondary fill-secondary" />{seller.rating.toFixed(1)}</span>}
                <span>{seller.totalSales} total sales</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12">
        {seller.bio && (
          <div className="mb-12 max-w-2xl">
            <p className="text-foreground/80 leading-relaxed border-l-2 border-secondary pl-4 italic text-lg">{seller.bio}</p>
          </div>
        )}

        <div>
          <h2 className="font-serif font-bold text-2xl text-primary mb-6">Listings from {seller.displayName}</h2>
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border">
              <p className="text-muted-foreground">No active listings at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`}>
                  <Card className="group overflow-hidden rounded-none border-border hover:border-primary/30 transition-all duration-200 cursor-pointer" data-testid={`card-product-${product.id}`}>
                    <div className="aspect-[4/3] bg-primary/5 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-primary/20 font-serif italic text-center">
                          <div className="text-4xl mb-1">♦</div>
                          <p className="text-xs">{product.category}</p>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{product.category}</p>
                      <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                      {product.origin && <p className="text-xs text-muted-foreground mt-1">{product.origin}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-xl font-bold text-primary">${product.pricePerGram.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">/g</span>
                        </div>
                        <Badge variant="outline" className="rounded-none text-xs">{product.stockGrams}g stock</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
