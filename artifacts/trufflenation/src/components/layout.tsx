import { Link } from "wouter";
import { Show, UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

function NavbarWithoutClerk() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-serif text-2xl font-bold text-primary">TruffleNation</span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium text-muted-foreground min-w-0">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="hover:text-primary transition-colors">Catalog</Link>
            <Link href="/sellers" className="hover:text-primary transition-colors">Sellers</Link>
            <Link href="/truffles" className="hover:text-primary transition-colors">Truffle guide</Link>
            <Link href="/truffle-map" className="hover:text-primary transition-colors">Seasonal map</Link>
            <Link href="/truffles/videos" className="hover:text-primary transition-colors">Videos</Link>
          </div>
          <div className="flex md:hidden items-center gap-3 text-xs uppercase tracking-wide">
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <Link href="/truffles" className="hover:text-primary transition-colors">Guide</Link>
            <Link href="/truffle-map" className="hover:text-primary transition-colors">Map</Link>
            <Link href="/truffles/videos" className="hover:text-primary transition-colors">Video</Link>
          </div>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="hidden sm:inline text-xs text-muted-foreground max-w-[140px] truncate" title="Add VITE_CLERK_PUBLISHABLE_KEY to enable sign-in">
            Dev: no Clerk key
          </span>
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavbarWithClerk() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold text-primary">TruffleNation</span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium text-muted-foreground">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="hover:text-primary transition-colors">Catalog</Link>
            <Link href="/sellers" className="hover:text-primary transition-colors">Sellers</Link>
            <Link href="/truffles" className="hover:text-primary transition-colors">Truffle guide</Link>
            <Link href="/truffle-map" className="hover:text-primary transition-colors">Seasonal map</Link>
            <Link href="/truffles/videos" className="hover:text-primary transition-colors">Videos</Link>
          </div>
          <div className="flex md:hidden items-center gap-3 text-xs uppercase tracking-wide">
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <Link href="/truffles" className="hover:text-primary transition-colors">Guide</Link>
            <Link href="/truffle-map" className="hover:text-primary transition-colors">Map</Link>
            <Link href="/truffles/videos" className="hover:text-primary transition-colors">Video</Link>
          </div>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/cart" className="text-sm font-medium hover:text-primary transition-colors">
              Cart
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-none ring-1 ring-border",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  if (!clerkPublishableKey) {
    return <NavbarWithoutClerk />;
  }
  return <NavbarWithClerk />;
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card mt-auto">
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-xs">
          <h3 className="font-serif text-xl font-bold text-primary mb-4">TruffleNation</h3>
          <p className="text-sm text-muted-foreground">
            The world's premium marketplace for discovering, buying, and selling the finest truffles directly from source to table.
          </p>
        </div>
        <div className="flex gap-12">
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold text-foreground">Marketplace</span>
            <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop Truffles</Link>
            <Link href="/sellers" className="text-muted-foreground hover:text-primary transition-colors">Our Suppliers</Link>
            <Link href="/sell" className="text-muted-foreground hover:text-primary transition-colors">Become a Seller</Link>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold text-foreground">Discover</span>
            <Link href="/truffles" className="text-muted-foreground hover:text-primary transition-colors">
              About truffles
            </Link>
            <Link href="/truffle-map" className="text-muted-foreground hover:text-primary transition-colors">
              Seasonal world map
            </Link>
            <Link href="/truffles/videos" className="text-muted-foreground hover:text-primary transition-colors">
              Video library
            </Link>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold text-foreground">Support</span>
            <Link href="/shipping-policy" className="text-muted-foreground hover:text-primary transition-colors">
              Shipping policy
            </Link>
            <Link href="/authenticity-guarantee" className="text-muted-foreground hover:text-primary transition-colors">
              Authenticity guarantee
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact us
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} TruffleNation. All rights reserved.
      </div>
    </footer>
  );
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
