import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/truffles", label: "Field guide" },
  { href: "/truffle-map", label: "Seasonal map" },
  { href: "/truffles/videos", label: "Video library" },
] as const;

export function LearnSubnav() {
  const [loc] = useLocation();

  return (
    <div className="border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <nav
          className="flex gap-0 overflow-x-auto no-scrollbar py-1"
          aria-label="Learn about truffles"
        >
          {LINKS.map((item) => {
            const active = loc === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px rounded-none",
                  active
                    ? "border-secondary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-primary hover:bg-muted/50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
