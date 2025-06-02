import { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import Sidebar from "@/components/Sidebar";

// Define an interface for the document structure
interface DocumentData {
  id: string;
  filename: string;
  upload_timestamp: string;
  status: string;
  doc_type: string;
  doc_specific_type: string;
  doc_summary: string;
  full_markdown_content: string;
}

export default function Documents() {
  const [docs, setDocs] = useState<DocumentData[]>([]); // Use DocumentData type
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [docIdToDelete, setDocIdToDelete] = useState<string | null>(null);

  // const previewModalRef = useRef<HTMLDialogElement>(null); // No longer needed for preview
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const query = supabase
      .from("documents")
      .select(
        "id, filename, upload_timestamp, status, doc_type, doc_specific_type, doc_summary, full_markdown_content"
      )
      .order("upload_timestamp", { ascending: false });
    if (searchTerm) query.ilike("filename", `%${searchTerm}%`);
    query.then(({ data, error }) => {
      if (error) console.error(error);
      else setDocs(data as DocumentData[] || []); // Cast data to DocumentData[]
    });
  }, [searchTerm]);

  // Effect to control delete confirmation modal visibility
  useEffect(() => {
    if (isDeleteModalOpen) {
      deleteModalRef.current?.showModal();
    } else {
      deleteModalRef.current?.close();
    }
  }, [isDeleteModalOpen]);

  const handleDeleteInitiate = (docId: string) => {
    setDocIdToDelete(docId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docIdToDelete) return;

    setDeleteSuccessMessage("");
    setDeleteErrorMessage("");
    const { error } = await supabase.from("documents").delete().match({ id: docIdToDelete });
    if (error) {
      console.error("Error deleting document:", error);
      setDeleteErrorMessage(`Failed to delete document: ${error.message}`);
      setTimeout(() => setDeleteErrorMessage(""), 5000); // Clear message after 5 seconds
    } else {
      setDocs(docs.filter((doc) => doc.id !== docIdToDelete));
      setDeleteSuccessMessage("Document deleted successfully!");
      setTimeout(() => setDeleteSuccessMessage(""), 3000); // Clear message after 3 seconds
    }
    setIsDeleteModalOpen(false);
    setDocIdToDelete(null);
  };

  const handleOpenPreview = (markdownContent: string) => {
    setPreviewContent(markdownContent);
    setShowPreview(true);
  };

  return (
    <div className="flex relative h-screen bg-base-200">
      <Sidebar />
      <div className="flex flex-col flex-1 p-4 overflow-auto">
        {deleteSuccessMessage && (
          <div className="alert alert-success shadow-lg mb-4">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{deleteSuccessMessage}</span>
            </div>
          </div>
        )}
        {deleteErrorMessage && (
          <div className="alert alert-error shadow-lg mb-4">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{deleteErrorMessage}</span>
            </div>
          </div>
        )}
        <input
          type="text"
          placeholder="Search by filename"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full max-w-xs mb-4"
        />
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="table table-zebra w-full">
            {/* head */}
            <thead className="bg-base-300">
              <tr>
                <th>No.</th>
                <th>File Name</th>
                <th>Upload Time</th>
                <th className="max-w-xs truncate">Doc Summary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, index) => (
                <tr key={doc.id} className="hover">
                  <td className="font-medium">{index + 1}</td>
                  <td>
                    <button
                      className="btn btn-link btn-xs p-0 text-info hover:text-info-content"
                      onClick={() => handleOpenPreview(doc.full_markdown_content)}
                    >
                      {doc.filename}
                    </button>
                  </td>
                  <td className="text-sm whitespace-nowrap">
                    {new Date(doc.upload_timestamp).toLocaleString()}
                  </td>
                  <td className="text-sm max-w-xs truncate" title={doc.doc_summary}>{doc.doc_summary}</td>
                  <td>
                    <span
                      className={`badge ${doc.status === 'completed' ? 'badge-success' : doc.status === 'processing' ? 'badge-warning' : 'badge-ghost' } badge-sm`}
                    >
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right-hand side preview panel - Restored */}
      {showPreview && (
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
          <div className="prose max-w-none overflow-y-auto p-4 flex-1" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewContent}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* DaisyUI Modal for Delete Confirmation */}
      <dialog ref={deleteModalRef} id="delete_confirm_modal" className="modal" onClose={() => setIsDeleteModalOpen(false)}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Deletion</h3>
          <p className="py-4">Are you sure you want to delete this document? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error" onClick={handleConfirmDelete}>Delete</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsDeleteModalOpen(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
}
