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
  // 1. Fetch the document details (specifically storage_path) first
  // We need this to know which file to delete from storage later.
  const { data: docToDelete, error: fetchError } = await supabase
    .from("documents")
    .select("storage_path") // Only select the storage_path
    .eq("id", docId)
    .single(); // Expect one document or null if not found
  if (fetchError) {
    // Handle "not found" case gracefully - document may already be deleted
    if (fetchError.code === 'PGRST116') {
      console.log(`Document with ID ${docId} not found in database. Assumed already deleted.`);
      return; // Exit early - nothing to delete
    }
    // For other errors, throw
    throw new Error(
      `Error fetching document details for deletion (ID: ${docId}): ${fetchError.message}`
    );
  }

  // 2. Delete the document record from the database
  const { error: dbDeleteError } = await supabase
    .from("documents")
    .delete()
    .match({ id: docId });

  if (dbDeleteError) {
    throw new Error(
      `Failed to delete document record from database (ID: ${docId}): ${dbDeleteError.message}`
    );
  }
  // 3. If database deletion was successful, and we have a storage path, delete from storage
  if (docToDelete?.storage_path) {
    // Document existed and its record was deleted from the database.
    // Now, attempt to delete the associated file from storage.
    const { error: storageError } = await supabase.storage
      .from("financial-pdfs") // As specified, the bucket name is 'financial-pdfs'
      .remove([docToDelete.storage_path]);

    if (storageError) {
      // Critical error: DB record is gone, but file deletion failed.
      throw new Error(
        `Document record (ID: ${docId}) deleted, but failed to remove file '${docToDelete.storage_path}' from storage: ${storageError.message}`
      );
    }
    // Successfully deleted from both database and storage
    console.log(
      `Successfully deleted document (ID: ${docId}) and associated file '${docToDelete.storage_path}' from storage.`
    );
  } else {
    // Document record was deleted, but it had no storage_path.
    console.warn(
      `Document record (ID: ${docId}) deleted, but no storage_path was found. No file removed from storage.`
    );
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

/**
 * Verify which of the given filenames already exist on the server for this user.
 * Throws on query error; returns array of existing filenames.
 */
export async function verifyFileNames(
  userId: string,
  filenames: string[]
): Promise<string[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("filename")
    .eq("user_id", userId)
    .in("filename", filenames);
  if (error) throw error;
  return (data || []).map((row) => row.filename);
}
