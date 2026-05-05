import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";

const supportEmail =
  (typeof import.meta.env.VITE_SUPPORT_EMAIL === "string" && import.meta.env.VITE_SUPPORT_EMAIL) ||
  "hello@trufflenation.example";

export default function ContactPage() {
  const mailHref = `mailto:${supportEmail}?subject=TruffleNation%20support`;

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12 border-b border-primary-foreground/10">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold">Contact us</h1>
          <p className="mt-3 text-primary-foreground/85 max-w-2xl">
            Questions about orders, sellers, or your account? We are here to help.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 space-y-8">
        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary flex items-center gap-2">
              <Mail className="h-5 w-5" aria-hidden />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              For the fastest response, email us with your order number (if applicable) and a short
              description of the issue.
            </p>
            <p className="text-sm font-mono text-foreground bg-muted px-3 py-2 border border-border inline-block">
              {supportEmail}
            </p>
            <div>
              <Button asChild className="rounded-none bg-secondary text-secondary-foreground">
                <a href={mailHref}>Open in mail app</a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Set <code className="text-xs bg-muted px-1">VITE_SUPPORT_EMAIL</code> in your{" "}
              <code className="text-xs bg-muted px-1">.env</code> to override this address for your
              deployment.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary flex items-center gap-2">
              <MessageCircle className="h-5 w-5" aria-hidden />
              Response times
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>We aim to reply within one to two business days. Urgent perishable issues are prioritized.</p>
            <p>
              Account and sign-in problems are handled through our authentication provider (Clerk) as
              well — use “Forgot password” on the sign-in screen when relevant.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
