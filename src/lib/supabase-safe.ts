import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Check if Supabase environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

console.log('Supabase configuration status:', {
  configured: isSupabaseConfigured,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
})

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'lovable-video-editor'
        }
      }
    })
  : null

// Storage buckets
export const STORAGE_BUCKETS = {
  MATERIALS: 'materials',
  PROJECTS: 'projects', 
  VIDEOS: 'videos',
  THUMBNAILS: 'thumbnails'
} as const

// Helper function to get public URL for files
export const getFileUrl = (bucket: string, path: string) => {
  if (!supabase) return '/placeholder.svg'
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Helper function to upload file
export const uploadFile = async (
  bucket: string, 
  path: string, 
  file: File,
  options?: { upsert?: boolean }
) => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please connect Supabase in Lovable.')
  }
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: options?.upsert || false
    })
  
  if (error) throw error
  return data
}

// Helper function to delete file
export const deleteFile = async (bucket: string, path: string) => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please connect Supabase in Lovable.')
  }
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
}