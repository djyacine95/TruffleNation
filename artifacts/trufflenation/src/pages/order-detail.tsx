import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useParams } from "wouter";
import {
  useGetOrder,
  getGetOrderQueryKey,
  getListOrdersQueryKey,
  useUpdateOrderStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/react";
import { ArrowLeft } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  const updateStatus = useUpdateOrderStatus();

  const isSeller = order?.sellerUserId === user?.id;

  const handleStatusUpdate = (status: string) => {
    updateStatus.mutate(
      { id: orderId, data: { status: status as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Order updated", description: `Status changed to ${status}` });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout>
        <div className="text-center py-24">
          <h2 className="text-2xl font-serif font-bold text-primary">Order not found</h2>
          <Button asChild className="mt-6 rounded-none" variant="outline">
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        <Button asChild variant="ghost" className="mb-8 text-muted-foreground hover:text-primary -ml-2 gap-2">
          <Link href="/orders"><ArrowLeft className="w-4 h-4" /> Back to Orders</Link>
        </Button>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary" data-testid="text-order-id">Order #{order.id}</h1>
            <p className="text-muted-foreground mt-1">
              Placed {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Badge className={`rounded-none border text-sm capitalize px-3 py-1 ${STATUS_COLORS[order.status] ?? ""}`} data-testid="status-order">
            {order.status}
          </Badge>
        </div>

        {isSeller && (
          <div className="mb-8 p-4 bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-3">Update Order Status</p>
            <div className="flex gap-3 items-center">
              <Select defaultValue={order.status} onValueChange={handleStatusUpdate}>
                <SelectTrigger data-testid="select-order-status" className="w-48 rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updateStatus.isPending && <span className="text-sm text-muted-foreground">Updating...</span>}
            </div>
          </div>
        )}

        <div className="border border-border bg-card mb-6">
          <div className="p-4 border-b border-border">
            <h2 className="font-serif font-semibold text-foreground">Items</h2>
          </div>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 border-b border-border last:border-0" data-testid={`row-order-item-${item.id}`}>
              <div>
                <p className="font-medium text-foreground">{item.productName}</p>
                <p className="text-sm text-muted-foreground">{item.quantityGrams}g × ${item.pricePerGram.toFixed(2)}/g</p>
              </div>
              <p className="font-semibold text-primary">${item.subtotal.toFixed(2)}</p>
            </div>
          ))}
          <div className="p-4 bg-muted/30 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary" data-testid="text-order-total">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {order.shippingAddress && (
          <div className="p-4 border border-border bg-card mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Shipping Address</p>
            <p className="text-foreground">{order.shippingAddress}</p>
          </div>
        )}

        {order.notes && (
          <div className="p-4 border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Notes</p>
            <p className="text-foreground italic">{order.notes}</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
