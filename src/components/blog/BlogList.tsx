import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BlogMeta } from "../../types/BlogType";
import { getAllBlogMeta } from "@utils/blogProcessor";
import { Logger } from "@utils/logger";

export const BlogList: React.FC = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogMeta[]>([]);

  useEffect(() => {
    // Load all blog metadata using the new consolidated API
    const loadBlogs = async () => {
      try {
        Logger.debug("Loading blogs...");
        const loaded = await getAllBlogMeta({
          includeDrafts: false,
          sortBy: "date",
          sortOrder: "desc",
        });
        setBlogs(loaded);
      } catch (error) {
        Logger.error("Failed to load blogs:", error);
      }
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
