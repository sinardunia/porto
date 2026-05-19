export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  created_at: string;
  updated_at: string | null;
  is_published: boolean;
};

export type BlogPostSummary = Omit<BlogPost, "content">;
