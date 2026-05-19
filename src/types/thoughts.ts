export type Thought = {
  id: string;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  thought_images?: ThoughtImage[];
  created_at: string;
};

export type ThoughtImage = {
  id: string;
  image_url: string;
  image_alt: string | null;
  position: number;
};
