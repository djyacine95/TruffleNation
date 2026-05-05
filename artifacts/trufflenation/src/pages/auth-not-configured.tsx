import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

/**
 * Shown when `VITE_CLERK_PUBLISHABLE_KEY` is unset: sign-in/up routes and any
 * protected route the user navigates to directly.
 */
export default function AuthNotConfiguredPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-lg px-4 py-20 lg:py-28">
        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-primary">Authentication not configured</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              This build has no Clerk publishable key. You can still browse the catalog, guides, and map. Sign-in,
              cart, checkout, and seller tools need Clerk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">1. Create a key in the Clerk dashboard</p>
              <p className="text-sm text-muted-foreground">
                Use a <strong className="text-foreground">development</strong> instance and copy the publishable key
                (starts with <code className="text-xs bg-muted px-1 py-0.5">pk_test_</code>).
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">2. Add it where Vite can read it</p>
              <p className="text-sm text-muted-foreground mb-2">
                Put the line below in either <strong className="text-foreground">TruffleNation/.env</strong> (repo root,
                next to the workspace <code className="text-xs bg-muted px-1">package.json</code>) or in{" "}
                <code className="text-xs bg-muted px-1 py-0.5">artifacts/trufflenation/.env</code>. If both exist, the
                app folder wins for duplicate keys.
              </p>
              <pre className="text-xs bg-muted p-4 overflow-x-auto border border-border text-left leading-relaxed">
                {`VITE_CLERK_PUBLISHABLE_KEY=pk_test_...\n# optional — if your API runs locally:\n# VITE_API_URL=http://localhost:8080`}
              </pre>
              <p className="text-sm text-muted-foreground mt-3">
                Restart <code className="text-xs bg-muted px-1">npm run dev:web</code> after saving — Vite only reads env
                on startup.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="rounded-none bg-primary text-primary-foreground">
                <Link href="/">Back to home</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none">
                <Link href="/shop">Browse catalog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
