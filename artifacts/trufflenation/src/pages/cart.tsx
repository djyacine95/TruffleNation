import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  useGetCart,
  getGetCartQueryKey,
  useUpdateCartItem,
  useRemoveFromCart,
  useCreateOrder,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@clerk/react";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const total = (cart ?? []).reduce((sum, item) => sum + item.quantityGrams * (item.product?.pricePerGram ?? 0), 0);

  const handleQuantityChange = (id: number, delta: number, current: number) => {
    const newQty = Math.max(5, current + delta);
    updateItem.mutate(
      { id, data: { quantityGrams: newQty } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleRemove = (id: number) => {
    removeItem.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleCheckout = () => {
    createOrder.mutate(
      { data: {} },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Order placed!", description: `Order #${order.id} confirmed. Total: $${order.totalAmount.toFixed(2)}` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to place order. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold">Your Cart</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-12">
        <Show when="signed-out">
          <div className="text-center py-24">
            <ShoppingCart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-primary mb-2">Sign in to view your cart</h2>
            <p className="text-muted-foreground mb-6">Your cart is waiting for you</p>
            <Button asChild className="rounded-none bg-primary text-primary-foreground">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </Show>

        <Show when="signed-in">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : !cart || cart.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingCart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-primary mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Discover exceptional truffles in our catalog</p>
              <Button asChild className="rounded-none bg-primary text-primary-foreground">
                <Link href="/shop">Browse Catalog</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-border bg-card" data-testid={`row-cart-item-${item.id}`}>
                    <div className="w-20 h-20 bg-primary/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary/20 font-serif italic text-xl">♦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/shop/${item.productId}`}>
                        <h3 className="font-serif font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">{item.product?.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">${item.product?.pricePerGram.toFixed(2)}/g</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          data-testid={`button-decrease-${item.id}`}
                          variant="outline" size="sm" className="rounded-none w-7 h-7 p-0 text-xs"
                          onClick={() => handleQuantityChange(item.id, -5, item.quantityGrams)}
                        >-</Button>
                        <span className="text-sm font-medium" data-testid={`text-quantity-${item.id}`}>{item.quantityGrams}g</span>
                        <Button
                          data-testid={`button-increase-${item.id}`}
                          variant="outline" size="sm" className="rounded-none w-7 h-7 p-0 text-xs"
                          onClick={() => handleQuantityChange(item.id, 5, item.quantityGrams)}
                        >+</Button>
                        <Button
                          data-testid={`button-remove-${item.id}`}
                          variant="ghost" size="sm" className="rounded-none ml-auto text-destructive hover:text-destructive/80 p-1"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary" data-testid={`text-item-subtotal-${item.id}`}>
                        ${(item.quantityGrams * (item.product?.pricePerGram ?? 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="border border-border bg-card p-6 sticky top-24">
                  <h3 className="font-serif font-bold text-lg text-primary mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-muted-foreground">
                        <span>{item.product?.name} ({item.quantityGrams}g)</span>
                        <span>${(item.quantityGrams * (item.product?.pricePerGram ?? 0)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-bold text-foreground mb-6">
                    <span>Total</span>
                    <span data-testid="text-cart-total">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    data-testid="button-checkout"
                    className="w-full rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 py-5 font-semibold gap-2"
                    onClick={handleCheckout}
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? "Placing Order..." : "Place Order"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button asChild variant="ghost" className="w-full mt-2 rounded-none text-muted-foreground">
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </PageLayout>
  );
}
