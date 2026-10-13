/**
 * Supabase Storage Client Helper (Phase 2 - Step 21e)
 * Manages uploading, URL resolution, and deletion of PDF files in Supabase Storage.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

export const BUCKET_NAME = 'resources';

export const storageClient = {
  /**
   * Upload a PDF file to Supabase Storage
   * @param {string} storagePath Target path inside the bucket (e.g. 'classes/cs301/notes.pdf')
   * @param {File | Blob} file File to upload
   * @returns {Promise<{ path: string, url: string }>}
   */
  async uploadPdf(storagePath, file) {
    if (!isSupabaseConfigured) {
      return {
        path: storagePath,
        url: null,
      };
    }

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (error) {
        throw new Error(error.message || 'Failed to upload PDF file to storage.');
      }

      // Generate public URL for the uploaded asset
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: urlData?.publicUrl || null,
      };
    } catch (err) {
      console.warn('[storageClient] Storage upload error:', err.message);
      return {
        path: storagePath,
        url: null,
      };
    }
  },

  /**
   * Remove a file from Supabase Storage
   * @param {string} storagePath Path inside the bucket to remove
   * @returns {Promise<{ success: boolean }>}
   */
  async removeFile(storagePath) {
    if (!isSupabaseConfigured || !storagePath) {
      return { success: true };
    }

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);

      if (error) {
        console.warn('[storageClient] Storage removal warning:', error.message);
      }
      return { success: true };
    } catch (err) {
      console.warn('[storageClient] Storage removeFile error:', err.message);
      return { success: false };
    }
  },

  /**
   * Retrieve the public URL for an uploaded file
   * @param {string} storagePath Path inside the bucket
   * @returns {string | null}
   */
  getPublicUrl(storagePath) {
    if (!isSupabaseConfigured || !storagePath) return null;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return data?.publicUrl || null;
  },
};

export default storageClient;
