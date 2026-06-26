export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  pubDatetime: string;
  modDatetime: string | null;
  draft: boolean;
  featured: boolean;
  aiGenerated?: boolean;
};

export type BlogPostSummary = Omit<BlogPost, "content">;

export type TagCount = {
  name: string;
  slug: string;
  count: number;
};

export type PostsByYear = {
  year: number;
  posts: BlogPostSummary[];
};
