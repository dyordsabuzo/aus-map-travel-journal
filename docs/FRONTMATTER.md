# Frontmatter System Documentation

This document describes the comprehensive frontmatter extraction and processing system for markdown blog files in the Australian Map Travel Journal project.

## Overview

The frontmatter system provides a modular and reusable way to extract, validate, and process YAML frontmatter from markdown blog files. It supports both files with frontmatter and legacy files without frontmatter, providing seamless backward compatibility.

## Features

- 🔍 **Automatic frontmatter detection and parsing**
- 🔄 **Backward compatibility** with files without frontmatter
- 📊 **Rich metadata support** including location data, tags, categories
- 🎯 **Advanced filtering and sorting** capabilities
- ✅ **Validation and normalization** of frontmatter data
- 🛠️ **Modular design** for easy extension and reuse
- 📈 **Blog statistics and analytics**

## Core Components

### 1. Frontmatter Parser (`/src/utils/frontmatter.ts`)

The main parsing utility that handles YAML frontmatter extraction.

#### Key Functions:

- `parseFrontmatter(content: string)` - Parses frontmatter from markdown content
- `createFrontmatterBlock(data: FrontmatterData)` - Creates YAML frontmatter block
- `validateFrontmatter(data, requiredFields)` - Validates required fields
- `mergeFrontmatter(...frontmatters)` - Merges multiple frontmatter objects

### 2. Blog Processor (`/src/utils/blogProcessor.ts`)

High-level utilities for blog management and querying.

#### Key Functions:

- `getAllBlogMeta(options)` - Get all blog metadata with filtering/sorting
- `getBlogBySlug(slug)` - Get complete blog post by slug
- `getFeaturedBlogs(limit)` - Get featured blog posts
- `getBlogsByTag(tag)` - Get blogs filtered by tag
- `getBlogsByCategory(category)` - Get blogs filtered by category
- `getAllTags()` - Get all unique tags
- `getAllCategories()` - Get all unique categories
- `getBlogStats()` - Get comprehensive blog statistics

### 3. Enhanced Blog Extraction (`/src/utils/blogextract.ts`)

Updated version of the original blog extractor with frontmatter support.

## Frontmatter Schema

### Standard Fields

```yaml
---
title: "Blog Post Title"
date: "2024-06-01"
author: "Author Name"
tags: ["tag1", "tag2", "tag3"]
category: "Category Name"
description: "Brief description of the post"
location:
  name: "Location Name"
  coordinates:
    lat: -33.8688
    lng: 151.2093
featured: true
draft: false
---
```

### Extended Fields (Examples)

```yaml
---
# Restaurant/Food posts
restaurant:
  name: "Restaurant Name"
  cuisine: "Italian"
  priceRange: "$$"
  rating: 4.5

# Activity/Adventure posts
activity:
  type: "Hiking"
  duration: "4 hours"
  difficulty: "Moderate"
  cost: "$50"

# Photo Gallery posts
gallery:
  coverImage: "/images/cover.jpg"
  images: ["/images/1.jpg", "/images/2.jpg"]

# Custom fields are fully supported
customField: "Any value"
---
```

## Usage Examples

### Basic Usage

```typescript
import { parseFrontmatter } from '@utils/frontmatter';

const markdownContent = `---
title: "My Trip"
date: "2024-06-01"
tags: ["travel", "australia"]
---

# Content here`;

const result = parseFrontmatter(markdownContent);
console.log(result.frontmatter.title); // "My Trip"
console.log(result.content); // "# Content here"
console.log(result.hasFrontmatter); // true
```

### Getting Blog Data

```typescript
import { 
  getAllBlogMeta, 
  getBlogBySlug, 
  getFeaturedBlogs 
} from '@utils/blogProcessor';

// Get all published blogs, sorted by date
const blogs = await getAllBlogMeta({
  includeDrafts: false,
  sortBy: 'date',
  sortOrder: 'desc'
});

// Get a specific blog post
const blog = await getBlogBySlug('my-first-trip');

// Get featured blogs
const featured = await getFeaturedBlogs(3);
```

### Advanced Filtering

```typescript
import { getAllBlogMeta } from '@utils/blogProcessor';

// Get blogs with specific criteria
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
```

### Working with Tags and Categories

```typescript
import { 
  getAllTags, 
  getAllCategories, 
  getBlogsByTag,
  getBlogStats 
} from '@utils/blogProcessor';

// Get all available tags
const tags = await getAllTags();

// Get all categories
const categories = await getAllCategories();

// Get blogs by specific tag
const sydneyBlogs = await getBlogsByTag('sydney');

