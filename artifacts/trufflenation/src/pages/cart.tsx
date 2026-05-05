import { useMemo, useState } from "react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import type { CartItem, Order } from "@workspace/api-client-react";
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
import { CreditCard, Info, ShoppingCart, Trash2, ArrowRight } from "lucide-react";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function luhnCheck(raw: string): boolean {
  const d = digitsOnly(raw);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d.charAt(i), 10);
    if (Number.isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function formatCardGroups(raw: string): string {
  return digitsOnly(raw)
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(raw: string): string {
  const d = digitsOnly(raw).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function expiryIsValid(expiry: string): boolean {
  const d = digitsOnly(expiry);
  if (d.length !== 4) return false;
  const mm = Number(d.slice(0, 2));
  const yy = Number(d.slice(2, 4));
  if (mm < 1 || mm > 12) return false;
  const fullYear = 2000 + yy;
  const lastDay = new Date(fullYear, mm, 0);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return lastDay >= startOfToday;
}

function buildShippingBlock(f: {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}): string {
  const lines = [
    f.fullName.trim(),
    f.line1.trim(),
    f.line2.trim(),
    [f.city.trim(), f.region.trim(), f.postalCode.trim()].filter(Boolean).join(", "),
    f.country.trim(),
    `Phone: ${f.phone.trim()}`,
    `Email: ${f.email.trim()}`,
  ].filter((line) => line.length > 0);
  return lines.join("\n");
}

function buildPaymentNotes(f: {
  nameOnCard: string;
  last4: string;
  expiryDisplay: string;
  billingZip: string;
}): string {
  return [
    "Payment reference (PCI-safe):",
    `Cardholder: ${f.nameOnCard.trim()}`,
    `Card: ****${f.last4} | Exp ${f.expiryDisplay}`,
    `Billing ZIP: ${f.billingZip.trim()}`,
    "",
    "Full card number and CVV were not sent to our servers. For production, use Stripe (or similar) with Payment Element / Checkout.",
  ].join("\n");
}

export default function CartPage() {
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingZipSame, setBillingZipSame] = useState(true);
  const [billingZip, setBillingZip] = useState("");

  const total = useMemo(
    () =>
      (cart ?? []).reduce(
        (sum: number, item: CartItem) => sum + item.quantityGrams * (item.product?.pricePerGram ?? 0),
        0
      ),
    [cart]
  );

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

  const validateCheckout = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const req = (key: string, label: string, v: string) => {
      if (!v.trim()) e[key] = `${label} is required`;
    };

    req("fullName", "Full name", fullName);
    req("email", "Email", email);
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email";
    req("phone", "Phone", phone);
    req("line1", "Street address", line1);
    req("city", "City", city);
    req("region", "State / province", region);
    req("postalCode", "Postal code", postalCode);
    req("country", "Country", country);

    req("nameOnCard", "Name on card", nameOnCard);
    const pan = digitsOnly(cardNumber);
    if (pan.length < 13) e.cardNumber = "Enter a complete card number";
    else if (!luhnCheck(pan)) e.cardNumber = "Card number failed validation (check digits)";
    if (!expiryIsValid(expiry)) e.expiry = "Enter a valid future expiry (MM/YY)";
    const cv = digitsOnly(cvc);
    if (cv.length < 3 || cv.length > 4) e.cvc = "Enter the 3–4 digit security code";

    const billZip = billingZipSame ? postalCode.trim() : billingZip.trim();
    if (!billZip) e.billingZip = "Billing postal code is required";

    return e;
  };

  const handleCheckout = () => {
    if (!checkoutOpen) {
      setCheckoutOpen(true);
      setFormErrors({});
      return;
    }

    const errs = validateCheckout();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      toast({
        title: "Check your details",
        description: "Fix the highlighted fields before paying.",
        variant: "destructive",
      });
      return;
    }

    const pan = digitsOnly(cardNumber);
    const last4 = pan.slice(-4);
    const expDigits = digitsOnly(expiry);
    const expiryDisplay = `${expDigits.slice(0, 2)}/${expDigits.slice(2, 4)}`;
    const billZip = billingZipSame ? postalCode.trim() : billingZip.trim();

    const shippingAddress = buildShippingBlock({
      fullName,
      line1,
      line2,
      city,
      region,
      postalCode,
      country,
      phone,
      email,
    });

    const notes = buildPaymentNotes({
      nameOnCard,
      last4,
      expiryDisplay,
      billingZip: billZip,
    });

    createOrder.mutate(
      { data: { shippingAddress, notes } },
      {
        onSuccess: (order: Order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          setCheckoutOpen(false);
          setFormErrors({});
          toast({
            title: "Order placed",
            description: `Order #${order.id} confirmed. Total $${order.totalAmount.toFixed(2)}. You can review payment reference on the order page.`,
          });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to place order. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const err = (key: string) => formErrors[key];

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
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
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
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  {cart.map((item: CartItem) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border border-border bg-card"
                      data-testid={`row-cart-item-${item.id}`}
                    >
                      <div className="w-20 h-20 bg-primary/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary/20 font-serif italic text-xl">♦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/shop/${item.productId}`}>
                          <h3 className="font-serif font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                            {item.product?.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">${item.product?.pricePerGram.toFixed(2)}/g</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            data-testid={`button-decrease-${item.id}`}
                            variant="outline"
                            size="sm"
                            className="rounded-none w-7 h-7 p-0 text-xs"
                            onClick={() => handleQuantityChange(item.id, -5, item.quantityGrams)}
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium" data-testid={`text-quantity-${item.id}`}>
                            {item.quantityGrams}g
                          </span>
                          <Button
                            data-testid={`button-increase-${item.id}`}
                            variant="outline"
                            size="sm"
                            className="rounded-none w-7 h-7 p-0 text-xs"
                            onClick={() => handleQuantityChange(item.id, 5, item.quantityGrams)}
                          >
                            +
                          </Button>
                          <Button
                            data-testid={`button-remove-${item.id}`}
                            variant="ghost"
                            size="sm"
                            className="rounded-none ml-auto text-destructive hover:text-destructive/80 p-1"
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

                {checkoutOpen && (
                  <div className="border border-border bg-card p-6 space-y-8">
                    <Alert className="rounded-none border-primary/30 bg-primary/5">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Secure checkout</AlertTitle>
                      <AlertDescription className="text-muted-foreground mt-1 leading-relaxed">
                        Enter your shipping address and card details below. We validate your card with the Luhn check and
                        expiry. Only a masked reference (last four digits, expiry, billing ZIP) is stored with your order —
                        never the full card number or CVV. For real charges, integrate{" "}
                        <a className="underline text-foreground font-medium" href="https://stripe.com/docs/payments">
                          Stripe
                        </a>{" "}
                        or another PCI-compliant processor.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <h3 className="font-serif text-lg text-primary mb-4">Shipping &amp; contact</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="cart-fullName">Full name</Label>
                          <Input
                            id="cart-fullName"
                            className="rounded-none"
                            value={fullName}
                            onChange={(ev) => setFullName(ev.target.value)}
                            autoComplete="name"
                          />
                          {err("fullName") && <p className="text-xs text-destructive">{err("fullName")}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cart-email">Email</Label>
                          <Input
                            id="cart-email"
                            type="email"
                            className="rounded-none"
                            value={email}
                            onChange={(ev) => setEmail(ev.target.value)}
                            autoComplete="email"
                          />
                          {err("email") && <p className="text-xs text-destructive">{err("email")}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cart-phone">Phone</Label>
                          <Input
                            id="cart-phone"
                            type="tel"
                            className="rounded-none"
                            value={phone}
                            onChange={(ev) => setPhone(ev.target.value)}
                            autoComplete="tel"
                          />
                          {err("phone") && <p className="text-xs text-destructive">{err("phone")}</p>}
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="cart-line1">Street address</Label>
                          <Input
                            id="cart-line1"
                            className="rounded-none"
                            value={line1}
                            onChange={(ev) => setLine1(ev.target.value)}
                            autoComplete="address-line1"
                          />
                          {err("line1") && <p className="text-xs text-destructive">{err("line1")}</p>}
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="cart-line2">Apt, suite (optional)</Label>
                          <Input
                            id="cart-line2"
                            className="rounded-none"
                            value={line2}
                            onChange={(ev) => setLine2(ev.target.value)}
                            autoComplete="address-line2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cart-city">City</Label>
                          <Input id="cart-city" className="rounded-none" value={city} onChange={(ev) => setCity(ev.target.value)} autoComplete="address-level2" />
                          {err("city") && <p className="text-xs text-destructive">{err("city")}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cart-region">State / province</Label>
                          <Input
                            id="cart-region"
                            className="rounded-none"
                            value={region}
                            onChange={(ev) => setRegion(ev.target.value)}
                            autoComplete="address-level1"
                          />
                          {err("region") && <p className="text-xs text-destructive">{err("region")}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cart-postal">Postal code</Label>
                          <Input
                            id="cart-postal"
                            className="rounded-none"
                            value={postalCode}
                            onChange={(ev) => setPostalCode(ev.target.value)}
                            autoComplete="postal-code"
                          />
                          {err("postalCode") && <p className="text-xs text-destructive">{err("postalCode")}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cart-country">Country</Label>
                          <Input
                            id="cart-country"
                            className="rounded-none"
                            value={country}
                            onChange={(ev) => setCountry(ev.target.value)}
                            autoComplete="country-name"
                          />
                          {err("country") && <p className="text-xs text-destructive">{err("country")}</p>}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" aria-hidden />
                        Payment card
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="cart-nameOnCard">Name on card</Label>
                          <Input
                            id="cart-nameOnCard"
                            className="rounded-none"
                            value={nameOnCard}
                            onChange={(ev) => setNameOnCard(ev.target.value)}
                            autoComplete="cc-name"
                          />
                          {err("nameOnCard") && <p className="text-xs text-destructive">{err("nameOnCard")}</p>}
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="cart-cardNumber">Card number</Label>
                          <Input
                            id="cart-cardNumber"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            className="rounded-none font-mono tracking-wide"
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={(ev) => setCardNumber(formatCardGroups(ev.target.value))}
                          />
                          {err("cardNumber") && <p className="text-xs text-destructive">{err("cardNumber")}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cart-expiry">Expiry (MM/YY)</Label>
                          <Input
                            id="cart-expiry"
                            inputMode="numeric"
                            className="rounded-none font-mono"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(ev) => setExpiry(formatExpiry(ev.target.value))}
                            autoComplete="cc-exp"
                          />
                          {err("expiry") && <p className="text-xs text-destructive">{err("expiry")}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cart-cvc">CVC / CVV</Label>
                          <Input
                            id="cart-cvc"
                            inputMode="numeric"
                            type="password"
                            className="rounded-none font-mono"
                            placeholder="•••"
                            value={cvc}
                            onChange={(ev) => setCvc(digitsOnly(ev.target.value).slice(0, 4))}
                            autoComplete="cc-csc"
                          />
                          {err("cvc") && <p className="text-xs text-destructive">{err("cvc")}</p>}
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                          <Checkbox
                            id="cart-bill-same"
                            checked={billingZipSame}
                            onCheckedChange={(v) => setBillingZipSame(v === true)}
                          />
                          <Label htmlFor="cart-bill-same" className="text-sm font-normal cursor-pointer">
                            Billing postal code same as shipping
                          </Label>
                        </div>
                        {!billingZipSame && (
                          <div className="sm:col-span-2 space-y-2">
                            <Label htmlFor="cart-billingZip">Billing postal code</Label>
                            <Input
                              id="cart-billingZip"
                              className="rounded-none"
                              value={billingZip}
                              onChange={(ev) => setBillingZip(ev.target.value)}
                              autoComplete="postal-code"
                            />
                            {err("billingZip") && <p className="text-xs text-destructive">{err("billingZip")}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="border border-border bg-card p-6 sticky top-24">
                  <h3 className="font-serif font-bold text-lg text-primary mb-4">Order summary</h3>
                  <div className="space-y-2 text-sm mb-6">
                    {cart.map((item: CartItem) => (
                      <div key={item.id} className="flex justify-between text-muted-foreground gap-2">
                        <span className="min-w-0 truncate">
                          {item.product?.name} ({item.quantityGrams}g)
                        </span>
                        <span className="shrink-0">${(item.quantityGrams * (item.product?.pricePerGram ?? 0)).toFixed(2)}</span>
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
                    {createOrder.isPending
                      ? "Processing…"
                      : checkoutOpen
                        ? `Pay ${total.toFixed(2)} USD`
                        : "Proceed to secure checkout"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  {checkoutOpen && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full mt-2 rounded-none text-muted-foreground"
                      onClick={() => {
                        setCheckoutOpen(false);
                        setFormErrors({});
                      }}
                    >
                      Back to cart only
                    </Button>
                  )}
                  <Button asChild variant="ghost" className="w-full mt-2 rounded-none text-muted-foreground">
                    <Link href="/shop">Continue shopping</Link>
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
