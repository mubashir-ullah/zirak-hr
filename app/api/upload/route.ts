import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { uploadFile } from '@/lib/supabaseStorage';

export async function POST(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const path = formData.get('path') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!bucket) {
      return NextResponse.json({ error: 'No bucket specified' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: PDF, JPEG, PNG' 
      }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size: 5MB' 
      }, { status: 400 });
    }

    // Upload the file to Supabase Storage
    const fileUrl = await uploadFile(file, bucket, path);

    if (!fileUrl) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
