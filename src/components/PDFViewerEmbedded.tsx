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
    let createdBlobUrl = "";
    let isCancelled = false;

    const loadPDF = async () => {
      setLoading(true);
      setError("");

      try {
        const hasAccess = await verifyDocumentAccess(documentId);
        if (!hasAccess) {
          throw new Error('Document not found or access denied');
        }

        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('storage_path')
          .eq('id', documentId)
          .single();

        if (docError || !docData) {
          throw new Error('Document not found');
        }

        const { data: fileData, error: storageError } = await supabase.storage
          .from('financial-pdfs')
          .download(docData.storage_path);

        if (storageError || !fileData) {
          throw new Error('Failed to load PDF file');
        }

        if (isCancelled) return;

        const arrayBuffer = await fileData.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        createdBlobUrl = URL.createObjectURL(blob);
        const urlWithPage = initialPage > 1 ? `${createdBlobUrl}#page=${initialPage}` : createdBlobUrl;
        setPdfUrl(urlWithPage);
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error('Error loading PDF:', err);
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    if (documentId) {
      loadPDF();
    }

    return () => {
      isCancelled = true;
      if (createdBlobUrl) {
        URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [documentId, initialPage]);


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
