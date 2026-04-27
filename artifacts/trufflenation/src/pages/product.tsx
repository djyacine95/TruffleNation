import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "wouter";
import {
  useGetProduct,
  getGetProductQueryKey,
  useGetSellerById,
  getGetSellerByIdQueryKey,
  useAddToCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, MapPin, Calendar, Package } from "lucide-react";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const [quantity, setQuantity] = useState(10);

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  });

  const { data: seller } = useGetSellerById(product?.sellerId ?? 0, {
    query: {
      enabled: !!product?.sellerId,
      queryKey: getGetSellerByIdQueryKey(product?.sellerId ?? 0),
    },
  });

  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { data: { productId: product.id, quantityGrams: quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to cart", description: `${product.name} (${quantity}g) added to your cart` });
        },
        onError: () => {
          toast({ title: "Sign in required", description: "Please sign in to add items to your cart", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-4xl font-serif italic text-primary/20 mb-4">♦</p>
          <h2 className="text-2xl font-serif font-bold text-primary">Product not found</h2>
          <Button asChild className="mt-6 rounded-none" variant="outline">
            <Link href="/shop">Back to Catalog</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const totalPrice = (product.pricePerGram * quantity).toFixed(2);

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <Button asChild variant="ghost" className="mb-8 text-muted-foreground hover:text-primary -ml-2 gap-2">
          <Link href="/shop"><ArrowLeft className="w-4 h-4" /> Back to Catalog</Link>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Image */}
          <div className="aspect-square bg-primary/5 flex items-center justify-center overflow-hidden" data-testid="img-product">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-primary/20 text-center">
                <div className="text-8xl font-serif italic mb-4">♦</div>
                <p className="font-serif italic text-sm">{product.category}</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-xs text-secondary font-semibold uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-4xl font-serif font-bold text-primary mb-4" data-testid="text-product-name">{product.name}</h1>

            {product.sellerName && (
              <p className="text-muted-foreground text-sm mb-4">
                Sold by{" "}
                <Link href={`/sellers/${product.sellerId}`} className="text-primary hover:underline font-medium">
                  {product.sellerName}
                </Link>
              </p>
            )}

            {product.description && (
              <p className="text-foreground/80 leading-relaxed mb-6 border-l-2 border-secondary pl-4 italic">{product.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              {product.origin && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Origin</p>
                    <p className="font-medium text-foreground">{product.origin}</p>
                  </div>
                </div>
              )}
              {product.season && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Season</p>
                    <p className="font-medium text-foreground">{product.season}</p>
                  </div>
                </div>
              )}
              {product.harvestDate && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Harvest Date</p>
                    <p className="font-medium text-foreground">{new Date(product.harvestDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">In Stock</p>
                  <p className="font-medium text-foreground">{product.stockGrams}g available</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-primary" data-testid="text-price">${product.pricePerGram.toFixed(2)}</span>
                <span className="text-muted-foreground text-lg">per gram</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-foreground">Quantity (grams)</label>
                <div className="flex items-center gap-2">
                  <Button
                    data-testid="button-decrease-quantity"
                    variant="outline" size="sm" className="rounded-none w-8 h-8 p-0"
                    onClick={() => setQuantity(Math.max(5, quantity - 5))}
                  >-</Button>
                  <span className="w-12 text-center font-semibold" data-testid="text-quantity">{quantity}g</span>
                  <Button
                    data-testid="button-increase-quantity"
                    variant="outline" size="sm" className="rounded-none w-8 h-8 p-0"
                    onClick={() => setQuantity(Math.min(product.stockGrams, quantity + 5))}
                  >+</Button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm">Total</span>
                <span className="text-xl font-bold text-primary" data-testid="text-total-price">${totalPrice}</span>
              </div>

              <Button
                data-testid="button-add-to-cart"
                className="w-full rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 py-6 text-base font-semibold gap-2"
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.stockGrams <= 0 || addToCart.isPending}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.isAvailable && product.stockGrams > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>

            {seller && (
              <div className="mt-8 p-4 bg-card border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Seller</p>
                <Link href={`/sellers/${seller.id}`}>
                  <div className="flex items-center gap-3 hover:text-primary transition-colors">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center font-serif italic text-primary/50">
                      {seller.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{seller.displayName}</p>
                      {seller.location && <p className="text-xs text-muted-foreground">{seller.location}</p>}
                    </div>
                    {seller.isVerified && <Badge className="ml-auto rounded-none bg-primary/10 text-primary border-0 text-xs">Verified</Badge>}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
