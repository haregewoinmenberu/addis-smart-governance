import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/landingpage/landing/Navbar";
import { Hero } from "@/components/landingpage/landing/Hero";
import { Services } from "@/components/landingpage/landing/Services";
import { GovernanceValue } from "@/components/landingpage/landing/GovernanceValue";
import { HowItWorks } from "@/components/landingpage/landing/HowItWorks";
import { Footer } from "@/components/landingpage/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STRP — Smart Technology Regulatory Portal | Addis Ababa" },
      {
        name: "description",
        content: "One Government. One Portal. All Technology Services. The unified AI-powered digital governance platform for Addis Ababa — research, transformation, licensing and learning in one secure ecosystem.",
      },
      { property: "og:title", content: "STRP — Unified Government Technology Portal" },
      {
        property: "og:description",
        content: "AI-powered digital governance platform unifying research, transformation, licensing and learning across Addis Ababa government services.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  // Don't render landing page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Show landing page for unauthenticated users
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Services />
      <GovernanceValue />
      <HowItWorks />
      <Footer />
    </main>
  );
}
