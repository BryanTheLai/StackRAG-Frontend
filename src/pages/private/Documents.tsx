import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import Sidebar from "@/components/Sidebar";

export default function Documents() {
  const [docs, setDocs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<string>("");

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
      else setDocs(data || []);
    });
  }, [searchTerm]);

  return (
    <div className="flex relative h-screen bg-base-200">
      <Sidebar />
      <div className="flex flex-col flex-1 p-4 overflow-auto">
        <input
          type="text"
          placeholder="Search by filename"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full max-w-xs mb-4"
        />
        <table className="table w-full">
          <thead>
            <tr>
              <th>No.</th>
              <th>File Name</th>
              <th>Upload Time</th>
              <th>Status</th>
              <th>Doc Type</th>
              <th>Doc Specific Type</th>
              <th>Doc Summary</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, index) => (
              <tr key={doc.id}>
                <td>{index + 1}</td>
                <td>
                  <button
                    onClick={() => {
                      setPreviewContent(doc.full_markdown_content);
                      setShowPreview(true);
                    }}
                  >
                    {doc.filename}
                  </button>
                </td>
                <td>{new Date(doc.upload_timestamp).toLocaleString()}</td>
                <td>{doc.status}</td>
                <td>{doc.doc_type}</td>
                <td>{doc.doc_specific_type}</td>
                <td>{doc.doc_summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPreview && (
        <div className="fixed top-0 right-0 h-full w-1/2 max-w-3xl bg-base-100 border-l shadow-lg z-50 flex flex-col">
          <div className="relative flex-shrink-0 p-2">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowPreview(false)}
            >
              ✕
            </button>
          </div>
          <div className="prose overflow-y-auto p-4 flex-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewContent}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
