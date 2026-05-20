export type MediaType = "image" | "video" | "gif";

export type ThoughtMedia = {
  id: string;
  media_type: MediaType;
  media_url: string;
  media_alt: string | null;
  position: number;
};

export type Thought = {
  id: string;
  content: string;
  created_at: string;

  thought_media: ThoughtMedia[];
};