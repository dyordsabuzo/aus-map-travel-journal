import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  Routes,
  Route,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";

// Statically import all markdown files in src/blogs
// import myFirstTrip from "../blogs/my-first-trip.md";

// Map of slug to content
const blogFiles: Record<string, string> = {
  // "my-first-trip": myFirstTrip,
};

type BlogMeta = {
  slug: string;
  title: string;
  date?: string;
  filePath: string;
};

type BlogPost = BlogMeta & {
  content: string;
};

function extractMeta(content: string, filePath: string): BlogMeta {
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
}

export const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogMeta[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load all blog files and extract metadata
    const loaded: BlogMeta[] = [];
    for (const [slug, content] of Object.entries(blogFiles)) {
      // Fake a filePath for compatibility with extractMeta
      const filePath = `../blogs/${slug}.md`;
      loaded.push(extractMeta(content, filePath));
    }
    // Sort by date descending if available
    loaded.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    setBlogs(loaded);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Travel Blog</h1>
      <ul>
        {blogs.map((blog) => (
          <li key={blog.slug} className="mb-4">
            <button
              className="text-blue-600 hover:underline text-xl"
              onClick={() => navigate(`/blogs/${blog.slug}`)}
            >
              {blog.title}
            </button>
            {blog.date && (
              <span className="ml-2 text-gray-500 text-sm">({blog.date})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const BlogViewer: React.FC = () => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const location = useLocation();

  // Extract slug from URL: /blogs/:slug
  const slug = location.pathname.split("/").pop() || "";

  useEffect(() => {
    const content = blogFiles[slug];
    if (!content) {
      setPost(null);
      return;
    }
    const filePath = `../blogs/${slug}.md`;
    const meta = extractMeta(content, filePath);
    setPost({ ...meta, content });
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <p>Blog post not found.</p>
        <Link to="/blogs" className="text-blue-600 hover:underline">
          Back to Blog List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      {post.date && (
        <div className="text-gray-500 text-sm mb-4">{post.date}</div>
      )}
      <div className="prose">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      <div className="mt-8">
        <Link to="/blogs" className="text-blue-600 hover:underline">
          ← Back to Blog List
        </Link>
      </div>
    </div>
  );
};

// Main BlogRoutes component to be used in App.tsx
export const BlogRoutes: React.FC = () => (
  <Routes>
    <Route path="/blogs" element={<BlogList />} />
    <Route path="/blogs/:slug" element={<BlogViewer />} />
  </Routes>
);