// Get comprehensive statistics
const stats = await getBlogStats();
console.log(`Total posts: ${stats.totalPosts}`);
console.log(`Published: ${stats.publishedPosts}`);
console.log(`With location: ${stats.postsWithLocation}`);
```

## Migration Guide

### Converting Existing Files

If you have existing markdown files without frontmatter, the system will automatically extract metadata from the content:

**Before (Legacy format):**
```markdown
# My First Trip

*Date: 2024-06-01*

Content here...
```

**After (With frontmatter):**
```markdown
---
title: "My First Trip"
date: "2024-06-01"
author: "Your Name"
tags: ["travel", "australia"]
category: "Travel"
description: "Brief description"
featured: false
draft: false
---

Content here...
```

### Batch Migration Script

```typescript
import { parseFrontmatter, createFrontmatterBlock } from '@utils/frontmatter';
import { extractTitleFromContent, extractDateFromContent } from '@utils/frontmatter';

// Example migration function
function migrateLegacyFile(content: string): string {
  const { hasFrontmatter, content: markdownContent } = parseFrontmatter(content);
  
  if (hasFrontmatter) {
    return content; // Already has frontmatter
  }
  
  // Extract data from content
  const title = extractTitleFromContent(content);
  const date = extractDateFromContent(content);
  
  // Create frontmatter
  const frontmatter = {
    title: title || 'Untitled',
    date: date,
    author: 'Travel Blogger',
    tags: ['travel'],
    category: 'Travel',
    draft: false,
    featured: false
  };
  
  const frontmatterBlock = createFrontmatterBlock(frontmatter);
  return frontmatterBlock + '\n' + markdownContent;
}
```

## Best Practices

### 1. Consistent Field Names
- Use lowercase for field names where possible
- Use consistent date format (YYYY-MM-DD)
- Use arrays for multi-value fields like tags

### 2. Location Data
```yaml
location:
  name: "Sydney, New South Wales, Australia"
  coordinates:
    lat: -33.8688
    lng: 151.2093
```

### 3. Tags and Categories
- Keep tags lowercase and descriptive
- Use singular forms for consistency
- Limit categories to a manageable set

### 4. Content Organization
```yaml
---
title: "Descriptive Title"
date: "2024-06-01"
author: "Author Name"
tags: ["sydney", "australia", "travel", "food"]
category: "Travel"
description: "SEO-friendly description under 160 characters"
featured: false  # Reserve for special posts
draft: false     # Set to true during writing
---
```

## Error Handling

The system includes comprehensive error handling:

- **Invalid YAML**: Falls back to default frontmatter
- **Missing files**: Returns null for single blog queries, empty arrays for collections
- **Invalid dates**: Gracefully handled with warnings
- **Missing required fields**: Configurable validation with helpful warnings

## Performance Considerations

- Frontmatter parsing is cached per file
- Blog metadata is processed lazily
- Use filtering options to limit data loading
- Consider pagination for large blog collections

## TypeScript Support

All components are fully typed with TypeScript:

```typescript
import { FrontmatterData, ParsedFrontmatter } from '@utils/frontmatter';
import { BlogMeta, BlogPost } from '@types/BlogType';
import { BlogProcessingOptions } from '@utils/blogProcessor';
```

## Testing

Run the examples to test the system:

```typescript
import { runAllExamples } from '@utils/examples/frontmatterExamples';

// Run all examples
await runAllExamples();
```

## Extending the System

### Adding Custom Fields

1. Extend the `FrontmatterData` interface in `/src/utils/frontmatter.ts`
2. Update the `BlogMeta` type in `/src/types/BlogType.ts`
3. Add validation logic if needed

### Creating Custom Filters

```typescript
import { getAllBlogMeta } from '@utils/blogProcessor';

// Custom filter function
const getBlogsWithCustomCriteria = async () => {
  const allBlogs = await getAllBlogMeta({ includeDrafts: true });
  
  return allBlogs.filter(blog => {
    // Your custom logic here
    return blog.customField === 'specificValue';
  });
};
```

## Troubleshooting

### Common Issues

1. **Frontmatter not parsing**: Check YAML syntax with online validator
2. **Missing metadata**: Ensure frontmatter delimiters (`---`) are on their own lines
3. **Date issues**: Use YYYY-MM-DD format consistently
4. **Performance**: Use filtering options to limit data processing

### Debug Logging

The system uses the project's logger utility. Check console output for warnings and errors during development.

## Examples

See `/src/utils/examples/frontmatterExamples.ts` for comprehensive usage examples covering all system features.

## Support

For issues or feature requests related to the frontmatter system, check the project documentation or create an issue in the repository.