import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default function AuthenticityGuaranteePage() {
  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12 border-b border-primary-foreground/10">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Badge className="mb-4 rounded-none bg-secondary text-secondary-foreground border-0 uppercase tracking-widest text-xs">
            Trust
          </Badge>
          <h1 className="font-serif text-4xl font-bold flex flex-wrap items-center gap-3">
            <ShieldCheck className="h-10 w-10 shrink-0 opacity-90" aria-hidden />
            Authenticity guarantee
          </h1>
          <p className="mt-3 text-primary-foreground/85 max-w-2xl">
            TruffleNation is built around transparent sourcing and verified sellers — so you know what
            you are buying.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 space-y-8">
        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Verified sellers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Sellers complete a profile and verification flow before listing. We surface origin,
              species, and harvest context so buyers can make informed choices.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Species &amp; labeling</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Listings should accurately describe the truffle species or product (e.g. Tuber
              melanosporum vs summer truffle). Misrepresentation may result in removal from the
              marketplace and buyer refunds where applicable.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Disputes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              If you believe a product is not as described, reach out via our contact page with your
              order details. We will review and work with the seller toward a fair resolution.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
