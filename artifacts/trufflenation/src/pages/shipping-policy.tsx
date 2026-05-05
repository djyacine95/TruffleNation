import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShippingPolicyPage() {
  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12 border-b border-primary-foreground/10">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold">Shipping policy</h1>
          <p className="mt-3 text-primary-foreground/85 max-w-2xl">
            How we pack, ship, and deliver fresh truffle orders from sellers to your door.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 space-y-8">
        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Perishable handling</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Fresh truffles are temperature-sensitive. Sellers ship in insulated packaging with cold
              packs where appropriate. Delivery windows and carriers are chosen to minimize time in
              transit.
            </p>
            <p>
              You will receive tracking information when your order ships. Please plan to refrigerate
              or use truffles promptly after delivery per the seller’s care instructions.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Rates &amp; regions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Shipping costs and eligible regions are set by each seller at checkout. International
              orders may be subject to customs, duties, and import rules in your country — those are
              your responsibility unless the listing states otherwise.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Delays &amp; issues</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Weather, carrier disruptions, or holidays can delay shipments. If your package is
              damaged or significantly late, contact us with your order number and we will help
              coordinate with the seller.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
