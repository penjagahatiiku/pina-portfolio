// Database types for PINA Subholding Portfolio

export interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  profession: string | null;
  social_links: SocialLink[] | null;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  images_gallery: string[] | null;
  live_demo_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
  technologies?: Technology[];
}

export interface Technology {
  id: string;
  name: string;
  icon_url: string | null;
  category: string | null;
}

export interface ProjectTechnology {
  project_id: string;
  technology_id: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'New' | 'In Progress' | 'Completed' | 'Rejected';

// Form types
export interface OrderFormData {
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  thumbnail_url: string;
  images_gallery: string[];
  live_demo_url: string;
  github_url: string;
  is_featured: boolean;
  completion_date: string;
  technology_ids: string[];
}
