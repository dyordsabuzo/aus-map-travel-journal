import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BlogMeta } from "@types/BlogType";
import { blogFiles, extractMeta } from "@utils/blogextract";
import { Logger } from "@utils/logger";

export const BlogList: React.FC = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogMeta[]>([]);

  useEffect(() => {
    // Load all blog files and extract metadata
    const loadBlogs = async () => {
      const entries = Object.entries(blogFiles);

      Logger.debug("Loading blogs...", { blogFiles, entries });
      const loaded: BlogMeta[] = [];
      for (const [filePath, loader] of entries) {
        const content = await (loader as () => Promise<string>)();
        loaded.push(extractMeta(content, filePath));
      }
      // Sort by date descending if available
      loaded.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setBlogs(loaded);
    };
    loadBlogs();
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
