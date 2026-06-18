import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { login } from "@/lib/api";
import { Sparkles, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — STRP Portal" }] }),
  component: Login,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || '/',
    };
  },
});

function Login() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { isAuthenticated, isLoading, refetchUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("Already authenticated, redirecting from login page");
      const redirectPath = search.redirect && search.redirect !== '/login' ? search.redirect : '/dashboard';
      navigate({ to: redirectPath as any, replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, search.redirect]);

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await login(email, password);
      return result;
    },
    onSuccess: async () => {
      console.log("Login successful, refetching user data");
      
      // Refetch user data to update authentication state
      await refetchUser();
      
      // Get the redirect path, but make sure it's not /login
      const redirectPath = search.redirect && search.redirect !== '/login' ? search.redirect : '/dashboard';
      console.log("Redirecting to:", redirectPath);
      
      // Navigate to the redirect path or dashboard
      navigate({ to: redirectPath as any, replace: true });
    },
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

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

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Official email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@addisababa.gov.et"
                  className="pl-9 h-11"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-11"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox /> Keep me signed in
              </label>
              <span className="flex items-center gap-1 text-xs text-success"><ShieldCheck className="h-3.5 w-3.5" />Secure</span>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign in"}
            </Button>

            {mutation.isError && (
              <p className="text-xs text-destructive text-center">
                {mutation.error instanceof Error ? mutation.error.message : "Login failed"}
              </p>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Protected by multi-factor authentication and role-based access control.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
