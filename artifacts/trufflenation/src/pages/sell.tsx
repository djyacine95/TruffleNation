import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  useGetSellerProfile,
  useListProducts,
  getListProductsQueryKey,
  useDeleteProduct,
  getGetSellerProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@clerk/react";
import { useUser } from "@clerk/react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import SellerOnboarding from "@/components/seller-onboarding";

export default function SellPage() {
  const { user } = useUser();
  const { data: sellerProfile, isLoading: profileLoading } = useGetSellerProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: myProducts, isLoading: productsLoading } = useListProducts(
    { sellerId: String(sellerProfile?.id ?? "") },
    {
      query: {
        enabled: !!sellerProfile?.id,
        queryKey: getListProductsQueryKey({ sellerId: String(sellerProfile?.id ?? "") }),
      },
    }
  );

  const deleteProduct = useDeleteProduct();

  const handleDelete = (productId: number, productName: string) => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    deleteProduct.mutate(
      { id: productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ sellerId: String(sellerProfile?.id ?? "") }) });
          toast({ title: "Product deleted", description: `${productName} has been removed` });
        },
      }
    );
  };

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold">Seller Hub</h1>
          <p className="text-primary-foreground/70 mt-2">Manage your truffle listings and track your sales</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12">
        <Show when="signed-out">
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-primary mb-2">Sign in to manage your listings</h2>
            <Button asChild className="rounded-none mt-4">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </Show>

        <Show when="signed-in">
          {profileLoading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : !sellerProfile ? (
            <SellerOnboarding />
          ) : (
            <div className="space-y-8">
              {/* Seller profile header */}
              <div className="flex items-start justify-between gap-4 flex-wrap p-6 bg-card border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 flex items-center justify-center font-serif italic text-2xl text-primary/50">
                    {sellerProfile.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif font-bold text-xl text-primary">{sellerProfile.displayName}</h2>
                      {sellerProfile.isVerified && <Badge className="rounded-none bg-primary/10 text-primary border-0 text-xs">Verified</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm capitalize">{sellerProfile.sellerType.replace("_", " ")}</p>
                    {sellerProfile.location && <p className="text-muted-foreground text-sm">{sellerProfile.location}</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button asChild className="rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
                    <Link href="/sell/new"><Plus className="w-4 h-4" /> New Listing</Link>
                  </Button>
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif font-bold text-xl text-primary">Your Listings</h3>
                  <span className="text-sm text-muted-foreground">{(myProducts ?? []).length} product{(myProducts ?? []).length !== 1 ? "s" : ""}</span>
                </div>

                {productsLoading ? (
                  <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
                ) : !myProducts || myProducts.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-border">
                    <Package className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                    <h3 className="font-serif font-semibold text-lg text-primary mb-2">No listings yet</h3>
                    <p className="text-muted-foreground text-sm mb-6">Create your first truffle listing to start selling</p>
                    <Button asChild className="rounded-none bg-primary text-primary-foreground gap-2">
                      <Link href="/sell/new"><Plus className="w-4 h-4" /> Create Listing</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 border border-border bg-card" data-testid={`row-product-${product.id}`}>
                        <div className="w-16 h-16 bg-primary/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary/20 font-serif italic">♦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif font-semibold text-foreground">{product.name}</h4>
                            {product.isFeatured && <Badge className="rounded-none bg-secondary/20 text-secondary border-0 text-xs">Featured</Badge>}
                            {!product.isAvailable && <Badge className="rounded-none bg-destructive/10 text-destructive border-0 text-xs">Unavailable</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{product.category} — {product.stockGrams}g in stock</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-primary">${product.pricePerGram.toFixed(2)}/g</p>
                          <p className="text-xs text-muted-foreground">{product.weightGrams}g listing size</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button asChild variant="outline" size="sm" className="rounded-none gap-1">
                            <Link href={`/sell/${product.id}/edit`} data-testid={`button-edit-product-${product.id}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                          <Button
                            data-testid={`button-delete-product-${product.id}`}
                            variant="outline" size="sm" className="rounded-none text-destructive hover:text-destructive/80 gap-1"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Show>
      </div>
    </PageLayout>
  );
}
