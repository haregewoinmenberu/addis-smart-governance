import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error; reset: () => void }) {
  console.error(error);
  
  // Redirect immediately to login page
  if (typeof window !== 'undefined') {
    window.location.replace('/login');
  }

  // Return null to avoid rendering anything
  return null;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "STRP - Smart Technology Request Portal | Addis Ababa ITDB" },
      { 
        name: "description", 
        content: "Smart Technology Request Portal for Addis Ababa City Administration Innovation and Technology Development Bureau. Manage technology requests, audits, and governance workflows." 
      },
      { name: "author", content: "Addis Ababa City Administration ITDB" },
      { name: "keywords", content: "ITDB, Addis Ababa, Smart City, Technology Request, Governance, Innovation, Technology Development Bureau" },
      { property: "og:title", content: "STRP - Smart Technology Request Portal" },
      { 
        property: "og:description", 
        content: "Smart Technology Request Portal for Addis Ababa City Administration Innovation and Technology Development Bureau" 
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Addis Ababa ITDB" },
      { property: "og:image", content: "https://aaitdb.gov.et/uploads/Setting/addis-ababa-city-administration-innovation-and-techenology-development-bureau-2026-03-26-69c4de59f1c4a.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "STRP - Smart Technology Request Portal" },
      { name: "twitter:description", content: "Smart Technology Request Portal for Addis Ababa City Administration ITDB" },
      { name: "twitter:image", content: "https://aaitdb.gov.et/uploads/Setting/addis-ababa-city-administration-innovation-and-techenology-development-bureau-2026-03-26-69c4de59f1c4a.png" },
      { name: "theme-color", content: "#147361" },
      { name: "application-name", content: "STRP Portal" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/favicon.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
