import { BlogMeta } from "@types/BlogType";
import { Logger } from "@utils/logger";

// Dynamically import all markdown files in src/blogs (Vite only)
export const blogFiles: Record<string, () => Promise<string>> =
  import.meta.glob("@blogs/*.md", {
    query: "?raw",
    import: "default",
  });

export const extractMeta = (content: string, filePath: string): BlogMeta => {
  return Logger.withTryCatchSync(() => {
    // Extract title (first line starting with #)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch
      ? titleMatch[1].trim()
      : filePath.split("/").pop() || "Untitled";

    // Extract date (line like *Date: YYYY-MM-DD*)
    const dateMatch = content.match(/^\*Date:\s*([0-9\-]+)\*/m);
    const date = dateMatch ? dateMatch[1].trim() : undefined;

    // Slug from filename (without extension)
    const slug = filePath.split("/").pop()?.replace(/\.md$/, "") || "";

    return { slug, title, date, filePath };
  }, `extracting content for ${filePath}`);
};
