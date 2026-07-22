import { useState, useRef, useEffect } from "react";
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  X,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";

// Set up the worker
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export function PdfViewer({ fileUrl, fileName, onClose }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.3);
  const [loading, setLoading] = useState(true);
  const [pageInput, setPageInput] = useState("1");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rendering, setRendering] = useState(false);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setLoading(false);
      }
    };

    loadPdf();
  }, [fileUrl]);

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current || rendering) return;

    const renderPage = async () => {
      try {
        setRendering(true);
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale });
        const dpiScale = window.devicePixelRatio || 1;

        // Set canvas display size
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Set canvas render size (accounting for device pixel ratio)
        canvas.width = viewport.width * dpiScale;
        canvas.height = viewport.height * dpiScale;

        // Scale context for high DPI
        context.scale(dpiScale, dpiScale);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setRendering(false);
      } catch (error) {
        console.error("Error rendering page:", error);
        setRendering(false);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, rendering]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(String(page));
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-slate-50 ${isFullScreen ? "fixed inset-0 z-50" : "h-full"}`}
    >
      {/* Header - Toolbar */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        {/* Left: File info */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {totalPages} {totalPages === 1 ? "page" : "pages"}
            </p>
          </div>
        </div>

        {/* Center: Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputSubmit}
              onKeyDown={(e) => e.key === "Enter" && handlePageInputSubmit()}
              className="w-14 h-8 text-center text-sm"
            />
            <span className="text-sm text-muted-foreground">
              / {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Right: Zoom & Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button variant="outline" size="sm" onClick={toggleFullScreen}>
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-100 p-6 flex justify-center"
      >
        <div className="bg-white shadow-lg">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto"
            style={{ display: "block" }}
          />
        </div>
      </div>

      {/* Footer - Page info */}
      <div className="bg-white border-t border-border px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      </div>
    </div>
  );
}
