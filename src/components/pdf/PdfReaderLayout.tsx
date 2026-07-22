import { useState, useRef, useEffect, useCallback } from "react";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  FileText,
  Menu,
  X,
} from "lucide-react";

// Dynamically import pdf.js only on client-side
let pdfjs: typeof import("pdfjs-dist") | null = null;
if (typeof window !== "undefined") {
  pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

interface PdfReaderLayoutProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export function PdfReaderLayout({ fileUrl, fileName, onClose }: PdfReaderLayoutProps) {
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasksRef = useRef<Map<number, RenderTask>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [pageInput, setPageInput] = useState("1");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fitMode, setFitMode] = useState<"width" | "page">("page");
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfjs) return;
      
      try {
        setLoading(true);
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setLoading(false);
      }
    };

    loadPdf();

    // Cleanup
    return () => {
      // Cancel all render tasks
      renderTasksRef.current.forEach((task) => {
        task.cancel();
      });
      renderTasksRef.current.clear();
    };
  }, [fileUrl]);

  // Render a single page
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || renderedPages.has(pageNumber)) return;

      // Cancel any existing render task for this page
      const existingTask = renderTasksRef.current.get(pageNumber);
      if (existingTask) {
        existingTask.cancel();
        renderTasksRef.current.delete(pageNumber);
      }

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const canvas = canvasRefs.current.get(pageNumber);

        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // Clear the canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height);

        let viewport = page.getViewport({ scale, rotation: 0 });

        // Apply fit mode
        if (fitMode === "width" && containerRef.current) {
          const containerWidth = containerRef.current.clientWidth - 48; // padding
          const newScale = containerWidth / viewport.width;
          viewport = page.getViewport({ scale: newScale, rotation: 0 });
        }

        const dpiScale = window.devicePixelRatio || 1;

        // Set canvas size
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.width = viewport.width * dpiScale;
        canvas.height = viewport.height * dpiScale;

        // Scale context for high DPI
        context.scale(dpiScale, dpiScale);

        const renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });

        // Store the render task so we can cancel it if needed
        renderTasksRef.current.set(pageNumber, renderTask);

        await renderTask.promise;

        // Remove completed task
        renderTasksRef.current.delete(pageNumber);
        setRenderedPages((prev) => new Set(prev).add(pageNumber));
      } catch (error: any) {
        // Ignore cancellation errors
        if (error?.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNumber}:`, error);
        }
      }
    },
    [pdfDoc, scale, fitMode]
  );

  // Render visible pages
  useEffect(() => {
    if (!pdfDoc) return;

    // Render current page and adjacent pages
    const pagesToRender = [
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ].filter((p) => p >= 1 && p <= totalPages);

    pagesToRender.forEach(renderPage);
  }, [pdfDoc, currentPage, totalPages, renderPage]);

  // Re-render all pages when scale/fitMode changes
  useEffect(() => {
    // Cancel all existing render tasks
    renderTasksRef.current.forEach((task) => {
      task.cancel();
    });
    renderTasksRef.current.clear();
    setRenderedPages(new Set());
  }, [scale, fitMode]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(String(page));

      // Scroll to page
      const pageElement = document.getElementById(`pdf-page-${page}`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page)) {
      goToPage(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };



  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const toggleFitMode = () => {
    setFitMode((prev) => (prev === "width" ? "page" : "width"));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Left: Navigation & File Info */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="shrink-0"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="h-6 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0 lg:hidden"
              style={{ display: 'none' }}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="hidden md:flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-semibold truncate max-w-[200px]">
                {fileName}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                ({totalPages} pages)
              </span>
            </div>
          </div>

          {/* Center: Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5">
              <Input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={handlePageInputSubmit}
                onKeyDown={(e) => e.key === "Enter" && handlePageInputSubmit()}
                className="w-12 h-8 text-center text-sm px-1"
              />
              <span className="text-sm text-muted-foreground">/ {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Right: Tools */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="h-8 hidden sm:flex"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center hidden sm:block">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="h-8 hidden sm:flex"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
              className="h-8 hidden md:flex"
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-slate-100 p-6"
        >
          <div className="max-w-5xl mx-auto space-y-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                id={`pdf-page-${pageNum}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <canvas
                  ref={(el) => {
                    if (el) canvasRefs.current.set(pageNum, el);
                  }}
                  className="w-full"
                  style={{ display: "block" }}
                />
                <div className="px-4 py-2 bg-slate-50 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Page {pageNum} of {totalPages}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
