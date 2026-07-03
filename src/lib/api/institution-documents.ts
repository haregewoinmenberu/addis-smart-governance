import { apiGet, apiPost, apiDelete } from "@/lib/api";

export interface InstitutionDocument {
  id: number;
  institution_id: number;
  uploaded_by: number;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  file_size_formatted: string;
  category: 'license' | 'certificate' | 'report' | 'contract' | 'policy' | 'compliance' | 'other';
  description: string | null;
  download_url: string;
  created_at: string;
  updated_at: string;
  uploader?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface DocumentStatistics {
  total_documents: number;
  total_size: number;
  total_size_formatted: string;
  by_category: Record<string, number>;
}

export interface GetDocumentsParams {
  category?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface UploadDocumentParams {
  file: File;
  category: string;
  description?: string;
}

/**
 * Get all documents for an institution
 */
export async function getInstitutionDocuments(
  institutionId: number,
  params?: GetDocumentsParams
) {
  return apiGet<{ success: boolean; data: { data: InstitutionDocument[] } }>(
    `/institutions/${institutionId}/documents`,
    params
  );
}

/**
 * Upload a document
 */
export async function uploadDocument(
  institutionId: number,
  params: UploadDocumentParams
) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('category', params.category);
  if (params.description) {
    formData.append('description', params.description);
  }

  return apiPost<{ success: boolean; data: InstitutionDocument; message: string }>(
    `/institutions/${institutionId}/documents`,
    formData
  );
}

/**
 * Get a single document
 */
export async function getDocument(institutionId: number, documentId: number) {
  return apiGet<{ success: boolean; data: InstitutionDocument }>(
    `/institutions/${institutionId}/documents/${documentId}`
  );
}

/**
 * Download a document
 */
export function getDocumentDownloadUrl(institutionId: number, documentId: number): string {
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/institutions/${institutionId}/documents/${documentId}/download`;
}

/**
 * Delete a document
 */
export async function deleteDocument(institutionId: number, documentId: number) {
  return apiPost<{ success: boolean; message: string }>(
    `/institutions/${institutionId}/documents/${documentId}/delete`,
    {}
  );
}

/**
 * Get document statistics
 */
export async function getDocumentStatistics(institutionId: number) {
  return apiGet<{ success: boolean; data: DocumentStatistics }>(
    `/institutions/${institutionId}/documents/statistics`
  );
}
