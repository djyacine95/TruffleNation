import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useGetFeaturedProducts, useGetProductCategories } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Shield, Leaf, Clock } from "lucide-react";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="relative mx-auto max-w-7xl lg:flex lg:items-stretch">
        {/* Text side */}
        <div className="relative z-10 flex flex-col justify-center px-6 py-24 sm:py-32 lg:w-1/2 lg:px-12 lg:py-40">
          <Badge className="mb-6 w-fit bg-secondary text-secondary-foreground border-0 rounded-none px-3 py-1 text-xs font-semibold tracking-widest uppercase">
            Premium Truffle Marketplace
          </Badge>
          <h1 className="text-5xl font-serif font-bold tracking-tight sm:text-6xl leading-tight">
            The earth's most<br />
            <em>elusive ingredient</em>,<br />
            delivered.
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-primary-foreground/75 max-w-md">
            The world's premium marketplace for truffles — connecting passionate foragers and suppliers with chefs and enthusiasts who know their worth.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 px-10 py-6 text-base font-semibold">
              <Link href="/shop">Explore the Catalog</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-10 py-6 text-base">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Image side */}
        <div className="relative lg:w-1/2 min-h-64 lg:min-h-0">
          <img
            src="/hero-truffles.png"
            alt="Fresh black truffles"
            className="w-full h-full object-cover"
            style={{ minHeight: "380px" }}
          />
          {/* Gradient fade into the dark primary on the left */}
          <div className="absolute inset-0 lg:bg-gradient-to-r lg:from-primary lg:via-primary/20 lg:to-transparent pointer-events-none" />
          {/* Bottom fade for small screens */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent lg:hidden pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

function TrustBanner() {
  return (
    <section className="bg-secondary/10 border-y border-secondary/20">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Authenticated Origins", desc: "Every listing verified against certified provenance records" },
            { icon: Leaf, title: "Harvested to Order", desc: "Fresh truffles foraged or picked within 48 hours of shipping" },
            { icon: Clock, title: "Seasonal Availability", desc: "Real-time stock from active foragers across Europe and North America" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <item.icon className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">{item.title}</p>
                <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { data: products, isLoading } = useGetFeaturedProducts();

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">Featured This Season</p>
            <h2 className="text-4xl font-serif font-bold text-primary">Premium Selections</h2>
          </div>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80 gap-2">
            <Link href="/shop">View All <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(products ?? []).slice(0, 6).map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`}>
                <Card className="group overflow-hidden rounded-none border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer" data-testid={`card-product-${product.id}`}>
                  <div className="aspect-[4/3] bg-primary/5 flex items-center justify-center overflow-hidden relative">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="text-primary/30 font-serif italic text-sm text-center p-4">
                        <div className="text-4xl mb-2">♦</div>
                        {product.category}
                      </div>
                    )}
                    {product.isFeatured && (
                      <Badge className="absolute top-3 left-3 rounded-none bg-secondary text-secondary-foreground border-0 text-xs">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{product.category}</p>
                    <h3 className="font-serif font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                    {product.origin && <p className="text-sm text-muted-foreground mt-1">{product.origin}</p>}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-2xl font-bold text-primary">${product.pricePerGram.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">/g</span>
                      </div>
                      <Badge variant="outline" className="rounded-none text-xs">{product.stockGrams}g in stock</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { data: categories, isLoading } = useGetProductCategories();

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">Browse by Variety</p>
          <h2 className="text-4xl font-serif font-bold text-primary">The Truffle Spectrum</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(categories ?? []).map((cat) => (
              <Link key={cat.category} href={`/shop?category=${encodeURIComponent(cat.category)}`}>
                <div className="group p-6 border border-border hover:border-primary/40 bg-background hover:bg-primary/5 transition-all duration-200 cursor-pointer" data-testid={`card-category-${cat.category}`}>
                  <div className="text-3xl font-serif italic text-primary/30 group-hover:text-primary/50 transition-colors mb-3">♦</div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.category}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{cat.count} listing{cat.count !== 1 ? "s" : ""}</p>
                  <p className="text-sm text-secondary font-medium mt-1">avg. ${cat.avgPricePerGram.toFixed(2)}/g</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SellerCTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-4">For Sellers & Foragers</p>
            <h2 className="text-4xl font-serif font-bold mb-6">Bring your truffles to the world's most discerning buyers</h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
              Whether you're a third-generation truffle cultivator, a weekend forager, or a restaurant with seasonal surplus — TruffleNation gives you direct access to buyers who understand the value of what you've found.
            </p>
            <Button asChild size="lg" className="rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8">
              <Link href="/sell">Start Selling Today</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Foragers", desc: "Wild-foraged, handpicked, and ready to list" },
              { label: "Commercial Suppliers", desc: "Bulk and small-batch supply chains, simplified" },
              { label: "Restaurants", desc: "Sell your seasonal truffle surplus at market value" },
              { label: "Individual Sellers", desc: "Found something special? The market is waiting" },
            ].map((type) => (
              <div key={type.label} className="p-5 border border-primary-foreground/20 bg-primary-foreground/5">
                <h4 className="font-semibold text-sm mb-2">{type.label}</h4>
                <p className="text-primary-foreground/70 text-sm">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <PageLayout>
      <HeroSection />
      <TrustBanner />
      <FeaturedProducts />
      <CategoriesSection />
      <SellerCTASection />
    </PageLayout>
  );
}
