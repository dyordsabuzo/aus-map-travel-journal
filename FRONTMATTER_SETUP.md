# Frontmatter System Setup & Usage Guide

## 🎯 Overview

You now have a comprehensive, modular frontmatter extraction system for your Australian Map Travel Journal! This system allows you to extract rich metadata from markdown blog files while maintaining backward compatibility with existing content.

## 📦 What's Been Added

### Core Components

1. **Frontmatter Parser** (`src/utils/frontmatter.ts`)
   - YAML frontmatter parsing and extraction
   - Backward compatibility with legacy files
   - Type-safe frontmatter data handling
   - Validation and normalization utilities

2. **Blog Processor** (`src/utils/blogProcessor.ts`)
   - High-level blog management functions
   - Advanced filtering and sorting capabilities
   - Statistics and analytics functions
   - Tag and category management

3. **Enhanced Blog Extractor** (`src/utils/blogextract.ts`)
   - Updated to use frontmatter when available
   - Falls back to content extraction for legacy files
   - Seamless integration with existing code

4. **Type Definitions** (Updated `src/types/BlogType.ts`)
   - Extended to support rich metadata
   - Location data with coordinates
   - Tags, categories, and custom fields

## 🚀 Quick Start

### Basic Usage

```typescript
import { parseFrontmatter } from '@utils/frontmatter';
import { getAllBlogMeta, getBlogBySlug } from '@utils/blogProcessor';

// Parse frontmatter from markdown content
const result = parseFrontmatter(markdownContent);
console.log(result.frontmatter.title);
console.log(result.frontmatter.location);

// Get all blog metadata
const blogs = await getAllBlogMeta();

// Get specific blog post
const blog = await getBlogBySlug('my-first-trip');
```

### Standard Frontmatter Format

Your markdown files can now include rich metadata at the top:

```yaml
---
title: "My Adventure in Sydney"
date: "2024-06-01"
author: "Travel Blogger"
tags: ["sydney", "australia", "travel", "adventure"]
category: "Travel"
description: "My first adventure in Australia, exploring Sydney's iconic landmarks."
location:
  name: "Sydney, Australia"
  coordinates:
    lat: -33.8688
    lng: 151.2093
featured: true
draft: false
---

# Your markdown content starts here...
```

## 🔧 Available Functions

### Frontmatter Operations

- `parseFrontmatter(content)` - Extract frontmatter from markdown
- `createFrontmatterBlock(data)` - Generate YAML frontmatter
- `validateFrontmatter(data, requiredFields)` - Validate metadata
- `mergeFrontmatter(...frontmatters)` - Combine metadata objects

### Blog Management

- `getAllBlogMeta(options)` - Get all blog metadata with filtering
- `getBlogBySlug(slug)` - Get complete blog post
- `getFeaturedBlogs(limit)` - Get featured posts
- `getBlogsByTag(tag)` - Filter by tag
- `getBlogsByCategory(category)` - Filter by category
- `getAllTags()` - Get all unique tags
- `getAllCategories()` - Get all unique categories
- `getBlogStats()` - Get comprehensive statistics

## 📊 Advanced Filtering & Sorting

```typescript
// Get blogs with advanced criteria
const filteredBlogs = await getAllBlogMeta({
  includeDrafts: false,
  requiredFields: ['location'],
  filterBy: {
    tags: ['sydney', 'australia'],
    category: 'Travel',
    featured: true
  },
  sortBy: 'date',
  sortOrder: 'desc'
});

// Get blogs with location data for mapping
const blogsWithLocation = filteredBlogs.filter(blog => 
  blog.location?.coordinates
);
```

## 🗺️ Integration with Your Map

The frontmatter system is perfect for your travel journal mapping features:

```typescript
// Get all blog posts with location data
const locationBlogs = await getAllBlogMeta({
  filterBy: { /* your criteria */ }
});

// Extract coordinates for map pins
const mapPins = locationBlogs
  .filter(blog => blog.location?.coordinates)
  .map(blog => ({
    id: blog.slug,
    title: blog.title,
    lat: blog.location.coordinates.lat,
    lng: blog.location.coordinates.lng,
    description: blog.description,
    tags: blog.tags,
    blogUrl: `/blog/${blog.slug}`
  }));
```

## 📝 Migration from Legacy Format

Your existing files work without changes! The system automatically:

**Before (Legacy):**
```markdown
# My First Trip

*Date: 2024-06-01*

Content here...
```

**After (With Frontmatter):**
```markdown
---
title: "My First Trip"
date: "2024-06-01"
author: "Your Name"
tags: ["travel", "australia"]
category: "Travel"
featured: false
draft: false
---

Content here...
```

## 🧪 Testing & Verification

1. **Run the demo script:**
```bash
node demo-frontmatter.js
```

2. **Test in your app:**
```typescript
import { runAllTests } from '@utils/test-frontmatter';
await runAllTests(); // Check console for results
```

