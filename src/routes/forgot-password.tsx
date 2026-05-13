import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Mail } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — STRP" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-primary text-primary-foreground p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold">STRP Portal</p>
            <p className="text-xs opacity-80">Addis Ababa ITDB</p>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">Recover access to your government account.</h2>
          <p className="opacity-80">A secure recovery link will be delivered through verified email. Audit-grade logging keeps every reset traceable.</p>
        </div>
        <p className="text-xs opacity-70">© Addis Ababa City Innovation & Technology Development Bureau</p>
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md p-8 rounded-2xl border-border/60">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-3.5 w-3.5" />Back to sign in</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
          <p className="text-sm text-muted-foreground mt-1.5 mb-6">Enter your government email and we'll send you a secure recovery link.</p>
          <div className="space-y-4">
            <div>
              <Label>Government email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="name@addisababa.gov.et" />
              </div>
            </div>
            <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow">Send recovery link</Button>
            <p className="text-xs text-muted-foreground text-center">Need help? Contact <span className="text-primary">ITDB Support</span></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
