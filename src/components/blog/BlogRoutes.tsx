import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  Routes,
  Route,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { BlogList } from "./BlogList";
import { BlogViewer } from "./BlogViewer";

// Dynamically import all markdown files in src/blogs (Vite only)
// const blogFiles: Record<string, () => Promise<string>> = import.meta.glob(
export const blogFiles: any = import.meta.glob("../../blogs/*.md", {
  query: "raw",
});

export type BlogMeta = {
  slug: string;
  title: string;
  date?: string;
  filePath: string;
};

export type BlogPost = BlogMeta & {
  content: string;
};

export const extractMeta = (content: string, filePath: string): BlogMeta => {
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
};

// Main BlogRoutes component to be used in App.tsx
export const BlogRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<BlogList />} />
    <Route path="/:slug" element={<BlogViewer />} />
  </Routes>
);
