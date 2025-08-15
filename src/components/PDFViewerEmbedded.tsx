import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { verifyDocumentAccess } from '@/supabase/pdfNavigation';

interface PDFViewerEmbeddedProps {
  documentId: string;
  filename: string;
  initialPage?: number;
}

export const PDFViewerEmbedded: React.FC<PDFViewerEmbeddedProps> = ({
  documentId,
  filename,
  initialPage = 1
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (documentId) {
      loadPDF();
    }
    return () => {
      // Cleanup blob URL when component unmounts
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId]);

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

  return (
    <div className="flex-1 p-4">
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
  );
};
