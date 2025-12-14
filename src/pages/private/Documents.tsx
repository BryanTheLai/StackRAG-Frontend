import { useEffect, useState, useRef } from "react";
import { useSearch, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
// Removed react-pdf imports and worker config
import {
  type DocumentData,
  fetchDocuments,
  deleteDocument,
  updateDocument,
  getStatusBadgeClass,
  getActiveProcessingJobs,
  getRecentFailedProcessingJobs,
  retryFailedProcessingJob,
  type ProcessingJobStatus,
} from "@/supabase/documents";
import Sidebar from "@/components/Sidebar";
import { Eye, Download, Trash2, X, Loader2 } from "lucide-react";
import EditableCell from "@/components/EditableCell";

export default function Documents() {
  // Auth context
  const { session } = useAuth();
  
  // State management
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewContent] = useState<string>("");

  // Delete functionality state
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [docIdToDelete, setDocIdToDelete] = useState<string | null>(null);

  // URL parameter handling
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const docIdFromUrl = urlParams.get("id");

  // Refs for modal control
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  // New state for refresh flag
  const [refreshFlag, setRefreshFlag] = useState<number>(0);
  
  // Processing jobs state
  const [activeJobs, setActiveJobs] = useState<ProcessingJobStatus[]>([]);
  const [failedJobs, setFailedJobs] = useState<ProcessingJobStatus[]>([]);
  const readDismissedFailedJobIds = (): Set<string> => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage?.getItem("dismissed_failed_processing_job_ids");
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      return new Set(parsed);
    } catch {
      return new Set();
    }
  };

  const [, setDismissedFailedJobIds] = useState<Set<string>>(() => readDismissedFailedJobIds());

  // PDF viewer state
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string>("");
  const [pdfFilename, setPdfFilename] = useState<string>("");

  // Document detail modal state
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const detailModalRef = useRef<HTMLDialogElement>(null);

  // Callback to refresh documents after import
  const handleFilesImported = (_files: File[]) => {
    setRefreshFlag((f) => f + 1);
  };

  // Fetch documents from Supabase
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const documents = await fetchDocuments(searchTerm, docIdFromUrl);
        setDocs(documents);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    loadDocuments();
  }, [searchTerm, docIdFromUrl, refreshFlag]);

  // Load and poll active processing jobs
  useEffect(() => {
    if (!session) return;

    const loadJobs = async () => {
      const dismissed = readDismissedFailedJobIds();
      const [jobs, failed] = await Promise.all([
        getActiveProcessingJobs(session.user.id),
        getRecentFailedProcessingJobs(session.user.id, 10),
      ]);
      setActiveJobs(jobs);
      setFailedJobs(failed.filter((j) => !dismissed.has(j.id)));
    };

    // Load immediately
    loadJobs();

    // Poll every 3 seconds for updates
    const interval = setInterval(() => {
      loadJobs();
      // Also refresh documents list to catch newly completed ones
      setRefreshFlag((f) => f + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [session]);

  const persistDismissedFailedJobs = (ids: Set<string>) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage?.setItem(
        "dismissed_failed_processing_job_ids",
        JSON.stringify(Array.from(ids))
      );
    } catch {
      // ignore
    }
  };

  const dismissFailedJob = (jobId: string) => {
    setDismissedFailedJobIds((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      persistDismissedFailedJobs(next);
      return next;
    });
    setFailedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const dismissAllFailedJobs = () => {
    setDismissedFailedJobIds((prev) => {
      const next = new Set(prev);
      for (const j of failedJobs) next.add(j.id);
      persistDismissedFailedJobs(next);
      return next;
    });
    setFailedJobs([]);
  };

  const handleRetryFailedJob = async (jobId: string) => {
    if (!session) return;
    clearMessages();
    setDeleteSuccessMessage("Retrying failed job...");
    try {
      const result = await retryFailedProcessingJob(jobId, session.access_token);
      setDeleteSuccessMessage(result.message || "Retry started");
      dismissFailedJob(jobId);
      setRefreshFlag((f) => f + 1);
      setTimeout(() => setDeleteSuccessMessage(""), 3000);
    } catch (error) {
      setDeleteErrorMessage(error instanceof Error ? error.message : "Failed to retry job");
      setTimeout(() => setDeleteErrorMessage(""), 5000);
    }
  };

  // Control delete confirmation modal visibility
  useEffect(() => {
    if (isDeleteModalOpen) {
      deleteModalRef.current?.showModal();
    } else {
      deleteModalRef.current?.close();
    }
  }, [isDeleteModalOpen]);

  // Control detail modal visibility
  useEffect(() => {
    if (showDetailModal) {
      detailModalRef.current?.showModal();
    } else {
      detailModalRef.current?.close();
    }
  }, [showDetailModal]);

  // Utility functions
  const clearMessages = () => {
    setDeleteSuccessMessage("");
    setDeleteErrorMessage("");
  };

  // Event handlers
  const handleDeleteInitiate = (docId: string) => {
    setDocIdToDelete(docId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docIdToDelete) return;

    clearMessages();

    try {
      await deleteDocument(docIdToDelete);
      setDocs(docs.filter((doc) => doc.id !== docIdToDelete));
      setDeleteSuccessMessage("Document deleted successfully!");
      setTimeout(() => setDeleteSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting document:", error);
      setDeleteErrorMessage(
        error instanceof Error ? error.message : "Failed to delete document"
      );
      setTimeout(() => setDeleteErrorMessage(""), 5000);
    }

    setIsDeleteModalOpen(false);
    setDocIdToDelete(null);
  };

  // Handle row click to show details
  const handleRowClick = (doc: DocumentData) => {
    setSelectedDoc(doc);
    setShowDetailModal(true);
  };

  // Handle retry for failed document - AUTOMATIC!
  const handleRetryDocument = async (doc: DocumentData) => {
    if (!session) return;

    // Close detail modal
    setShowDetailModal(false);
    
    // Show loading state
    clearMessages();
    setDeleteSuccessMessage("Retrying upload...");

    try {
      // Import the retry function dynamically
      const { retryFailedDocument } = await import('@/supabase/documents');
      
      // Automatically download from storage and re-upload
      const result = await retryFailedDocument(doc, session.access_token);

      if (result.success) {
        setDeleteSuccessMessage(`Retry started successfully! Processing ${doc.filename}...`);
        // Refresh documents list
        setRefreshFlag((f) => f + 1);
        setTimeout(() => setDeleteSuccessMessage(""), 3000);
      } else {
        setDeleteErrorMessage(result.message);
        setTimeout(() => setDeleteErrorMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error retrying document:", error);
      setDeleteErrorMessage(
        error instanceof Error ? error.message : "Failed to retry document"
      );
      setTimeout(() => setDeleteErrorMessage(""), 5000);
    }
  };


  // Handler to view PDF
  const handleViewPdf = async (storagePath: string, filename: string) => {
    setPdfLoading(true);
    setPdfError("");
    setPdfFilename(filename);
    try {
      // Download PDF blob and create object URL with correct MIME
      const { data: fileData, error } = await supabase.storage
        .from('financial-pdfs')
        .download(storagePath);
      if (error || !fileData) throw error || new Error('No file returned');
      // Convert blob to base64 data URI
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      const url = `data:application/pdf;base64,${base64}`;
      setPdfUrl(url);
      setShowPdfViewer(true);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setPdfError(err.message || 'Failed to load PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // Download PDF handler
  const handleDownloadPdf = async (storagePath: string, filename: string) => {
    try {
      const { data: fileData, error } = await supabase.storage
        .from('financial-pdfs')
        .download(storagePath);
      if (error || !fileData) throw error || new Error('No file returned');
      const blob = new Blob([await fileData.arrayBuffer()], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      setPdfError('Failed to download PDF');
    }
  };

  // Close PDF viewer and revoke object URL
  const closePdfViewer = () => {
    setShowPdfViewer(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl("");
    }
    setPdfFilename("");
  };

  // Render helper components
  const renderAlerts = () => (
    <>
      {deleteSuccessMessage && (
        <div className="alert alert-success shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{deleteSuccessMessage}</span>
          </div>
        </div>
      )}
      {deleteErrorMessage && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{deleteErrorMessage}</span>
          </div>
        </div>
      )}
      {failedJobs.length > 0 && (
        <div className="alert alert-warning shadow-lg mb-4">
          <div className="w-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">
                  {failedJobs.length} document{failedJobs.length > 1 ? 's' : ''} failed to process
                </div>
                <div className="text-sm opacity-80">
                  Retry here or dismiss to clear the banner.
                </div>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={dismissAllFailedJobs}>
                Dismiss all
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {failedJobs.map((job) => (
                <div key={job.id} className="bg-base-100 px-3 py-2 rounded-md">
                  <div className="text-sm font-medium truncate" title={job.filename}>
                    {job.filename}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {job.error_message || 'Processing failed'}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => handleRetryFailedJob(job.id)}
                    >
                      Retry
                    </button>
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => dismissFailedJob(job.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeJobs.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">
              Processing {activeJobs.length} document{activeJobs.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {activeJobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3 bg-base-100 px-3 py-2 rounded-md">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" title={job.filename}>
                    {job.filename}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <progress 
                      className="progress progress-primary flex-1 h-1.5" 
                      value={job.progress_percentage} 
                      max="100"
                    />
                    <span className="text-xs font-semibold text-primary whitespace-nowrap">
                      {job.progress_percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {docIdFromUrl && (
        <div className="alert alert-info shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Showing document with ID: {docIdFromUrl}</span>
            <Link
              href="/private/documents"
              className="btn btn-sm btn-outline ml-4"
            >
              Show All Documents
            </Link>
          </div>
        </div>
      )}
    </>
  );

  const renderSearchInput = () => (
    <input
      type="text"
      placeholder="Search by filename"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="input input-bordered w-full max-w-xs mb-4"
      disabled={!!docIdFromUrl}
    />
  );

  const renderTableHeader = () => (
    <thead className="bg-base-300">
      <tr>
        <th className="text-base-content border-r border-base-300">No.</th>
        <th className="text-base-content border-r border-base-300">File Name</th>
        <th className="text-base-content border-r border-base-300">Upload Time</th>
        <th className="text-base-content border-r border-base-300">Type</th>
        <th className="text-base-content border-r border-base-300 max-w-xs truncate">Doc Summary</th>
        <th className="text-base-content border-r border-base-300">Status</th>
        <th className="text-base-content">Actions</th>
      </tr>
    </thead>
  );

  const renderEmptyState = () => {
    if (docs.length === 0 && docIdFromUrl) {
      return (
        <tr>
          <td colSpan={6} className="text-center py-8">
            <div className="text-warning">
              No document found with ID: {docIdFromUrl}
            </div>
            <Link
              href="/private/documents"
              className="btn btn-sm btn-primary mt-2"
            >
              View All Documents
            </Link>
          </td>
        </tr>
      );
    }

    if (docs.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center py-8 text-base-content">
            No documents found
          </td>
        </tr>
      );
    }

    return null;
  };

  const renderDocumentRow = (doc: DocumentData, index: number) => (
    <tr 
      key={doc.id} 
      className="hover:bg-base-200 border-b border-base-300 cursor-pointer"
      onClick={() => handleRowClick(doc)}
    >
      <td className="font-medium border-r border-base-300">{index + 1}</td>
      <td className="border-r border-base-300">{doc.filename}</td>
      <td className="text-sm whitespace-nowrap border-r border-base-300">{new Date(doc.upload_timestamp).toLocaleString()}</td>
      <td className="text-sm border-r border-base-300">{doc.doc_specific_type}</td>
      <td className="text-sm max-w-xs truncate border-r border-base-300">
        {doc.doc_summary || 'No summary available'}
      </td>
      <td className="border-r border-base-300">
        <span className={`badge ${getStatusBadgeClass(doc.status)} badge-sm`}>
          {doc.status}
        </span>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          <button
            onClick={() => handleViewPdf(doc.storage_path, doc.filename)}
            className="btn btn-primary btn-sm btn-outline"
            aria-label="View PDF"
            title="View PDF"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDownloadPdf(doc.storage_path, doc.filename)}
            className="btn btn-secondary btn-sm btn-outline"
            aria-label="Download"
            title="Download"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => handleDeleteInitiate(doc.id)}
            className="btn btn-error btn-sm btn-outline"
            aria-label="Delete"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderPreviewPanel = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed top-0 right-0 h-full w-1/2 max-w-3xl bg-base-100 border-l shadow-lg z-50 flex flex-col">
        <div className="relative flex-shrink-0 p-2">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setShowPreview(false)}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg p-2">Document Preview</h3>
        </div>
        <div
          className="prose max-w-none overflow-y-auto p-4 flex-1"
          style={{ maxHeight: "calc(100vh - 5rem)" }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {previewContent}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => (
    <dialog
      ref={deleteModalRef}
      id="delete_confirm_modal"
      className="modal"
      onClose={() => setIsDeleteModalOpen(false)}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm Deletion</h3>
        <p className="py-4">
          Are you sure you want to delete this document? This action cannot be
          undone.
        </p>
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </button>
          <button className="btn btn-error" onClick={handleConfirmDelete}>
            Delete
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setIsDeleteModalOpen(false)}>close</button>
      </form>{" "}
    </dialog>
  );

  // Main component render
  return (
    <div className="flex relative h-screen bg-base-200">
      <Sidebar onFilesImported={handleFilesImported} />
      <div className="flex flex-col flex-1 p-4 overflow-auto">
        {renderAlerts()}
        {renderSearchInput()}

        <div className="overflow-x-auto shadow-md rounded-box">
          <table className="table table-zebra w-full border border-base-300">
            {renderTableHeader()}
            <tbody>
              {renderEmptyState() ||
                docs.map((doc, index) => renderDocumentRow(doc, index))}
            </tbody>
          </table>
        </div>
      </div>

      {renderPreviewPanel()}
      {showPdfViewer && (
        <div className="fixed top-0 right-0 h-full w-1/2 max-w-3xl bg-base-100 border-l shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <span className="font-mono text-base font-semibold truncate" title={pdfFilename}>{pdfFilename}</span>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => handleDownloadPdf(docs.find(d => d.filename === pdfFilename)?.storage_path || '', pdfFilename)}
                disabled={pdfLoading || !pdfFilename}
                aria-label="Download"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                className="btn btn-sm btn-circle"
                onClick={closePdfViewer}
                aria-label="Close"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-2">
            {pdfLoading && (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}
            {pdfError && (
              <div className="alert alert-error shadow-lg">
                <div><span>{pdfError}</span></div>
              </div>
            )}
            {pdfUrl && !pdfLoading && !pdfError && (
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                className="flex-1"
              />
            )}
          </div>
        </div>
      )}
      {renderDeleteModal()}
      
      {/* Document Detail Modal */}
      <dialog
        ref={detailModalRef}
        className="modal"
        onClose={() => setShowDetailModal(false)}
      >
        <div className="modal-box max-w-2xl">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setShowDetailModal(false)}
          >
            ✕
          </button>
          
          {selectedDoc && (
            <div>
              <h3 className="font-bold text-lg mb-4">Document Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-base-content/70">File Name</label>
                  <p className="text-base">{selectedDoc.filename}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-base-content/70">Upload Time</label>
                  <p className="text-base">{new Date(selectedDoc.upload_timestamp).toLocaleString()}</p>
                </div>
                
                <div className="divider my-2">Editable Metadata</div>
                
                <div>
                  <label className="text-sm font-semibold text-base-content/70 mb-1 block">Document Type</label>
                  <EditableCell
                    value={selectedDoc.doc_specific_type}
                    type="select"
                    options={[
                      { value: 'Income Statement', label: 'Income Statement' },
                      { value: 'Balance Sheet', label: 'Balance Sheet' },
                      { value: 'Cash Flow Statement', label: 'Cash Flow Statement' },
                      { value: 'Financial Report', label: 'Financial Report' },
                      { value: 'Invoice', label: 'Invoice' },
                      { value: 'Receipt', label: 'Receipt' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    onSave={async (newValue) => {
                      await updateDocument(selectedDoc.id, { doc_specific_type: newValue as string });
                      setSelectedDoc({ ...selectedDoc, doc_specific_type: newValue as string });
                      setRefreshFlag(f => f + 1);
                    }}
                    emptyText="Not set"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-base-content/70 mb-1 block">Company Name</label>
                  <EditableCell
                    value={selectedDoc.company_name}
                    type="text"
                    placeholder="Enter company name"
                    onSave={async (newValue) => {
                      await updateDocument(selectedDoc.id, { company_name: newValue as string });
                      setSelectedDoc({ ...selectedDoc, company_name: newValue as string });
                      setRefreshFlag(f => f + 1);
                    }}
                    emptyText="Not set"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-base-content/70 mb-1 block">Report Date</label>
                  <EditableCell
                    value={selectedDoc.report_date}
                    type="date"
                    onSave={async (newValue) => {
                      await updateDocument(selectedDoc.id, { report_date: newValue as string });
                      setSelectedDoc({ ...selectedDoc, report_date: newValue as string });
                      setRefreshFlag(f => f + 1);
                    }}
                    emptyText="Not set"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-base-content/70 mb-1 block">Year</label>
                    <EditableCell
                      value={selectedDoc.doc_year}
                      type="number"
                      placeholder="YYYY"
                      validate={(val) => !val || (Number(val) >= 1900 && Number(val) <= 2100)}
                      onSave={async (newValue) => {
                        await updateDocument(selectedDoc.id, { doc_year: newValue as number });
                        setSelectedDoc({ ...selectedDoc, doc_year: newValue as number });
                        setRefreshFlag(f => f + 1);
                      }}
                      emptyText="Not set"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-base-content/70 mb-1 block">Quarter</label>
                    <EditableCell
                      value={selectedDoc.doc_quarter}
                      type="select"
                      options={[
                        { value: 1, label: 'Q1' },
                        { value: 2, label: 'Q2' },
                        { value: 3, label: 'Q3' },
                        { value: 4, label: 'Q4' },
                      ]}
                      onSave={async (newValue) => {
                        await updateDocument(selectedDoc.id, { doc_quarter: newValue as number });
                        setSelectedDoc({ ...selectedDoc, doc_quarter: newValue as number });
                        setRefreshFlag(f => f + 1);
                      }}
                      emptyText="Not set"
                    />
                  </div>
                </div>
                
                <div className="divider my-2">System Information</div>
                
                <div>
                  <label className="text-sm font-semibold text-base-content/70">Status</label>
                  <div className="mt-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getStatusBadgeClass(selectedDoc.status)} badge-md font-semibold`}>
                        {selectedDoc.status}
                      </span>
                      {selectedDoc.status === 'failed' && (
                        <span className="text-sm text-error">
                          ⚠️ Processing failed
                        </span>
                      )}
                    </div>
                    
                    {/* Context-specific help based on error type (when backend provides error_code) */}
                    {selectedDoc.status === 'failed' && (
                      <div className="alert alert-warning text-xs py-2">
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold">💡 What to do:</p>
                          <p>Click "Retry Upload" below. The file will be automatically re-uploaded without manual selection.</p>
                          <p className="text-base-content/60 italic">If the issue persists after 2-3 retries, the file may be corrupted or the AI service may be temporarily unavailable.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-base-content/70">Document Summary</label>
                  <p className="text-base whitespace-pre-wrap mt-1 p-3 bg-base-200 rounded-lg">
                    {selectedDoc.doc_summary || 'No summary available'}
                  </p>
                </div>
              </div>
              
              <div className="modal-action">
                {selectedDoc.status === 'failed' ? (
                  // Failed document - show prominent retry button
                  <div className="flex flex-col gap-2 w-full">
                    <button 
                      className="btn btn-warning btn-lg w-full"
                      onClick={() => handleRetryDocument(selectedDoc)}
                    >
                      🔄 Retry Upload (Automatic)
                    </button>
                    <div className="text-xs text-center text-base-content/70">
                      File will be automatically downloaded and re-uploaded
                    </div>
                    <div className="divider">OR</div>
                    <button
                      className="btn btn-error btn-outline w-full"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleDeleteInitiate(selectedDoc.id);
                      }}
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete Document
                    </button>
                  </div>
                ) : (
                  // Successful document - show normal actions
                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleViewPdf(selectedDoc.storage_path, selectedDoc.filename);
                      }}
                    >
                      <Eye size={18} className="mr-2" />
                      View PDF
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleDownloadPdf(selectedDoc.storage_path, selectedDoc.filename);
                      }}
                    >
                      <Download size={18} className="mr-2" />
                      Download
                    </button>
                    <button
                      className="btn btn-error btn-outline"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleDeleteInitiate(selectedDoc.id);
                      }}
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowDetailModal(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
}
