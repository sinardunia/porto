import type { BlogPostSummary } from "@/types/blog";

// Simple search index for O(1) lookups
export class SearchIndex {
  private index: Map<string, Set<string>>;
  private posts: Map<string, BlogPostSummary>;

  constructor(posts: BlogPostSummary[]) {
    this.index = new Map();
    this.posts = new Map();
    this.buildIndex(posts);
  }

  private buildIndex(posts: BlogPostSummary[]) {
    for (const post of posts) {
      this.posts.set(post.slug, post);
      
      // Index title words
      const words = post.title.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 2) {
          if (!this.index.has(word)) {
            this.index.set(word, new Set());
          }
          this.index.get(word)!.add(post.slug);
        }
      }

      // Index tags
      for (const tag of post.tags) {
        const normalized = tag.toLowerCase();
        if (!this.index.has(normalized)) {
          this.index.set(normalized, new Set());
        }
        this.index.get(normalized)!.add(post.slug);
      }

      // Index description words
      if (post.description) {
        const descWords = post.description.toLowerCase().split(/\s+/);
        for (const word of descWords) {
          if (word.length > 2) {
            if (!this.index.has(word)) {
              this.index.set(word, new Set());
            }
            this.index.get(word)!.add(post.slug);
          }
        }
      }
    }
  }

  search(query: string): BlogPostSummary[] {
    if (!query || query.trim().length === 0) {
      return Array.from(this.posts.values());
    }

    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) {
      return Array.from(this.posts.values());
    }

    const matchedSlugs = new Set<string>();
    
    for (const word of words) {
      const slugs = this.index.get(word);
      if (slugs) {
        for (const slug of slugs) {
          matchedSlugs.add(slug);
        }
      }
    }

    return Array.from(matchedSlugs)
      .map(slug => this.posts.get(slug))
      .filter((post): post is BlogPostSummary => post !== undefined);
  }
}

// Debounce utility for search input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
