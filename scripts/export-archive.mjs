import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const outputRoot = process.env.ARCHIVE_EXPORT_DIR || "archive-export";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const timestamp = new Date().toISOString();
const outputDir = path.join(outputRoot, timestamp.replace(/[:.]/g, "-"));

const safeFileName = (value) =>
  String(value || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";

const fetchAll = async (table) => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`${table} export failed: ${error.message}`);
  return data || [];
};

const writeJson = async (fileName, data) => {
  await writeFile(path.join(outputDir, fileName), JSON.stringify(data, null, 2));
};

await mkdir(path.join(outputDir, "thoughts"), { recursive: true });
await mkdir(path.join(outputDir, "blog_posts"), { recursive: true });

const [thoughts, blogPosts] = await Promise.all([
  fetchAll("thoughts"),
  fetchAll("blog_posts"),
]);

await writeJson("metadata.json", {
  exported_at: timestamp,
  source: "supabase",
  counts: {
    thoughts: thoughts.length,
    blog_posts: blogPosts.length,
  },
});
await writeJson("thoughts.json", thoughts);
await writeJson("blog_posts.json", blogPosts);

for (const thought of thoughts) {
  const fileName = `${thought.created_at || thought.id}-${thought.id}.md`.replace(/[:]/g, "-");
  const markdown = `---\nid: ${thought.id}\ncreated_at: ${thought.created_at}\nimage_url: ${thought.image_url || ""}\nimage_alt: ${thought.image_alt || ""}\nis_published: ${thought.is_published}\n---\n\n${thought.content || ""}\n`;
  await writeFile(path.join(outputDir, "thoughts", fileName), markdown);
}

for (const post of blogPosts) {
  const fileName = `${safeFileName(post.slug)}.md`;
  const tagsYaml = post.tags && Array.isArray(post.tags)
    ? `\ntags:\n${post.tags.map((t) => `  - ${JSON.stringify(t)}`).join("\n")}`
    : "\ntags: []";
  const markdown = `---\nid: ${post.id}\nslug: ${post.slug}\ntitle: ${JSON.stringify(post.title)}\nexcerpt: ${JSON.stringify(post.excerpt || "")}\ncover_image_url: ${post.cover_image_url || ""}\ncover_image_alt: ${JSON.stringify(post.cover_image_alt || "")}\ncreated_at: ${post.created_at}\nupdated_at: ${post.updated_at || ""}\nis_published: ${post.is_published}${tagsYaml}\n---\n\n${post.content || ""}\n`;
  await writeFile(path.join(outputDir, "blog_posts", fileName), markdown);
}

console.log(`Archive exported to ${outputDir}`);
