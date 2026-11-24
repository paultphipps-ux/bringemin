// Row types for the tables in supabase/migrations. Regenerate with
// `supabase gen types typescript` once the project is linked, if you prefer.

export type AppRole = "admin" | "editor";
export type LeadStatus = "new" | "contacted" | "consult_booked" | "retained" | "lost";
export type SkipStatus = "new" | "working" | "located" | "recovered" | "closed";
export type PostStatus = "draft" | "scheduled" | "published";
export type Audience = "bail" | "attorney" | "individual" | "business";

export interface Profile { id: string; full_name: string | null; email: string | null; role: AppRole | null; created_at: string }

export interface Lead {
  id: string; created_at: string; name: string; phone: string | null; email: string | null;
  contact_pref: "call" | "text" | "email" | null; case_type: string | null; message: string | null;
  source_page: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null;
  gclid: string | null; status: LeadStatus; notes: string | null;
}

export interface SkipSubmission {
  id: string; created_at: string; bond_company: string; agent_name: string; agent_phone: string;
  agent_email: string | null; defendant_name: string; defendant_dob: string | null; bond_amount: string | null;
  county: string | null; last_known_address: string | null; notes: string | null; status: SkipStatus;
  internal_notes: string | null;
}

export interface SiteSettings {
  id: 1; business_name: string; phone: string; email: string | null; license_number: string | null; insured: boolean;
  hours: string | null; service_area: string | null; address: string | null;
  facebook_url: string | null; instagram_url: string | null; linkedin_url: string | null; google_business_url: string | null;
  default_seo_title: string | null; default_seo_description: string | null; updated_at: string;
}

export interface PageSection {
  key: string; page: string; label: string; eyebrow: string | null; heading: string | null; body: string | null;
  image_url: string | null; cta_label: string | null; cta_href: string | null; sort: number; updated_at: string;
}

export interface Service {
  id: string; slug: string; name: string; summary: string | null; body: string | null; audience: Audience | null;
  image_url: string | null; seo_title: string | null; seo_description: string | null; sort: number;
  published: boolean; created_at: string; updated_at: string;
}

export interface TeamMember {
  id: string; name: string; title: string | null; bio: string | null; photo_url: string | null;
  license_number: string | null; sort: number; published: boolean; created_at: string;
}

export interface Testimonial {
  id: string; quote: string; author: string; context: string | null; audience: Audience | null;
  sort: number; published: boolean; created_at: string;
}

export interface Faq { id: string; question: string; answer: string; page: string; sort: number; published: boolean; created_at: string }

export interface Category { id: string; name: string; slug: string; description: string | null }

export interface Post {
  id: string; title: string; slug: string; excerpt: string | null; body: string; cover_image_url: string | null;
  category_id: string | null; author_id: string | null; status: PostStatus; published_at: string | null;
  seo_title: string | null; seo_description: string | null; og_image_url: string | null;
  created_at: string; updated_at: string;
}

export interface PostRevision { id: string; post_id: string; title: string; body: string; saved_by: string | null; created_at: string }

export interface Media { id: string; path: string; url: string; alt: string | null; width: number | null; height: number | null; created_at: string }
