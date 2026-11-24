import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Category, Faq, PageSection, Post, Service, SiteSettings, TeamMember, Testimonial,
} from "@/integrations/supabase/types";

const FALLBACK_SETTINGS: SiteSettings = {
  id: 1, business_name: "Bring 'Em In Investigations", phone: "(817) 933-7144", email: null,
  license_number: "C28384101", hours: "Available 24/7", service_area: "Dallas, Fort Worth and North Texas", address: null,
  facebook_url: null, instagram_url: null, linkedin_url: null, google_business_url: null,
  default_seo_title: null, default_seo_description: null, updated_at: "",
};

export function useSiteSettings() {
  const q = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return (data as SiteSettings | null) ?? FALLBACK_SETTINGS;
    },
    staleTime: 5 * 60_000,
  });
  return q.data ?? FALLBACK_SETTINGS;
}

export function useSections(page: string) {
  const q = useQuery({
    queryKey: ["page_sections", page],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_sections").select("*").eq("page", page).order("sort");
      if (error) throw error;
      return data as PageSection[];
    },
  });
  const byKey = Object.fromEntries((q.data ?? []).map((s) => [s.key, s])) as Record<string, PageSection | undefined>;
  return { sections: byKey, isLoading: q.isLoading };
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("published", true).order("sort");
      if (error) throw error;
      return data as Service[];
    },
  });
}

export function useService(slug: string | undefined) {
  return useQuery({
    queryKey: ["service", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("slug", slug!).eq("published", true).maybeSingle();
      if (error) throw error;
      return data as Service | null;
    },
  });
}

export function useFaqs(page: string) {
  return useQuery({
    queryKey: ["faqs", page],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").eq("page", page).eq("published", true).order("sort");
      if (error) throw error;
      return data as Faq[];
    },
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").eq("published", true).order("sort");
      if (error) throw error;
      return data as Testimonial[];
    },
  });
}

export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("*").eq("published", true).order("sort");
      if (error) throw error;
      return data as TeamMember[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data as Category[];
    },
  });
}

const PAGE_SIZE = 9;

/** Live posts only: RLS hides drafts and future-scheduled posts from the public. */
export function usePosts(opts: { categoryId?: string; page?: number } = {}) {
  const page = opts.page ?? 0;
  return useQuery({
    queryKey: ["posts", opts.categoryId ?? "all", page],
    queryFn: async () => {
      let q = supabase
        .from("posts")
        .select("id,title,slug,excerpt,cover_image_url,category_id,published_at", { count: "exact" })
        .in("status", ["published", "scheduled"])
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (opts.categoryId) q = q.eq("category_id", opts.categoryId);
      const { data, error, count } = await q;
      if (error) throw error;
      return { posts: data as Pick<Post, "id" | "title" | "slug" | "excerpt" | "cover_image_url" | "category_id" | "published_at">[], total: count ?? 0, pageSize: PAGE_SIZE };
    },
  });
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: ["post", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug!)
        .in("status", ["published", "scheduled"])
        .lte("published_at", new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      return data as Post | null;
    },
  });
}
