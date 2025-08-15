import { supabase } from './client';

export interface DocumentInfo {
  id: string;
  filename: string;
  storage_path: string;
  doc_type: string;
  company_name: string | null;
  report_date: Date | null;
}

/**
 * Get document information by ID for PDF navigation
 */
export async function getDocumentInfo(documentId: string): Promise<DocumentInfo | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id, filename, storage_path, doc_type, company_name, report_date')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error fetching document info:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching document info:', error);
    return null;
  }
}

/**
 * Verify if a document exists and is accessible by the current user
 */
export async function verifyDocumentAccess(documentId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error verifying document access:', error);
    return false;
  }
}
