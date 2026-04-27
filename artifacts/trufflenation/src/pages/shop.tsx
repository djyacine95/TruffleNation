import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearch } from "wouter";
import {
  useListProducts,
  useGetProductCategories,
  useAddToCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Search, SlidersHorizontal } from "lucide-react";

export default function ShopPage() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("category") ?? "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const { data: categories } = useGetProductCategories();
  const { data: products, isLoading } = useListProducts({
    search: search || undefined,
    category: category || undefined,
    inStock: inStockOnly || undefined,
  });

  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sortedProducts = [...(products ?? [])].sort((a, b) => {
    if (sortBy === "price-asc") return a.pricePerGram - b.pricePerGram;
    if (sortBy === "price-desc") return b.pricePerGram - a.pricePerGram;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleAddToCart = (productId: number, productName: string) => {
    addToCart.mutate(
      { data: { productId, quantityGrams: 10 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to cart", description: `${productName} (10g) added to your cart` });
        },
        onError: () => {
          toast({ title: "Sign in required", description: "Please sign in to add items to your cart", variant: "destructive" });
        },
      }
    );
  };

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Truffle Catalog</h1>
          <p className="text-primary-foreground/70">Premium selections from verified foragers and suppliers worldwide</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-border">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search truffles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-none"
            />
          </div>

          <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
            <SelectTrigger data-testid="select-category" className="w-48 rounded-none">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((cat) => (
                <SelectItem key={cat.category} value={cat.category}>{cat.category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger data-testid="select-sort" className="w-40 rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            data-testid="button-toggle-instock"
            variant={inStockOnly ? "default" : "outline"}
            className="rounded-none"
            onClick={() => setInStockOnly(!inStockOnly)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            In Stock Only
          </Button>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-none" />)}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl font-serif italic text-primary/20 mb-4">♦</p>
            <h3 className="text-xl font-serif text-muted-foreground mb-2">No truffles found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or check back during peak season</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden rounded-none border-border hover:border-primary/30 transition-all duration-200 hover:shadow-md" data-testid={`card-product-${product.id}`}>
                  <Link href={`/shop/${product.id}`}>
                    <div className="aspect-[4/3] bg-primary/5 flex items-center justify-center overflow-hidden cursor-pointer">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-primary/20 font-serif italic text-sm text-center p-4">
                          <div className="text-4xl mb-2">♦</div>
                          {product.category}
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{product.category}</p>
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="font-serif font-semibold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug">{product.name}</h3>
                    </Link>
                    {product.sellerName && <p className="text-xs text-muted-foreground mt-1">by {product.sellerName}</p>}
                    {product.origin && <p className="text-xs text-muted-foreground">{product.origin}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-xl font-bold text-primary">${product.pricePerGram.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">/g</span>
                      </div>
                      {product.isFeatured && <Badge className="rounded-none bg-secondary text-secondary-foreground border-0 text-xs">Featured</Badge>}
                    </div>
                    <Button
                      data-testid={`button-add-to-cart-${product.id}`}
                      className="w-full mt-3 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                      size="sm"
                      onClick={() => handleAddToCart(product.id, product.name)}
                      disabled={!product.isAvailable || product.stockGrams <= 0}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                      {product.isAvailable && product.stockGrams > 0 ? "Add 10g to Cart" : "Out of Stock"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
