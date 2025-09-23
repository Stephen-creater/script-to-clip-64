export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          thumbnail: string | null
          duration: number
          segments_count: number
          status: 'draft' | 'completed' | 'processing'
          is_template: boolean
          created_at: string
          updated_at: string
          data: Json
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          thumbnail?: string | null
          duration?: number
          segments_count?: number
          status?: 'draft' | 'completed' | 'processing'
          is_template?: boolean
          created_at?: string
          updated_at?: string
          data?: Json
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          thumbnail?: string | null
          duration?: number
          segments_count?: number
          status?: 'draft' | 'completed' | 'processing'
          is_template?: boolean
          created_at?: string
          updated_at?: string
          data?: Json
        }
        Relationships: []
      }
      materials: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'image' | 'audio' | 'video'
          category: string
          subcategory: string | null
          file_path: string
          file_size: number
          file_type: string
          thumbnail: string | null
          duration: number | null
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'image' | 'audio' | 'video'
          category: string
          subcategory?: string | null
          file_path: string
          file_size: number
          file_type: string
          thumbnail?: string | null
          duration?: number | null
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'image' | 'audio' | 'video'
          category?: string
          subcategory?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          thumbnail?: string | null
          duration?: number | null
          created_at?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          id: string
          user_id: string
          project_id: string
          name: string
          file_path: string
          file_size: number
          duration: number
          thumbnail: string | null
          folder_id: string | null
          export_settings: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          name: string
          file_path: string
          file_size: number
          duration: number
          thumbnail?: string | null
          folder_id?: string | null
          export_settings?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          name?: string
          file_path?: string
          file_size?: number
          duration?: number
          thumbnail?: string | null
          folder_id?: string | null
          export_settings?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'video' | 'material'
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'video' | 'material'
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'video' | 'material'
          parent_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}