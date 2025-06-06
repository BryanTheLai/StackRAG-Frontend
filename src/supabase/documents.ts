import { ENDPOINTS } from "@/config/api";
import { supabase } from "./client";

// Updated DocumentData interface to match the database schema
export interface DocumentData {
  id: string;
  filename: string;
  upload_timestamp: string;
  status: string;
  doc_type: string;
  doc_specific_type: string;
  doc_summary: string;
  full_markdown_content: string;
}

// Legacy interface for backward compatibility
export interface Doc {
  id: string;
  filename: string;
  user_id: string;
}

// Fetch documents from Supabase with optional filters
export async function fetchDocuments(
  searchTerm?: string,
  docId?: string | null
): Promise<DocumentData[]> {
  const query = supabase
    .from("documents")
    .select(
      "id, filename, upload_timestamp, status, doc_type, doc_specific_type, doc_summary, full_markdown_content"
    )
    .order("upload_timestamp", { ascending: false });

  // Filter by specific document ID or search term
  if (docId) {
    query.eq("id", docId);
  } else if (searchTerm) {
    query.ilike("filename", `%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching documents: ${error.message}`);
  }

  return (data as DocumentData[]) || [];
}

// Delete a document by ID
export async function deleteDocument(docId: string): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .delete()
    .match({ id: docId });

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

// Utility function for status badge classes
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "completed":
      return "badge-success";
    case "processing":
      return "badge-warning";
    default:
      return "badge-ghost";
  }
}

// Legacy API fetch function
export async function fetchDocumentsAPI(accessToken: string): Promise<Doc[]> {
  const res = await fetch(ENDPOINTS.DOCUMENTS, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log(res);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Process a PDF file by sending it as pdf_file_buffer with access token
export async function processDocument(
  file: File,
  accessToken: string
): Promise<any> {
  const formData = new FormData();
  // Use 'file' as the field name to match FastAPI's UploadFile parameter
  formData.append("file", file);

  const res = await fetch(`${ENDPOINTS.DOCUMENTS}/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