3. **Example usage:**
```typescript
import { runAllExamples } from '@utils/examples/frontmatterExamples';
await runAllExamples(); // Comprehensive examples
```

## 🏗️ Project Structure

```
src/
├── utils/
│   ├── frontmatter.ts          # Core frontmatter parsing
│   ├── blogProcessor.ts        # High-level blog management
│   ├── blogextract.ts          # Enhanced extraction (updated)
│   ├── test-frontmatter.ts     # Simple tests
│   └── examples/
│       └── frontmatterExamples.ts  # Comprehensive examples
├── types/
│   └── BlogType.ts             # Updated with frontmatter fields
├── blogs/
│   ├── my-first-trip.md        # Updated with frontmatter
│   └── my-second-trip.md       # Updated with frontmatter
└── docs/
    └── FRONTMATTER.md          # Detailed technical docs
```

## 💡 Best Practices

### 1. Consistent Metadata
- Use consistent date format: `YYYY-MM-DD`
- Keep tags lowercase and descriptive
- Use meaningful categories
- Include location data for mapping

### 2. SEO-Friendly
```yaml
---
title: "Descriptive Title"
description: "SEO-friendly description under 160 characters"
tags: ["relevant", "keywords"]
---
```

### 3. Location Data
```yaml
---
location:
  name: "Sydney, New South Wales, Australia"
  coordinates:
    lat: -33.8688
    lng: 151.2093
---
```

### 4. Content Management
```yaml
---
featured: true    # For highlighting special posts
draft: false      # For publish/preview workflow
category: "Travel" # For organization
---
```

## 🔍 Common Use Cases

### Blog Listing Component
```typescript
const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  
  useEffect(() => {
    getAllBlogMeta({
      includeDrafts: false,
      sortBy: 'date',
      sortOrder: 'desc'
    }).then(setBlogs);
  }, []);
  
  return (
    <div>
      {blogs.map(blog => (
        <BlogCard key={blog.slug} blog={blog} />
      ))}
    </div>
  );
};
```

### Map Integration
```typescript
const TravelMap = () => {
  const [mapPins, setMapPins] = useState([]);
  
  useEffect(() => {
    getAllBlogMeta().then(blogs => {
      const pins = blogs
        .filter(blog => blog.location?.coordinates)
        .map(blog => ({
          position: [blog.location.coordinates.lat, blog.location.coordinates.lng],
          title: blog.title,
          slug: blog.slug
        }));
      setMapPins(pins);
    });
  }, []);
  
  // Render map with pins...
};
```

### Tag-Based Navigation
```typescript
const TagCloud = () => {
  const [tags, setTags] = useState([]);
  
  useEffect(() => {
    getAllTags().then(setTags);
  }, []);
  
  return (
    <div>
      {tags.map(tag => (
        <Link key={tag} to={`/blog/tag/${tag}`}>
          #{tag}
        </Link>
      ))}
    </div>
  );
};
```

## 🛠️ Extending the System

### Adding Custom Fields

1. Extend the `FrontmatterData` interface:
```typescript
export interface FrontmatterData {
  // ... existing fields
  customField?: string;
  rating?: number;
  photos?: string[];
}
```

2. Update your frontmatter:
```yaml
---
title: "Blog Post"
customField: "custom value"
rating: 4.5
photos: ["/img/1.jpg", "/img/2.jpg"]
---
```

### Custom Filters
```typescript
const getHighRatedBlogs = async () => {
  const allBlogs = await getAllBlogMeta();
  return allBlogs.filter(blog => blog.rating && blog.rating >= 4.0);
};
```

## 📚 Documentation

- **Technical Details:** See `docs/FRONTMATTER.md`
- **Examples:** Check `src/utils/examples/frontmatterExamples.ts`
- **Type Definitions:** Review `src/types/BlogType.ts`

## ✅ Verification Steps

1. ✅ Core frontmatter parsing works (tested with demo script)
2. ✅ Backward compatibility maintained
3. ✅ Rich metadata support (location, tags, etc.)
4. ✅ TypeScript types updated
5. ✅ Examples and documentation provided
6. ✅ Integration points identified

## 🚀 Next Steps

1. **Test in your React app** - Import and use the functions
2. **Add frontmatter to more blog posts** - Use the examples as templates
3. **Integrate with your map component** - Use location data for pins
4. **Build tag/category navigation** - Use the filtering functions
5. **Add blog statistics dashboard** - Use `getBlogStats()`

## 🎉 You're All Set!

Your frontmatter system is now ready to use! It's:
- ✅ **Modular** - Each utility is focused and reusable
- ✅ **Backward Compatible** - Existing files work unchanged  
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Feature-Rich** - Location data, tags, categories, and more
- ✅ **Well-Documented** - Examples and guides provided

Start by running the demo script, then begin adding frontmatter to your blog posts and integrating the utilities into your React components!