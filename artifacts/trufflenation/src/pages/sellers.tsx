import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useListSellers } from "@workspace/api-client-react";
import { MapPin, Star } from "lucide-react";

const SELLER_TYPE_LABELS: Record<string, string> = {
  forager: "Forager",
  commercial_supplier: "Commercial Supplier",
  restaurant: "Restaurant",
  individual: "Individual",
};

export default function SellersPage() {
  const { data: sellers, isLoading } = useListSellers();

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold">Our Suppliers</h1>
          <p className="text-primary-foreground/70 mt-2">Foragers, cultivators, and truffle houses from around the world</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-none" />)}
          </div>
        ) : !sellers || sellers.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl font-serif italic text-primary/20 mb-4">♦</p>
            <h2 className="text-2xl font-serif font-bold text-primary">No sellers yet</h2>
            <p className="text-muted-foreground mt-2 mb-6">Be the first to list on TruffleNation</p>
            <Button asChild className="rounded-none bg-primary text-primary-foreground">
              <Link href="/sell">Start Selling</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <Link key={seller.id} href={`/sellers/${seller.id}`}>
                <div className="group p-6 border border-border hover:border-primary/30 bg-card hover:bg-primary/5 transition-all duration-200 cursor-pointer" data-testid={`card-seller-${seller.id}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/10 flex items-center justify-center font-serif italic text-2xl text-primary/50 overflow-hidden flex-shrink-0">
                      {seller.imageUrl ? (
                        <img src={seller.imageUrl} alt={seller.displayName} className="w-full h-full object-cover" />
                      ) : (
                        seller.displayName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors truncate">{seller.displayName}</h3>
                      <Badge className="rounded-none bg-secondary/15 text-secondary border-0 text-xs mt-1">
                        {SELLER_TYPE_LABELS[seller.sellerType] ?? seller.sellerType}
                      </Badge>
                    </div>
                    {seller.isVerified && (
                      <Badge className="ml-auto rounded-none bg-primary/10 text-primary border-0 text-xs flex-shrink-0">Verified</Badge>
                    )}
                  </div>

                  {seller.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{seller.bio}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {seller.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{seller.location}
                      </span>
                    )}
                    {seller.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-secondary fill-secondary" />{seller.rating.toFixed(1)}
                      </span>
                    )}
                    <span>{seller.totalSales} sale{seller.totalSales !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
