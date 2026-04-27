import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Show } from "@clerk/react";
import { Package, ArrowRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function OrdersPage() {
  const { data: allOrders, isLoading } = useListOrders();

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold">Orders</h1>
          <p className="text-primary-foreground/70 mt-2">Track your purchases and sales</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12">
        <Show when="signed-out">
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-primary mb-2">Sign in to view your orders</h2>
            <Button asChild className="rounded-none mt-4">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </Show>

        <Show when="signed-in">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
          ) : !allOrders || allOrders.length === 0 ? (
            <div className="text-center py-24">
              <Package className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-primary mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Your order history will appear here</p>
              <Button asChild className="rounded-none bg-primary text-primary-foreground">
                <Link href="/shop">Browse Catalog</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-6">{allOrders.length} order{allOrders.length !== 1 ? "s" : ""} total</p>
              {allOrders.map((order) => (
                <div key={order.id} className="border border-border bg-card p-6 hover:border-primary/30 transition-colors" data-testid={`row-order-${order.id}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif font-semibold text-foreground">Order #{order.id}</h3>
                        <Badge className={`rounded-none border text-xs capitalize ${STATUS_COLORS[order.status] ?? ""}`} data-testid={`status-order-${order.id}`}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                      <p className="text-sm text-muted-foreground mt-1">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary" data-testid={`text-order-total-${order.id}`}>${order.totalAmount.toFixed(2)}</p>
                      <Button asChild variant="ghost" className="mt-2 rounded-none text-sm gap-1">
                        <Link href={`/orders/${order.id}`}>View Details <ArrowRight className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <span key={item.id} className="text-xs text-muted-foreground bg-muted px-2 py-1">
                        {item.productName} ({item.quantityGrams}g)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Show>
      </div>
    </PageLayout>
  );
}
