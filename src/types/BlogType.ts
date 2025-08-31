/**
 * Comprehensive blog-related type definitions
 * Consolidates all blog interfaces, types, and data structures
 */

/**
 * Location data structure for blog posts
 */
export interface BlogLocation {
  name?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Frontmatter data structure - represents metadata extracted from markdown files
 */
export interface FrontmatterData {
  title?: string;
  date?: string;
  author?: string;
  tags?: string[];
  category?: string;
  description?: string;
  location?: BlogLocation;
  featured?: boolean;
  draft?: boolean;
  [key: string]: any; // Allow for additional custom fields
}

/**
 * Result of frontmatter parsing operation
 */
export interface ParsedFrontmatter {
  frontmatter: FrontmatterData;
  content: string;
  hasFrontmatter: boolean;
}

/**
 * Blog metadata - core information about a blog post
 */
export interface BlogMeta {
  slug: string;
  title: string;
  date?: string;
  author?: string;
  tags?: string[];
  category?: string;
  description?: string;
  location?: BlogLocation;
  featured?: boolean;
  draft?: boolean;
  filePath: string;
  hasFrontmatter?: boolean;
  [key: string]: any; // Allow for additional custom frontmatter fields
}

/**
 * Complete blog post with content
 */
export interface BlogPost extends BlogMeta {
  content: string;
}

/**
 * Options for blog processing operations
 */
export interface BlogProcessingOptions {
  includeDrafts?: boolean;
  requiredFields?: string[];
  sortBy?: "date" | "title" | "featured" | "author" | "category";
  sortOrder?: "asc" | "desc";
  filterBy?: BlogFilterOptions;
}

/**
 * Filter options for blog queries
 */
export interface BlogFilterOptions {
  tags?: string[];
  category?: string;
  featured?: boolean;
  author?: string;
  hasLocation?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

/**
 * Blog statistics and analytics data
 */
export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  totalTags: number;
  totalCategories: number;
  postsWithLocation: number;
  postsByCategory: Record<string, number>;
  postsByAuthor: Record<string, number>;
  recentPosts: number; // Posts in last 30 days
}

/**
 * Blog file import function type for Vite
 */
export type BlogFileImporter = () => Promise<string>;

/**
 * Blog files collection type
 */
export type BlogFilesCollection = Record<string, BlogFileImporter>;

/**
 * Blog validation result
 */
export interface BlogValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Blog search/query parameters
 */
export interface BlogQuery {
  search?: string;
  tags?: string[];
  category?: string;
  author?: string;
  featured?: boolean;
  includeDrafts?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: BlogProcessingOptions["sortBy"];
  sortOrder?: BlogProcessingOptions["sortOrder"];
}

/**
 * Blog search result
 */
export interface BlogSearchResult {
  blogs: BlogMeta[];
  totalCount: number;
  hasMore: boolean;
  query: BlogQuery;
}

/**
 * Tag with usage count
 */
export interface TagWithCount {
  tag: string;
  count: number;
}

/**
 * Category with usage count
 */
export interface CategoryWithCount {
  category: string;
  count: number;
}

/**
 * Blog archive data (grouped by date)
 */
export interface BlogArchive {
  year: number;
  months: {
    month: number;
    monthName: string;
    posts: BlogMeta[];
    count: number;
  }[];
  totalPosts: number;
}

/**
 * Blog feed/RSS data
 */
export interface BlogFeed {
  title: string;
  description: string;
  link: string;
  lastBuildDate: string;
  items: {
    title: string;
    description: string;
    link: string;
    pubDate: string;
    guid: string;
    author?: string;
    categories?: string[];
  }[];
}

/**
 * Map pin data derived from blog posts
 */
export type PinType = "stopover" | "destination";

export interface BlogMapPin {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
  tags?: string[];
  category?: string;
  blogUrl: string;
  date?: string;
  featured?: boolean;
  featuredPhoto?: string;
  userId?: string;
  type?: PinType;
}

/**
 * Blog content extraction configuration
 */
export interface BlogExtractionConfig {
  fileGlob?: string;
  defaultAuthor?: string;
  requiredFields?: string[];
  validateFrontmatter?: boolean;
  extractContentPreview?: boolean;
  previewLength?: number;
}

/**
 * Default values for blog processing
 */
export const DEFAULT_BLOG_PROCESSING_OPTIONS: Required<BlogProcessingOptions> =
  {
    includeDrafts: false,
    requiredFields: [],
    sortBy: "date",
    sortOrder: "desc",
    filterBy: {},
  };

/**
 * Default frontmatter values
 */
export const DEFAULT_FRONTMATTER: FrontmatterData = {
  draft: false,
  featured: false,
  tags: [],
};

/**
 * Blog validation schema - defines required and optional fields
 */
export const BLOG_VALIDATION_SCHEMA = {
  required: ["title", "slug"],
  optional: [
    "date",
    "author",
    "tags",
    "category",
    "description",
    "location",
    "featured",
    "draft",
  ],
  locationRequired: ["name"],
  locationOptional: ["coordinates"],
  coordinatesRequired: ["lat", "lng"],
} as const;

/**
 * Supported frontmatter formats
 */
export type FrontmatterFormat = "yaml" | "json" | "toml";

/**
 * Blog content types for different post formats
 */
export type BlogContentType = "markdown" | "html" | "text";

/**
 * Blog status enumeration
 */
export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  FEATURED = "featured",
  ARCHIVED = "archived",
}

/**
 * Type guards for blog-related types
 */
export const isBlogMeta = (obj: any): obj is BlogMeta => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.slug === "string" &&
    typeof obj.title === "string" &&
    typeof obj.filePath === "string"
  );
};

export const isBlogPost = (obj: any): obj is BlogPost => {
  return isBlogMeta(obj) && typeof obj.content === "string";
};

export const hasLocation = (
  blog: BlogMeta,
): blog is BlogMeta & { location: NonNullable<BlogLocation> } => {
  return Boolean(blog.location);
};

export const hasCoordinates = (
  blog: BlogMeta,
): blog is BlogMeta & {
  location: BlogLocation & {
    coordinates: NonNullable<BlogLocation["coordinates"]>;
  };
} => {
  return Boolean(
    blog.location?.coordinates?.lat && blog.location?.coordinates?.lng,
  );
};
