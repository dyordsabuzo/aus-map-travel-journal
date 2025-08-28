import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Link, useLocation } from "react-router-dom";
import { getBlogBySlug } from "@utils/blogProcessor";
import { BlogPost } from "../../types/BlogType";

export const BlogViewer: React.FC = () => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const location = useLocation();

  // Extract slug from URL: /blogs/:slug
  const slug = location.pathname.split("/").pop() || "";

  useEffect(() => {
    const loadPost = async () => {
      try {
        const blogPost = await getBlogBySlug(slug, false);
        setPost(blogPost);
      } catch (error) {
        console.error("Failed to load blog post:", error);
        setPost(null);
      }
    };

    if (slug) {
      loadPost();
    } else {
      setPost(null);
    }
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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      <div className="mt-8">
        <Link to="/blogs" className="text-blue-600 hover:underline">
          ← Back to Blog List
        </Link>
      </div>
    </div>
  );
};
