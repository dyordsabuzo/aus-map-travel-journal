/**
 * Example usage of the frontmatter system
 * This file demonstrates how to use the various frontmatter utilities
 */

import {
  getAllBlogMeta,
  getBlogBySlug,
  getFeaturedBlogs,
  getBlogsByTag,
  getBlogsByCategory,
  getAllTags,
  getAllCategories,
  getBlogStats,
  parseFrontmatter,
  createFrontmatterBlock,
  validateFrontmatter,
  mergeFrontmatter,
  type FrontmatterData,
} from "../blogProcessor";

/**
 * Example 1: Basic frontmatter parsing
 */
export async function exampleBasicParsing() {
  const markdownContent = `---
title: "My Adventure"
date: "2024-06-01"
tags: ["travel", "adventure"]
---

# Content starts here
This is the main content of the blog post.`;

  const result = parseFrontmatter(markdownContent);
  console.log("Parsed frontmatter:", result.frontmatter);
  console.log("Content without frontmatter:", result.content);
  console.log("Has frontmatter:", result.hasFrontmatter);
}

/**
 * Example 2: Get all blog metadata with filtering and sorting
 */
export async function exampleGetAllBlogs() {
  // Get all published blogs, sorted by date (newest first)
  const allBlogs = await getAllBlogMeta({
    includeDrafts: false,
    sortBy: "date",
    sortOrder: "desc",
  });

  console.log(
    "All blogs:",
    allBlogs.map((blog) => ({
      title: blog.title,
      date: blog.date,
      tags: blog.tags,
      hasFrontmatter: blog.hasFrontmatter,
    }))
  );
}

/**
 * Example 3: Get blogs by specific criteria
 */
export async function exampleFilteredBlogs() {
  // Get only featured blogs
  const featuredBlogs = await getFeaturedBlogs(3);
  console.log(
    "Featured blogs:",
    featuredBlogs.map((b) => b.title)
  );

  // Get blogs with specific tags
  const sydneyBlogs = await getBlogsByTag("sydney");
  console.log(
    "Sydney blogs:",
    sydneyBlogs.map((b) => b.title)
  );

  // Get blogs by category
  const travelBlogs = await getBlogsByCategory("Travel");
  console.log(
    "Travel blogs:",
    travelBlogs.map((b) => b.title)
  );

  // Get blogs with advanced filtering
  const filteredBlogs = await getAllBlogMeta({
    filterBy: {
      tags: ["australia", "adventure"],
      featured: true,
    },
    sortBy: "title",
    sortOrder: "asc",
  });
  console.log(
    "Filtered blogs:",
    filteredBlogs.map((b) => b.title)
  );
}

/**
 * Example 4: Get a complete blog post
 */
export async function exampleGetSingleBlog() {
  const blog = await getBlogBySlug("my-first-trip");
  if (blog) {
    console.log("Blog post:");
    console.log("Title:", blog.title);
    console.log("Date:", blog.date);
    console.log("Author:", blog.author);
    console.log("Tags:", blog.tags);
    console.log("Location:", blog.location);
    console.log("Content preview:", blog.content.substring(0, 100) + "...");
  }
}

/**
 * Example 5: Working with tags and categories
 */
export async function exampleTagsAndCategories() {
  const allTags = await getAllTags();
  console.log("All tags:", allTags);

  const allCategories = await getAllCategories();
  console.log("All categories:", allCategories);

  const stats = await getBlogStats();
  console.log("Blog statistics:", stats);
}

/**
 * Example 6: Creating and validating frontmatter
 */
export async function exampleCreateFrontmatter() {
  const frontmatter: FrontmatterData = {
    title: "New Blog Post",
    date: "2024-12-19",
    author: "John Doe",
    tags: ["example", "demo"],
    category: "Tutorial",
    featured: false,
    draft: true,
  };

  // Create frontmatter block
  const frontmatterBlock = createFrontmatterBlock(frontmatter);
  console.log("Generated frontmatter block:");
  console.log(frontmatterBlock);

  // Validate frontmatter
  const isValid = validateFrontmatter(frontmatter, ["title", "date"]);
  console.log("Is valid (has title and date):", isValid);

  // Merge frontmatter
  const additionalMeta = { description: "This is a demo post", featured: true };
  const mergedFrontmatter = mergeFrontmatter(frontmatter, additionalMeta);
  console.log("Merged frontmatter:", mergedFrontmatter);
}

/**
 * Example 7: Working with location data
 */
export async function exampleLocationData() {
  const blogsWithLocation = await getAllBlogMeta({
    includeDrafts: false,
  });

  const locationsMap = blogsWithLocation
    .filter((blog) => blog.location?.coordinates)
    .map((blog) => ({
      title: blog.title,
      location: blog.location,
    }));

  console.log("Blogs with location data:", locationsMap);
}

