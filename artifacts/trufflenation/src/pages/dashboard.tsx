import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  useGetDashboardSummary,
  useGetSellerStats,
  useGetRecentActivity,
  useListOrders,
} from "@workspace/api-client-react";
import { Show } from "@clerk/react";
import { useUser } from "@clerk/react";
import { ShoppingBag, TrendingUp, Package, Clock, ArrowRight, Plus } from "lucide-react";

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof ShoppingBag }) {
  return (
    <Card className="rounded-none border-border">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BuyerDashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: orders, isLoading: ordersLoading } = useListOrders({ role: "buyer" });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  if (summaryLoading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Orders" value={summary?.totalOrders ?? 0} icon={ShoppingBag} data-testid="stat-total-orders" />
        <StatCard label="Pending Orders" value={summary?.pendingOrders ?? 0} icon={Clock} />
        <StatCard label="Total Spent" value={`$${(summary?.totalSpent ?? 0).toFixed(2)}`} icon={TrendingUp} />
      </div>

      <div className="flex gap-4">
        <Button asChild className="rounded-none bg-primary text-primary-foreground gap-2">
          <Link href="/shop"><ShoppingBag className="w-4 h-4" /> Browse Truffles</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-none gap-2">
          <Link href="/orders">View All Orders <ArrowRight className="w-4 h-4" /></Link>
        </Button>
        {summary?.isSeller && (
          <Button asChild variant="outline" className="rounded-none gap-2">
            <Link href="/sell">Seller Hub <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-serif font-bold text-xl text-primary mb-4">Recent Orders</h2>
          {ordersLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : !orders || orders.length === 0 ? (
            <p className="text-muted-foreground text-sm border border-dashed border-border p-6 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="flex items-center justify-between p-4 border border-border hover:border-primary/30 transition-colors bg-card cursor-pointer" data-testid={`row-order-${order.id}`}>
                    <div>
                      <p className="font-medium text-foreground text-sm">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="rounded-none text-xs capitalize bg-primary/10 text-primary border-0">{order.status}</Badge>
                      <span className="font-semibold text-sm text-primary">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-serif font-bold text-xl text-primary mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !activity || activity.length === 0 ? (
            <p className="text-muted-foreground text-sm border border-dashed border-border p-6 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-card border border-border" data-testid={`row-activity-${item.id}`}>
                  <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SellerDashboard() {
  const { data: stats, isLoading } = useGetSellerStats();

  if (isLoading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl text-primary">Seller Overview</h2>
        <Button asChild className="rounded-none bg-secondary text-secondary-foreground gap-2">
          <Link href="/sell/new"><Plus className="w-4 h-4" /> New Listing</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} icon={TrendingUp} />
        <StatCard label="Orders Fulfilled" value={stats?.totalOrdersFulfilled ?? 0} icon={Package} />
        <StatCard label="Active Listings" value={stats?.activeListings ?? 0} icon={ShoppingBag} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-serif font-semibold text-primary mb-4">Top Products</h3>
          {!stats?.topProducts || stats.topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm border border-dashed border-border p-6 text-center">No products yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-border bg-card" data-testid={`row-product-${product.id}`}>
                  <div>
                    <p className="font-medium text-sm text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary text-sm">${product.pricePerGram.toFixed(2)}/g</p>
                    <p className="text-xs text-muted-foreground">{product.stockGrams}g stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-serif font-semibold text-primary mb-4">Recent Sales</h3>
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm border border-dashed border-border p-6 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="flex items-center justify-between p-4 border border-border hover:border-primary/30 transition-colors bg-card cursor-pointer">
                    <div>
                      <p className="font-medium text-sm text-foreground">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="rounded-none text-xs capitalize bg-primary/10 text-primary border-0">{order.status}</Badge>
                      <span className="font-semibold text-sm text-primary">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button asChild className="rounded-none bg-primary text-primary-foreground gap-2">
          <Link href="/sell">Manage Inventory <ArrowRight className="w-4 h-4" /></Link>
        </Button>
        <Button asChild variant="outline" className="rounded-none gap-2">
          <Link href="/orders?role=seller">All Seller Orders</Link>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const { data: summary } = useGetDashboardSummary();

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="text-primary-foreground/60 text-sm uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="text-4xl font-serif font-bold">{user?.firstName ?? "Truffle Enthusiast"}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12">
        <Show when="signed-out">
          <div className="text-center py-24">
            <Button asChild className="rounded-none"><Link href="/sign-in">Sign In</Link></Button>
          </div>
        </Show>
        <Show when="signed-in">
          <div className="space-y-12">
            <BuyerDashboard />
            {summary?.isSeller && (
              <div className="border-t border-border pt-12">
                <SellerDashboard />
              </div>
            )}
          </div>
        </Show>
      </div>
    </PageLayout>
  );
}
