import React, { useState, useEffect } from "react";
import {
  BlogMeta,
  BlogStats,
  type FrontmatterData,
} from "../../types/BlogType";
import {
  getAllBlogMeta,
  getBlogBySlug,
  getFeaturedBlogs,
  getAllTags,
  getBlogStats,
  parseFrontmatter,
  createFrontmatterBlock,
  validateFrontmatter,
} from "../../utils/blogProcessor";

/**
 * Example React component demonstrating frontmatter system integration
 * This shows various ways to use the frontmatter utilities in React components
 */
export const FrontmatterExample: React.FC = () => {
  const [allBlogs, setAllBlogs] = useState<BlogMeta[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogMeta[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [filteredBlogs, setFilteredBlogs] = useState<BlogMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load all blogs
        const blogs = await getAllBlogMeta({
          includeDrafts: false,
          sortBy: "date",
          sortOrder: "desc",
        });
        setAllBlogs(blogs);

        // Load featured blogs
        const featured = await getFeaturedBlogs(3);
        setFeaturedBlogs(featured);

        // Load available tags
        const tags = await getAllTags();
        setAvailableTags(tags);

        // Load blog statistics
        const stats = await getBlogStats();
        setBlogStats(stats);

        setLoading(false);
      } catch (error) {
        console.error("Error loading blog data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter blogs by selected tag
  useEffect(() => {
    if (selectedTag) {
      const filtered = allBlogs.filter(
        (blog) => blog.tags && blog.tags.includes(selectedTag)
      );
      setFilteredBlogs(filtered);
    } else {
      setFilteredBlogs(allBlogs);
    }
  }, [selectedTag, allBlogs]);

  const handleTagSelect = (tag: string) => {
    setSelectedTag(selectedTag === tag ? "" : tag);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading blog data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Frontmatter System Demo</h1>

      {/* Blog Statistics */}
      {blogStats && (
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Blog Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {blogStats.totalPosts}
              </div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {blogStats.publishedPosts}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {blogStats.featuredPosts}
              </div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {blogStats.postsWithLocation}
              </div>
              <div className="text-sm text-gray-600">With Location</div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredBlogs.map((blog) => (
              <BlogCard key={blog.slug} blog={blog} isFeatured />
            ))}
          </div>
        </div>
      )}

      {/* Tag Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter by Tags</h2>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === tag
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag("")}
              className="px-3 py-1 rounded-full text-sm bg-red-500 text-white hover:bg-red-600"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Blog List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedTag ? `Posts tagged with "${selectedTag}"` : "All Posts"}
          <span className="text-sm text-gray-500 ml-2">
            ({filteredBlogs.length}{" "}
            {filteredBlogs.length === 1 ? "post" : "posts"})
          </span>
        </h2>
        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog.slug} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Individual blog card component
 */
interface BlogCardProps {
  blog: BlogMeta;
  isFeatured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, isFeatured = false }) => {
  return (
    <div
      className={`border rounded-lg p-4 hover:shadow-lg transition-shadow ${
        isFeatured
          ? "border-yellow-300 bg-yellow-50"
          : "border-gray-200 bg-white"
      }`}
    >
      {isFeatured && (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800 mb-2">
          ⭐ Featured
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">
        <a href={`/blog/${blog.slug}`} className="hover:text-blue-600">
          {blog.title}
        </a>
      </h3>

      {blog.description && (
        <p className="text-gray-600 text-sm mb-3">{blog.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        {blog.date && (
          <span>📅 {new Date(blog.date).toLocaleDateString()}</span>
        )}

        {blog.author && <span>👤 {blog.author}</span>}

        {blog.category && <span>📁 {blog.category}</span>}

        {blog.location && <span>📍 {blog.location.name}</span>}
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
        <span>
          {blog.hasFrontmatter ? "✅ Rich metadata" : "⚠️ Legacy format"}
        </span>
        {blog.draft && (
          <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
            Draft
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Example of integrating with a map component
 */
export const MapIntegrationExample: React.FC = () => {
  const [mapPins, setMapPins] = useState<any[]>([]);

  useEffect(() => {
    const loadMapData = async () => {
      const blogs = await getAllBlogMeta({
        includeDrafts: false,
      });

      // Extract location data for map pins
      const pins = blogs
        .filter((blog) => blog.location?.coordinates)
        .map((blog) => ({
          id: blog.slug,
          title: blog.title,
          lat: blog.location!.coordinates!.lat,
          lng: blog.location!.coordinates!.lng,
          description: blog.description || "",
          tags: blog.tags || [],
          category: blog.category,
          blogUrl: `/blog/${blog.slug}`,
          date: blog.date,
        }));

      setMapPins(pins);
    };

    loadMapData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Map Integration Example</h2>
      <p className="text-gray-600 mb-4">
        Found {mapPins.length} blog posts with location data for mapping:
      </p>

      <div className="space-y-2">
        {mapPins.map((pin) => (
          <div key={pin.id} className="border p-3 rounded">
            <h3 className="font-semibold">{pin.title}</h3>
            <p className="text-sm text-gray-600">
              📍 Lat: {pin.lat}, Lng: {pin.lng}
            </p>
            <p className="text-xs text-gray-500">
              Category: {pin.category} | Tags: {pin.tags.join(", ")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <h4 className="font-semibold text-blue-800">Integration Code:</h4>
        <pre className="text-xs text-blue-700 mt-2">
          {`// In your map component:
const pins = mapPins.map(pin => (
  <Marker
    key={pin.id}
    position={[pin.lat, pin.lng]}
    eventHandlers={{
      click: () => navigate(pin.blogUrl)
    }}
  >
    <Popup>
      <h3>{pin.title}</h3>
      <p>{pin.description}</p>
    </Popup>
  </Marker>
));`}
        </pre>
      </div>
    </div>
  );
};

export default FrontmatterExample;