/**
 * Example 8: Advanced filtering for a travel journal use case
 */
export async function exampleTravelJournalUseCases() {
  // Get recent trips (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentTrips = await getAllBlogMeta({
    includeDrafts: false,
    sortBy: "date",
    sortOrder: "desc",
  });

  const filteredRecentTrips = recentTrips.filter((blog) => {
    if (!blog.date) return false;
    return new Date(blog.date) >= sixMonthsAgo;
  });

  console.log(
    "Recent trips:",
    filteredRecentTrips.map((t) => ({
      title: t.title,
      date: t.date,
      location: t.location?.name,
    }))
  );

  // Get trips by Australia regions (based on tags)
  const australianStates = [
    "nsw",
    "vic",
    "qld",
    "wa",
    "sa",
    "tas",
    "nt",
    "act",
  ];
  const tripsByState: Record<string, any[]> = {};

  for (const state of australianStates) {
    const stateTrips = await getBlogsByTag(state);
    if (stateTrips.length > 0) {
      tripsByState[state.toUpperCase()] = stateTrips.map((t) => t.title);
    }
  }

  console.log("Trips by Australian state:", tripsByState);
}

/**
 * Example 9: Error handling and fallback behavior
 */
export async function exampleErrorHandling() {
  // Try to get a non-existent blog
  const nonExistentBlog = await getBlogBySlug("non-existent-blog");
  console.log("Non-existent blog result:", nonExistentBlog); // Should be null

  // Parse invalid frontmatter
  const invalidMarkdown = `---
invalid: yaml: content: here
---
# Valid content`;

  const result = parseFrontmatter(invalidMarkdown);
  console.log("Parsing invalid frontmatter:");
  console.log("Has frontmatter:", result.hasFrontmatter); // Should be false
  console.log("Fallback frontmatter:", result.frontmatter);
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log("=== Running Frontmatter System Examples ===\n");

  console.log("1. Basic Parsing:");
  await exampleBasicParsing();
  console.log("\n");

  console.log("2. Get All Blogs:");
  await exampleGetAllBlogs();
  console.log("\n");

  console.log("3. Filtered Blogs:");
  await exampleFilteredBlogs();
  console.log("\n");

  console.log("4. Single Blog:");
  await exampleGetSingleBlog();
  console.log("\n");

  console.log("5. Tags and Categories:");
  await exampleTagsAndCategories();
  console.log("\n");

  console.log("6. Create Frontmatter:");
  await exampleCreateFrontmatter();
  console.log("\n");

  console.log("7. Location Data:");
  await exampleLocationData();
  console.log("\n");

  console.log("8. Travel Journal Use Cases:");
  await exampleTravelJournalUseCases();
  console.log("\n");

  console.log("9. Error Handling:");
  await exampleErrorHandling();
  console.log("\n");

  console.log("=== Examples Complete ===");
}

/**
 * Example frontmatter templates for different types of posts
 */
export const frontmatterTemplates = {
  // Basic travel blog post
  travel: {
    title: "",
    date: new Date().toISOString().split("T")[0],
    author: "",
    tags: ["travel", "australia"],
    category: "Travel",
    description: "",
    location: {
      name: "",
      coordinates: {
        lat: 0,
        lng: 0,
      },
    },
    featured: false,
    draft: true,
  },

  // Photo gallery post
  gallery: {
    title: "",
    date: new Date().toISOString().split("T")[0],
    author: "",
    tags: ["photography", "gallery"],
    category: "Photography",
    description: "",
    location: {
      name: "",
      coordinates: { lat: 0, lng: 0 },
    },
    gallery: {
      coverImage: "",
      images: [],
    },
    featured: false,
    draft: true,
  },

  // Food and dining post
  food: {
    title: "",
    date: new Date().toISOString().split("T")[0],
    author: "",
    tags: ["food", "dining"],
    category: "Food & Dining",
    description: "",
    location: {
      name: "",
      coordinates: { lat: 0, lng: 0 },
    },
    restaurant: {
      name: "",
      cuisine: "",
      priceRange: "",
      rating: 0,
    },
    featured: false,
    draft: true,
  },

  // Adventure/activity post
  adventure: {
    title: "",
    date: new Date().toISOString().split("T")[0],
    author: "",
    tags: ["adventure", "activity"],
    category: "Adventure",
    description: "",
    location: {
      name: "",
      coordinates: { lat: 0, lng: 0 },
    },
    activity: {
      type: "",
      duration: "",
      difficulty: "",
      cost: "",
    },
    featured: false,
    draft: true,
  },
};
