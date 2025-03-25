import supabase from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to Supabase Storage
 * @param file File to upload
 * @param bucket Bucket name (e.g., 'resumes', 'profile-pictures')
 * @param path Optional path within the bucket
 * @returns URL of the uploaded file or null if upload failed
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string = ''
): Promise<string | null> {
  try {
    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param fileUrl Full URL of the file to delete
 * @param bucket Bucket name (e.g., 'resumes', 'profile-pictures')
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteFile(
  fileUrl: string,
  bucket: string
): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(fileUrl);
    const pathSegments = urlObj.pathname.split('/');
    const filePath = pathSegments.slice(pathSegments.indexOf(bucket) + 1).join('/');

    // Delete the file
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
}

/**
 * Create a signed URL for temporary access to a file
 * @param filePath Path to the file within the bucket
 * @param bucket Bucket name
 * @param expiresIn Expiration time in seconds (default: 60 minutes)
 * @returns Signed URL or null if creation failed
 */
export async function createSignedUrl(
  filePath: string,
  bucket: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in createSignedUrl:', error);
    return null;
  }
}

/**
 * List all files in a bucket or folder
 * @param bucket Bucket name
 * @param path Optional path within the bucket
 * @returns Array of file objects or null if listing failed
 */
export async function listFiles(
  bucket: string,
  path: string = ''
): Promise<any[] | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      console.error('Error listing files:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in listFiles:', error);
    return null;
  }
}
