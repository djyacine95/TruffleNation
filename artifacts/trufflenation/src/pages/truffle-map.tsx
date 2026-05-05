import { PageLayout } from "@/components/layout";
import { LearnSubnav } from "@/components/learn-subnav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorldTruffleMap } from "@/components/world-truffle-map";
import { Link } from "wouter";
import { MapPin, BookOpen, Film } from "lucide-react";

export default function TruffleMapPage() {
  return (
    <PageLayout>
      <LearnSubnav />
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <Badge className="mb-3 rounded-none bg-secondary text-secondary-foreground border-0 uppercase tracking-widest text-xs">
                Global view
              </Badge>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary tracking-tight">
                Seasonal truffle map
              </h1>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
                Major producing areas, typical species, and peak windows — a planning tool, not a live harvest
                forecast. Always confirm availability with sellers for the week you are cooking.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button asChild variant="outline" className="rounded-none gap-2">
                <Link href="/truffles">
                  <BookOpen className="w-4 h-4" />
                  Truffle guide
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none gap-2">
                <Link href="/truffles/videos">
                  <Film className="w-4 h-4" />
                  Video library
                </Link>
              </Button>
              <Button asChild className="rounded-none gap-2 bg-primary">
                <Link href="/shop">
                  <MapPin className="w-4 h-4" />
                  Shop listings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
        <WorldTruffleMap showIntro />
      </section>
    </PageLayout>
  );
}
