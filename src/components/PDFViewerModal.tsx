import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { verifyDocumentAccess } from '@/supabase/pdfNavigation';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  filename: string;
  initialPage?: number;
  context?: string;
  highlight?: {
    text: string;
  };
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  documentId,
  filename,
  initialPage = 1,
  context,
  highlight
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && documentId) {
      loadPDF();
    }
    return () => {
      // Cleanup blob URL when component unmounts or closes
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, documentId]);

  const loadPDF = async () => {
    setLoading(true);
    setError("");
    
    try {
      // First verify document access
      const hasAccess = await verifyDocumentAccess(documentId);
      if (!hasAccess) {
        throw new Error('Document not found or access denied');
      }

      // Get the document to find its storage path
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (docError || !docData) {
        throw new Error('Document not found');
      }

      // Download the PDF from storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('financial-pdfs')
        .download(docData.storage_path);

      if (storageError || !fileData) {
        throw new Error('Failed to load PDF file');
      }

      // Convert to base64 data URI like in Documents.tsx
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      const url = `data:application/pdf;base64,${base64}`;
      
      // Add page parameter to URL for navigation
      const urlWithPage = initialPage > 1 ? `${url}#page=${initialPage}` : url;
      setPdfUrl(urlWithPage);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setError(err.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] mx-4 bg-base-100 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-base-content truncate">
              {filename}
            </h3>
            {context && (
              <p className="text-sm text-base-content/70 mt-1">{context}</p>
            )}
            {initialPage > 1 && (
              <p className="text-sm text-primary mt-1">Navigated to page {initialPage}</p>
            )}
            {highlight?.text && (
              <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded text-sm">
                <span className="text-warning font-medium">Highlighted text: </span>
                <span className="text-base-content/80">"{highlight.text}"</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle ml-4"
            aria-label="Close PDF viewer"
          >
            <X size={20} />
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 p-4" style={{ height: 'calc(90vh - 120px)' }}>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="loading loading-spinner loading-lg"></div>
              <span className="ml-3 text-base-content">Loading PDF...</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="alert alert-error max-w-md">
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {pdfUrl && !loading && !error && (
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full h-full rounded border border-base-300"
              title={`PDF: ${filename}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
