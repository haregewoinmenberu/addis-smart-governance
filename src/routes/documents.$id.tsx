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
      type: (search.type as string) || "service-form", // 'service-form', 'research-idea', 'research-workflow', 'research-report-response', or 'research-report-document'
      attachmentId: (search.attachmentId as string) || "",
      fileType: (search.fileType as string) || "",
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
        } else if (search.type === "research-workflow" && search.path) {
          apiUrl = `/api/research-workflow/progress/${id}/download-file?path=${encodeURIComponent(search.path)}`;
          console.log("Using research-workflow endpoint:", apiUrl);
        } else if (search.type === "research-report-response") {
          apiUrl = `/api/research/reports/responses/${id}/certificate`;
          console.log("Using research-report-response endpoint:", apiUrl);
        } else if (search.type === "research-report-document" && search.attachmentId) {
          apiUrl = `/api/research/reports/${id}/documents/${search.attachmentId}/download`;
          console.log("Using research-report-document endpoint:", apiUrl);
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

  // Check if file is PDF
  const isPdf = search.fileType === 'application/pdf' || 
                search.name.toLowerCase().endsWith('.pdf');

  // Check if file is an image
  const isImage = search.fileType?.startsWith('image/') ||
                  /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(search.name);

  return (
    <AppShell>
      {isPdf ? (
        <PdfReaderLayout
          fileUrl={fileUrl}
          fileName={search.name || "document.pdf"}
          onClose={handleClose}
        />
      ) : isImage ? (
        <div className="flex flex-col h-full bg-slate-50">
          {/* Image Viewer Toolbar */}
          <div className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div className="h-6 w-px bg-border" />
                <span className="text-sm font-semibold">{search.name}</span>
              </div>
              <a
                href={fileUrl}
                download={search.name}
                className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Download
              </a>
            </div>
          </div>
          {/* Image Display */}
          <div className="flex-1 overflow-auto bg-slate-100 p-6 flex items-center justify-center">
            <img
              src={fileUrl}
              alt={search.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
            />
          </div>
        </div>
      ) : (
        // Other file types - show download option
        <div className="flex flex-col h-full bg-slate-50">
          <div className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{search.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This file type cannot be previewed in the browser
              </p>
              <a
                href={fileUrl}
                download={search.name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
