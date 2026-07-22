import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getAuthToken } from "@/lib/api";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { PdfReaderLayout } from "@/components/pdf/PdfReaderLayout";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/documents/$id")({
  component: () => (
    <RequireAuth>
      <DocumentViewerPage />
    </RequireAuth>
  ),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      path: (search.path as string) || "",
      name: (search.name as string) || "document.pdf",
      returnTo: (search.returnTo as string) || "/",
      type: (search.type as string) || "service-form", // 'service-form' or 'research-idea'
      attachmentId: (search.attachmentId as string) || "",
    };
  },
});

function DocumentViewerPage() {
  const { id } = Route.useParams();
  const search = useSearch({ from: "/documents/$id" });
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        
        console.log("Document viewer params:", { 
          id, 
          type: search.type, 
          attachmentId: search.attachmentId,
          path: search.path
        });
        
        let apiUrl = "";
        
        // Choose the correct API endpoint based on file type
        if (search.type === "research-idea" && search.attachmentId) {
          apiUrl = `/api/research-ideas/${id}/attachments/${search.attachmentId}/download`;
          console.log("Using research-idea endpoint:", apiUrl);
        } else {
          // Default to service-form endpoint
          apiUrl = `/api/service-forms/${id}/download-file?path=${encodeURIComponent(search.path)}`;
          console.log("Using service-form endpoint:", apiUrl);
        }
        
        // Use GET request with submission ID in path and file path as query parameter
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
        setLoading(false);
      } catch (err) {
        console.error("Error loading file:", err);
        setError("Failed to load document");
        setLoading(false);
      }
    };

    if (search.path || search.attachmentId) {
      fetchFile();
    }

    // Cleanup blob URL on unmount
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [search.path, search.attachmentId, search.type, id]);

  const handleClose = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    navigate({ to: search.returnTo || "/" });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !fileUrl) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-sm text-destructive mb-4">{error || "Failed to load document"}</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go Back
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PdfReaderLayout
        fileUrl={fileUrl}
        fileName={search.name || "document.pdf"}
        onClose={handleClose}
      />
    </AppShell>
  );
}
