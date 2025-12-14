import { ENDPOINTS } from "@/config/api";
import { supabase } from "./client";

// Updated DocumentData interface to match the database schema
export interface DocumentData {
  id: string;
  filename: string;
  upload_timestamp: string;
  status: string;
  doc_type: string;
  doc_specific_type: string | null;
  doc_summary: string | null;
  full_markdown_content: string | null;
  storage_path: string;
  // Additional metadata fields
  company_name: string | null;
  report_date: string | null;
  doc_year: number | null;
  doc_quarter: number | null;
  metadata: Record<string, any> | null;
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
      "id, filename, upload_timestamp, status, doc_type, doc_specific_type, doc_summary, full_markdown_content, storage_path, company_name, report_date, doc_year, doc_quarter, metadata"
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

// Update document metadata
export async function updateDocument(
  docId: string,
  updates: Partial<Pick<DocumentData, 'doc_specific_type' | 'company_name' | 'report_date' | 'doc_year' | 'doc_quarter' | 'metadata'>>
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", docId);

  if (error) {
    throw new Error(`Error updating document: ${error.message}`);
  }
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
    case "failed":
      return "badge-error";
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
// Returns job_id immediately for status tracking
export async function processDocument(
  file: File,
  accessToken: string
): Promise<{ success: boolean; job_id: string; filename: string; message: string }> {
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

// Processing job status interface
export interface ProcessingJobStatus {
  id: string;
  user_id: string;
  document_id?: string;
  filename: string;
  status: 'pending' | 'parsing' | 'extracting_metadata' | 'uploading' | 'sectioning' | 'chunking' | 'embedding' | 'saving' | 'completed' | 'failed';
  current_step: string;
  progress_percentage: number;
  error_message?: string;
  error_code?: string; // NEW: Technical error code for categorization (api_key_invalid, file_corrupted, etc)
  retry_count: number; // NEW: How many times user has retried
  result_data?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Poll processing status by job ID
export async function getProcessingStatus(
  jobId: string,
  accessToken: string
): Promise<ProcessingJobStatus> {
  const res = await fetch(`${ENDPOINTS.DOCUMENTS}/processing-status/${jobId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Get all active processing jobs for current user
export async function getActiveProcessingJobs(): Promise<ProcessingJobStatus[]> {
  const { data, error } = await supabase
    .from("processing_jobs")
    .select("*")
    .in("status", ["pending", "parsing", "extracting_metadata", "uploading", "sectioning", "chunking", "embedding", "saving"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active jobs:", error);
    return [];
  }

  return (data as ProcessingJobStatus[]) || [];
}

// Get recent failed processing jobs for current user
export async function getRecentFailedProcessingJobs(limit = 10): Promise<ProcessingJobStatus[]> {
  const { data, error } = await supabase
    .from("processing_jobs")
    .select("*")
    .eq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching failed jobs:", error);
    return [];
  }

  return (data as ProcessingJobStatus[]) || [];
}

export async function retryFailedProcessingJob(
  jobId: string,
  accessToken: string
): Promise<{ success: boolean; job_id?: string; message?: string }>{
  const res = await fetch(`${ENDPOINTS.DOCUMENTS}/retry/${jobId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Retry failed document by downloading from storage and re-uploading
export async function retryFailedDocument(
  doc: DocumentData,
  accessToken: string
): Promise<{ success: boolean; job_id?: string; message: string }> {
  try {
    // Step 1: Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('financial-pdfs')
      .download(doc.storage_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message || 'No file data'}`);
    }

    // Step 2: Convert Blob to File object with original filename
    const file = new File([fileData], doc.filename, { type: 'application/pdf' });

    // Step 3: Delete the failed document record (to avoid "already exists" error)
    await deleteDocument(doc.id);

    // Step 4: Re-upload to backend
    const uploadResult = await processDocument(file, accessToken);

    return {
      success: true,
      job_id: uploadResult.job_id,
      message: 'Document retry started successfully'
    };
  } catch (error) {
    console.error('Error retrying document:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retry document'
    };
  }
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
