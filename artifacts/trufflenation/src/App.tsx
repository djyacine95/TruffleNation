import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, Show, useClerk, useAuth } from "@clerk/react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useEffect, useRef } from "react";
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import ShopPage from "@/pages/shop";
import ProductPage from "@/pages/product";
import CartPage from "@/pages/cart";
import OrdersPage from "@/pages/orders";
import OrderDetailPage from "@/pages/order-detail";
import DashboardPage from "@/pages/dashboard";
import SellPage from "@/pages/sell";
import SellNewPage from "@/pages/sell-new";
import SellEditPage from "@/pages/sell-edit";
import SellersPage from "@/pages/sellers";
import SellerProfilePage from "@/pages/seller-profile";
import TrufflesGuidePage from "@/pages/truffles-guide";
import TruffleMapPage from "@/pages/truffle-map";
import TrufflesVideosPage from "@/pages/truffles-videos";
import ShippingPolicyPage from "@/pages/shipping-policy";
import AuthenticityGuaranteePage from "@/pages/authenticity-guarantee";
import ContactPage from "@/pages/contact";
import AuthNotConfiguredPage from "@/pages/auth-not-configured";
import AuthSignInPage from "@/pages/auth-sign-in";
import AuthSignUpPage from "@/pages/auth-sign-up";
import { clerkAppearance } from "@/lib/clerk-appearance";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
}

function ClerkAuthTokenSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return null;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!clerkPubKey) {
    return <AuthNotConfiguredPage />;
  }

  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <HomeRedirectBack />
      </Show>
    </>
  );
}

function HomeRedirectBack() {
  const [path, setLocation] = useLocation();
  useEffect(() => {
    setLocation(`/sign-in?redirect=${encodeURIComponent(path)}`);
  }, [path, setLocation]);
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 px-4 text-muted-foreground text-sm">
      <p>Redirecting to sign in…</p>
    </div>
  );
}

function AppRoutes() {
  const SignInComponent = clerkPubKey ? AuthSignInPage : AuthNotConfiguredPage;
  const SignUpComponent = clerkPubKey ? AuthSignUpPage : AuthNotConfiguredPage;

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/shop/:id" component={ProductPage} />
      <Route path="/sellers" component={SellersPage} />
      <Route path="/sellers/:id" component={SellerProfilePage} />
      <Route path="/truffles/videos" component={TrufflesVideosPage} />
      <Route path="/truffles" component={TrufflesGuidePage} />
      <Route path="/truffle-map" component={TruffleMapPage} />
      <Route path="/shipping-policy" component={ShippingPolicyPage} />
      <Route path="/authenticity-guarantee" component={AuthenticityGuaranteePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/sign-in/*?" component={SignInComponent} />
      <Route path="/sign-up/*?" component={SignUpComponent} />
      <Route path="/cart" component={() => <ProtectedRoute component={CartPage} />} />
      <Route path="/orders" component={() => <ProtectedRoute component={OrdersPage} />} />
      <Route path="/orders/:id" component={() => <ProtectedRoute component={OrderDetailPage} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
      <Route path="/sell" component={() => <ProtectedRoute component={SellPage} />} />
      <Route path="/sell/new" component={() => <ProtectedRoute component={SellNewPage} />} />
      <Route path="/sell/:id/edit" component={() => <ProtectedRoute component={SellEditPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ClerkAuthTokenSync />
        <AppRoutes />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <TooltipProvider>
        {clerkPubKey ? (
          <ClerkProviderWithRoutes />
        ) : (
          <QueryClientProvider client={queryClient}>
            <AppRoutes />
          </QueryClientProvider>
        )}
        <Toaster />
      </TooltipProvider>
    </WouterRouter>
  );
}

export default App;
