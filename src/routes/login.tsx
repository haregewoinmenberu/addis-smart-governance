import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Lock, Mail, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — STRP Portal" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-primary text-primary-foreground p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">STRP Portal</p>
            <p className="text-xs opacity-80">Addis Ababa ITDB</p>
          </div>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Smart Technology Regulatory Portal
          </h1>
          <p className="text-base opacity-85 leading-relaxed">
            Centralized governance for Addis Ababa's digital transformation — registries, audits, cybersecurity, and citizen-facing innovation in one secure command center.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            {["JWT secured", "WCAG 2.1 AA", "ISO 27001 aligned"].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20">{t}</span>
            ))}
          </div>
        </div>

        <div className="relative text-xs opacity-70">
          © {new Date().getFullYear()} Innovation and Technology Development Bureau
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md p-8 rounded-2xl border-border/60 shadow-elegant">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">STRP Portal</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in with your government credentials.</p>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Official email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@addisababa.gov.et" className="pl-9 h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-9 h-11" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox /> Keep me signed in
              </label>
              <span className="flex items-center gap-1 text-xs text-success"><ShieldCheck className="h-3.5 w-3.5" />Secure</span>
            </div>

            <Button asChild className="w-full h-11 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <Link to="/">Sign in</Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Protected by multi-factor authentication and role-based access control.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
