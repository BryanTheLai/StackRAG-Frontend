import { useEffect, useState, useRef } from "react";
import { useSearch, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  type DocumentData,
  fetchDocuments,
  deleteDocument,
  getStatusBadgeClass,
} from "@/supabase/documents";
import Sidebar from "@/components/Sidebar";

export default function Documents() {
  // State management
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<string>("");

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
  }, [searchTerm, docIdFromUrl]);

  // Control delete confirmation modal visibility
  useEffect(() => {
    if (isDeleteModalOpen) {
      deleteModalRef.current?.showModal();
    } else {
      deleteModalRef.current?.close();
    }
  }, [isDeleteModalOpen]);

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

  const handleOpenPreview = (markdownContent: string) => {
    setPreviewContent(markdownContent);
    setShowPreview(true);
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
        <th className="text-base-content border-r border-base-300">
          File Name
        </th>
        <th className="text-base-content border-r border-base-300">
          Upload Time
        </th>
        <th className="text-base-content border-r border-base-300 max-w-xs truncate">
          Doc Summary
        </th>
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
    <tr key={doc.id} className="hover:bg-base-200 border-b border-base-300">
      <td className="font-medium border-r border-base-300">{index + 1}</td>
      <td className="border-r border-base-300">
        <button
          className="btn btn-link btn-xs p-0 text-info hover:text-info-content"
          onClick={() => handleOpenPreview(doc.full_markdown_content)}
        >
          {doc.filename}
        </button>
      </td>
      <td className="text-sm whitespace-nowrap border-r border-base-300">
        {new Date(doc.upload_timestamp).toLocaleString()}
      </td>
      <td
        className="text-sm max-w-xs truncate border-r border-base-300"
        title={doc.doc_summary}
      >
        {doc.doc_summary}
      </td>
      <td className="border-r border-base-300">
        <span className={`badge ${getStatusBadgeClass(doc.status)} badge-sm`}>
          {doc.status}
        </span>
      </td>
      <td>
        <button
          onClick={() => handleDeleteInitiate(doc.id)}
          className="btn btn-error btn-sm btn-outline"
        >
          Delete
        </button>
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
      <Sidebar />
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
      {renderDeleteModal()}
    </div>
  );
}
