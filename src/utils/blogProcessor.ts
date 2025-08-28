/**
 * Consolidated Blog Processor
 * Handles all blog-related operations including extraction, processing, filtering, and management
 */

import * as yaml from "js-yaml";
import { Logger } from "@utils/logger";
import {
  BlogMeta,
  BlogPost,
  BlogProcessingOptions,
  BlogFilterOptions,
  BlogStats,
  BlogQuery,
  BlogSearchResult,
  BlogValidationResult,
  BlogArchive,
  BlogMapPin,
  BlogExtractionConfig,
  FrontmatterData,
  ParsedFrontmatter,
  TagWithCount,
  CategoryWithCount,
  DEFAULT_BLOG_PROCESSING_OPTIONS,
  DEFAULT_FRONTMATTER,
  BLOG_VALIDATION_SCHEMA,
  isBlogMeta,
  hasCoordinates,
} from "../types/BlogType";

/**
 * Blog file imports (Vite glob import)
 */
export const blogFiles: Record<string, () => Promise<string>> =
  import.meta.glob("@blogs/*.md", {
    query: "?raw",
    import: "default",
  }) as Record<string, () => Promise<string>>;

/**
 * Core frontmatter parsing functionality
 */
export class FrontmatterParser {
  /**
   * Parse frontmatter from markdown content
   */
  static parse(rawContent: string): ParsedFrontmatter {
    return Logger.withTryCatchSync(() => {
      const trimmedContent = rawContent.trim();

      // Check if content starts with frontmatter delimiter
      if (!trimmedContent.startsWith("---")) {
        return {
          frontmatter: { ...DEFAULT_FRONTMATTER },
          content: rawContent,
          hasFrontmatter: false,
        };
      }

      // Find the closing delimiter
      const secondDelimiterIndex = trimmedContent.indexOf("\n---", 3);
      if (secondDelimiterIndex === -1) {
        return {
          frontmatter: { ...DEFAULT_FRONTMATTER },
          content: rawContent,
          hasFrontmatter: false,
        };
      }

      // Extract frontmatter and content
      const frontmatterText = trimmedContent
        .slice(3, secondDelimiterIndex)
        .trim();
      const content = trimmedContent.slice(secondDelimiterIndex + 4).trim();

      // Parse YAML frontmatter
      let frontmatterData: FrontmatterData;
      try {
        const parsed =
          (yaml.load(frontmatterText) as Record<string, any>) || {};
        frontmatterData = this.normalizeFrontmatter({
          ...DEFAULT_FRONTMATTER,
          ...parsed,
        });
      } catch (error) {
        Logger.warn(`Failed to parse frontmatter as YAML: ${error}`);
        return {
          frontmatter: { ...DEFAULT_FRONTMATTER },
          content: rawContent,
          hasFrontmatter: false,
        };
      }

      return {
        frontmatter: frontmatterData,
        content,
        hasFrontmatter: true,
      };
    }, "parsing frontmatter");
  }

  /**
   * Create frontmatter block from data
   */
  static create(frontmatter: FrontmatterData): string {
    try {
      const yamlString = yaml.dump(frontmatter, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });
      return `---\n${yamlString}---\n`;
    } catch (error) {
      Logger.error(`Failed to create frontmatter block: ${error}`);
      return "---\n---\n";
    }
  }

  /**
   * Normalize and validate frontmatter data
   */
  private static normalizeFrontmatter(
    data: Record<string, any>
  ): FrontmatterData {
    const normalized: FrontmatterData = { ...DEFAULT_FRONTMATTER };

    // Copy all fields from the parsed data
    Object.keys(data).forEach((key) => {
      normalized[key] = data[key];
    });

    // Normalize specific fields
    if (normalized.tags && !Array.isArray(normalized.tags)) {
      if (typeof normalized.tags === "string") {
        normalized.tags = (normalized.tags as string)
          .split(",")
          .map((tag: string) => tag.trim());
      } else {
        normalized.tags = [];
      }
    }

    if (normalized.date && typeof normalized.date !== "string") {
      normalized.date = String(normalized.date);
    }

    if (
      normalized.draft !== undefined &&
      typeof normalized.draft !== "boolean"
    ) {
      normalized.draft = Boolean(normalized.draft);
    }

    if (
      normalized.featured !== undefined &&
      typeof normalized.featured !== "boolean"
    ) {
      normalized.featured = Boolean(normalized.featured);
    }

    return normalized;
  }

  /**
   * Extract title from content if not present in frontmatter
   */
  static extractTitleFromContent(content: string): string | undefined {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : undefined;
  }

  /**
   * Extract date from content using various patterns
   */
  static extractDateFromContent(content: string): string | undefined {
    // Pattern 1: *Date: YYYY-MM-DD*
    const dateMatch1 = content.match(/^\*Date:\s*([0-9\-]+)\*/m);
    if (dateMatch1) return dateMatch1[1].trim();

    // Pattern 2: **Date:** YYYY-MM-DD
    const dateMatch2 = content.match(/^\*\*Date:\*\*\s*([0-9\-]+)/m);
    if (dateMatch2) return dateMatch2[1].trim();

    // Pattern 3: Date: YYYY-MM-DD (without emphasis)
    const dateMatch3 = content.match(/^Date:\s*([0-9\-]+)/m);
    if (dateMatch3) return dateMatch3[1].trim();

    return undefined;
  }

  /**
   * Validate frontmatter data
   */
  static validate(
    frontmatter: FrontmatterData,
    requiredFields: string[] = []
  ): boolean {
    return requiredFields.every((field) => {
      const value = frontmatter[field];
      return value !== undefined && value !== null && value !== "";
    });
  }

  /**
   * Merge multiple frontmatter objects
   */
  static merge(...frontmatters: FrontmatterData[]): FrontmatterData {
    return frontmatters.reduce(
      (merged, current) => ({ ...merged, ...current }),
      { ...DEFAULT_FRONTMATTER }
    );
  }
}

/**
 * Blog extraction and metadata processing
 */
export class BlogExtractor {
  private config: BlogExtractionConfig;

  constructor(config: BlogExtractionConfig = {}) {
    this.config = {
      fileGlob: "@blogs/*.md",
      validateFrontmatter: true,
      extractContentPreview: true,
      previewLength: 150,
      ...config,
    };
  }

  /**
   * Extract metadata from markdown content
   */
  extractMeta(content: string, filePath: string): BlogMeta {
    return Logger.withTryCatchSync(() => {
      // Parse frontmatter first
      const {
        frontmatter,
        content: markdownContent,
        hasFrontmatter,
      } = FrontmatterParser.parse(content);

      // Generate slug from filename
      const slug = this.generateSlug(filePath);

      // Extract title with fallback chain
      let title = frontmatter.title;
      if (!title) {
        title =
          FrontmatterParser.extractTitleFromContent(markdownContent) ||
          this.generateTitleFromSlug(slug) ||
          "Untitled";
      }

      // Extract date with fallback
      let date = frontmatter.date;
      if (!date) {
        date = FrontmatterParser.extractDateFromContent(markdownContent);
      }

      // Build the complete BlogMeta object
      const blogMeta: BlogMeta = {
        slug,
        title,
        date,
        author: frontmatter.author || this.config.defaultAuthor,
        tags: frontmatter.tags || [],
        category: frontmatter.category,
        description:
          frontmatter.description || this.generateDescription(markdownContent),
        location: frontmatter.location,
        featured: frontmatter.featured || false,
        draft: frontmatter.draft || false,
        filePath,
        hasFrontmatter,
      };

      // Include any additional custom frontmatter fields
      Object.keys(frontmatter).forEach((key) => {
        if (!(key in blogMeta)) {
          blogMeta[key] = frontmatter[key];
        }
      });

      return blogMeta;
    }, `extracting metadata for ${filePath}`);
  }

  /**
   * Generate slug from file path
   */
  private generateSlug(filePath: string): string {
    return filePath.split("/").pop()?.replace(/\.md$/, "") || "";
  }

  /**
   * Generate title from slug
   */
  private generateTitleFromSlug(slug: string): string {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Generate description from content
   */
  private generateDescription(content: string): string {
    if (!this.config.extractContentPreview) return "";

    // Remove markdown formatting and get first paragraph
    const plainText = content
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    return plainText.length > this.config.previewLength!
      ? plainText.substring(0, this.config.previewLength!) + "..."
      : plainText;
  }

  /**
   * Validate blog metadata
   */
  validateBlog(blog: BlogMeta): BlogValidationResult {
    const result: BlogValidationResult = {
      isValid: true,
      missingFields: [],
      errors: [],
      warnings: [],
    };

    // Check required fields
    BLOG_VALIDATION_SCHEMA.required.forEach((field) => {
      if (!blog[field as keyof BlogMeta]) {
        result.missingFields.push(field);
        result.errors.push(`Missing required field: ${field}`);
        result.isValid = false;
      }
    });

    // Validate location if present
    if (blog.location) {
      if (blog.location.coordinates) {
        const { lat, lng } = blog.location.coordinates;
        if (typeof lat !== "number" || typeof lng !== "number") {
          result.errors.push("Invalid location coordinates");
          result.isValid = false;
        }
        if (lat < -90 || lat > 90) {
          result.errors.push("Latitude must be between -90 and 90");
          result.isValid = false;
        }
        if (lng < -180 || lng > 180) {
          result.errors.push("Longitude must be between -180 and 180");
          result.isValid = false;
        }
      }
    }

    // Validate date format
    if (blog.date && !/^\d{4}-\d{2}-\d{2}$/.test(blog.date)) {
      result.warnings.push("Date should be in YYYY-MM-DD format");
    }

    // Check for empty tags
    if (blog.tags && blog.tags.some((tag) => !tag.trim())) {
      result.warnings.push("Empty tags found");
    }

    return result;
  }
}

/**
 * Main Blog Processor class
 */
export class BlogProcessor {
  private extractor: BlogExtractor;

  constructor(config: BlogExtractionConfig = {}) {
    this.extractor = new BlogExtractor(config);
  }

  /**
   * Get all blog metadata with filtering and sorting
   */
  async getAllBlogMeta(
    options: BlogProcessingOptions = {}
  ): Promise<BlogMeta[]> {
    return Logger.withTryCatch(async () => {
      const opts = { ...DEFAULT_BLOG_PROCESSING_OPTIONS, ...options };
      const blogMetaList: BlogMeta[] = [];

      // Process each blog file
      for (const [filePath, importFn] of Object.entries(blogFiles)) {
        try {
          const content = await importFn();
          const meta = this.extractor.extractMeta(content, filePath);

          // Skip drafts if not including them
          if (!opts.includeDrafts && meta.draft) {
            continue;
          }

          // Validate required fields if specified
          if (opts.requiredFields && opts.requiredFields.length > 0) {
            if (!FrontmatterParser.validate(meta, opts.requiredFields)) {
              Logger.warn(
                `Blog ${filePath} missing required fields: ${opts.requiredFields.join(
                  ", "
                )}`
              );
              continue;
            }
          }

          // Apply filters
          if (opts.filterBy && !this.passesFilter(meta, opts.filterBy)) {
            continue;
          }

          blogMetaList.push(meta);
        } catch (error) {
          Logger.error(`Failed to process blog file ${filePath}: ${error}`);
        }
      }

      // Sort the results
      return this.sortBlogs(blogMetaList, opts.sortBy, opts.sortOrder);
    }, "getting all blog metadata");
  }

  /**
   * Get a complete blog post by slug
   */
  async getBlogBySlug(
    slug: string,
    includeDrafts: boolean = false
  ): Promise<BlogPost | null> {
    return Logger.withTryCatch(async () => {
      // Find the matching file
      const filePath = Object.keys(blogFiles).find((path) => {
        const fileSlug = path.split("/").pop()?.replace(/\.md$/, "") || "";
        return fileSlug === slug;
      });

      if (!filePath) {
        return null;
      }

      const content = await blogFiles[filePath]();
      const meta = this.extractor.extractMeta(content, filePath);

      // Check if draft and if we should include drafts
      if (meta.draft && !includeDrafts) {
        return null;
      }

      // Parse the content to get the markdown without frontmatter
      const { content: markdownContent } = FrontmatterParser.parse(content);

      return {
        ...meta,
        content: markdownContent,
      };
    }, `getting blog by slug: ${slug}`);
  }

  /**
   * Search blogs with query parameters
   */
  async searchBlogs(query: BlogQuery): Promise<BlogSearchResult> {
    return Logger.withTryCatch(async () => {
      let blogs = await this.getAllBlogMeta({
        includeDrafts: query.includeDrafts || false,
        filterBy: {
          tags: query.tags,
          category: query.category,
          author: query.author,
          featured: query.featured,
        },
        sortBy: query.sortBy || "date",
        sortOrder: query.sortOrder || "desc",
      });

      // Apply text search if specified
      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        blogs = blogs.filter(
          (blog) =>
            blog.title.toLowerCase().includes(searchTerm) ||
            (blog.description &&
              blog.description.toLowerCase().includes(searchTerm)) ||
            (blog.tags &&
              blog.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
        );
      }

      const totalCount = blogs.length;
      const offset = query.offset || 0;
      const limit = query.limit || totalCount;

      // Apply pagination
      const paginatedBlogs = blogs.slice(offset, offset + limit);
      const hasMore = offset + limit < totalCount;

      return {
        blogs: paginatedBlogs,
        totalCount,
        hasMore,
        query,
      };
    }, "searching blogs");
  }

  /**
   * Get featured blogs
   */
  async getFeaturedBlogs(limit?: number): Promise<BlogMeta[]> {
    return Logger.withTryCatch(async () => {
      const blogs = await this.getAllBlogMeta({
        includeDrafts: false,
        filterBy: { featured: true },
        sortBy: "date",
        sortOrder: "desc",
      });

      return limit ? blogs.slice(0, limit) : blogs;
    }, "getting featured blogs");
  }

  /**
   * Get blogs by tag
   */
  async getBlogsByTag(
    tag: string,
    options: BlogProcessingOptions = {}
  ): Promise<BlogMeta[]> {
    return this.getAllBlogMeta({
      ...options,
      filterBy: {
        ...options.filterBy,
        tags: [tag],
      },
    });
  }

  /**
   * Get blogs by category
   */
  async getBlogsByCategory(
    category: string,
    options: BlogProcessingOptions = {}
  ): Promise<BlogMeta[]> {
    return this.getAllBlogMeta({
      ...options,
      filterBy: {
        ...options.filterBy,
        category,
      },
    });
  }

  /**
   * Get all unique tags with counts
   */
  async getTagsWithCounts(
    includeDrafts: boolean = false
  ): Promise<TagWithCount[]> {
    return Logger.withTryCatch(async () => {
      const blogs = await this.getAllBlogMeta({ includeDrafts });
      const tagCounts: Record<string, number> = {};

      blogs.forEach((blog) => {
        if (blog.tags) {
          blog.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    }, "getting tags with counts");
  }

  /**
   * Get all unique categories with counts
   */
  async getCategoriesWithCounts(
    includeDrafts: boolean = false
  ): Promise<CategoryWithCount[]> {
    return Logger.withTryCatch(async () => {
      const blogs = await this.getAllBlogMeta({ includeDrafts });
      const categoryCounts: Record<string, number> = {};

      blogs.forEach((blog) => {
        if (blog.category) {
          categoryCounts[blog.category] =
            (categoryCounts[blog.category] || 0) + 1;
        }
      });

      return Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    }, "getting categories with counts");
  }

  /**
   * Get all tags (simple list)
   */
  async getAllTags(includeDrafts: boolean = false): Promise<string[]> {
    const tagsWithCounts = await this.getTagsWithCounts(includeDrafts);
    return tagsWithCounts.map((t) => t.tag);
  }

  /**
   * Get all categories (simple list)
   */
  async getAllCategories(includeDrafts: boolean = false): Promise<string[]> {
    const categoriesWithCounts = await this.getCategoriesWithCounts(
      includeDrafts
    );
    return categoriesWithCounts.map((c) => c.category);
  }

  /**
   * Get comprehensive blog statistics
   */
  async getBlogStats(): Promise<BlogStats> {
    return Logger.withTryCatch(async () => {
      const allBlogs = await this.getAllBlogMeta({ includeDrafts: true });
      const publishedBlogs = allBlogs.filter((blog) => !blog.draft);
      const draftBlogs = allBlogs.filter((blog) => blog.draft);
      const featuredBlogs = allBlogs.filter((blog) => blog.featured);
      const blogsWithLocation = allBlogs.filter((blog) => blog.location);

      const tagsWithCounts = await this.getTagsWithCounts(true);
      const categoriesWithCounts = await this.getCategoriesWithCounts(true);

      // Posts by category
      const postsByCategory: Record<string, number> = {};
      categoriesWithCounts.forEach((cat) => {
        postsByCategory[cat.category] = cat.count;
      });

      // Posts by author
      const postsByAuthor: Record<string, number> = {};
      allBlogs.forEach((blog) => {
        if (blog.author) {
          postsByAuthor[blog.author] = (postsByAuthor[blog.author] || 0) + 1;
        }
      });

      // Recent posts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentPosts = allBlogs.filter((blog) => {
        if (!blog.date) return false;
        return new Date(blog.date) >= thirtyDaysAgo;
      }).length;

      return {
        totalPosts: allBlogs.length,
        publishedPosts: publishedBlogs.length,
        draftPosts: draftBlogs.length,
        featuredPosts: featuredBlogs.length,
        totalTags: tagsWithCounts.length,
        totalCategories: categoriesWithCounts.length,
        postsWithLocation: blogsWithLocation.length,
        postsByCategory,
        postsByAuthor,
        recentPosts,
      };
    }, "getting blog statistics");
  }

  /**
   * Get blog archive data grouped by year and month
   */
  async getBlogArchive(): Promise<BlogArchive[]> {
    return Logger.withTryCatch(async () => {
      const blogs = await this.getAllBlogMeta({
        includeDrafts: false,
        sortBy: "date",
        sortOrder: "desc",
      });

      const archiveMap: Record<number, BlogArchive> = {};

      blogs.forEach((blog) => {
        if (!blog.date) return;

        const date = new Date(blog.date);
        const year = date.getFullYear();
        const month = date.getMonth();

        if (!archiveMap[year]) {
          archiveMap[year] = {
            year,
            months: [],
            totalPosts: 0,
          };
        }

        let monthData = archiveMap[year].months.find((m) => m.month === month);
        if (!monthData) {
          monthData = {
            month,
            monthName: date.toLocaleString("default", { month: "long" }),
            posts: [],
            count: 0,
          };
          archiveMap[year].months.push(monthData);
        }

        monthData.posts.push(blog);
        monthData.count++;
        archiveMap[year].totalPosts++;
      });

      // Sort months within each year
      Object.values(archiveMap).forEach((yearData) => {
        yearData.months.sort((a, b) => b.month - a.month);
      });

      return Object.values(archiveMap).sort((a, b) => b.year - a.year);
    }, "getting blog archive");
  }

  /**
   * Get map pins from blogs with location data
   */
  async getBlogMapPins(): Promise<BlogMapPin[]> {
    return Logger.withTryCatch(async () => {
      const blogs = await this.getAllBlogMeta({ includeDrafts: false });

      return blogs.filter(hasCoordinates).map((blog) => ({
        id: blog.slug,
        title: blog.title,
        lat: blog.location.coordinates.lat,
        lng: blog.location.coordinates.lng,
        description: blog.description,
        tags: blog.tags,
        category: blog.category,
        blogUrl: `/blogs/${blog.slug}`,
        date: blog.date,
        featured: blog.featured,
        featuredPhoto: blog.featuredPhoto,
      }));
    }, "getting blog map pins");
  }

  /**
   * Check if a blog passes the specified filters
   */
  private passesFilter(blog: BlogMeta, filters: BlogFilterOptions): boolean {
    // Check tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!blog.tags || !filters.tags.some((tag) => blog.tags!.includes(tag))) {
        return false;
      }
    }

    // Check category filter
    if (filters.category && blog.category !== filters.category) {
      return false;
    }

    // Check featured filter
    if (filters.featured !== undefined && blog.featured !== filters.featured) {
      return false;
    }

    // Check author filter
    if (filters.author && blog.author !== filters.author) {
      return false;
    }

    // Check location filter
    if (filters.hasLocation !== undefined) {
      const hasLocation = Boolean(blog.location?.coordinates);
      if (hasLocation !== filters.hasLocation) {
        return false;
      }
    }

    // Check date range filter
    if (filters.dateRange && blog.date) {
      const blogDate = new Date(blog.date);
      if (
        filters.dateRange.start &&
        blogDate < new Date(filters.dateRange.start)
      ) {
        return false;
      }
      if (filters.dateRange.end && blogDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sort an array of blog metadata
   */
  private sortBlogs(
    blogs: BlogMeta[],
    sortBy: BlogProcessingOptions["sortBy"] = "date",
    order: BlogProcessingOptions["sortOrder"] = "desc"
  ): BlogMeta[] {
    return blogs.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          comparison = dateA - dateB;
          break;

        case "title":
          comparison = a.title.localeCompare(b.title);
          break;

        case "featured":
          const featuredA = a.featured ? 1 : 0;
          const featuredB = b.featured ? 1 : 0;
          comparison = featuredA - featuredB;
          break;

        case "author":
          const authorA = a.author || "";
          const authorB = b.author || "";
          comparison = authorA.localeCompare(authorB);
          break;

        case "category":
          const categoryA = a.category || "";
          const categoryB = b.category || "";
          comparison = categoryA.localeCompare(categoryB);
          break;

        default:
          comparison = 0;
      }

      return order === "desc" ? -comparison : comparison;
    });
  }
}

// Create default instance
const defaultBlogProcessor = new BlogProcessor();

// Export convenience functions that use the default instance
export const getAllBlogMeta = (options?: BlogProcessingOptions) =>
  defaultBlogProcessor.getAllBlogMeta(options);

export const getBlogBySlug = (slug: string, includeDrafts?: boolean) =>
  defaultBlogProcessor.getBlogBySlug(slug, includeDrafts);

export const searchBlogs = (query: BlogQuery) =>
  defaultBlogProcessor.searchBlogs(query);

export const getFeaturedBlogs = (limit?: number) =>
  defaultBlogProcessor.getFeaturedBlogs(limit);

export const getBlogsByTag = (tag: string, options?: BlogProcessingOptions) =>
  defaultBlogProcessor.getBlogsByTag(tag, options);

export const getBlogsByCategory = (
  category: string,
  options?: BlogProcessingOptions
) => defaultBlogProcessor.getBlogsByCategory(category, options);

export const getAllTags = (includeDrafts?: boolean) =>
  defaultBlogProcessor.getAllTags(includeDrafts);

export const getAllCategories = (includeDrafts?: boolean) =>
  defaultBlogProcessor.getAllCategories(includeDrafts);

export const getTagsWithCounts = (includeDrafts?: boolean) =>
  defaultBlogProcessor.getTagsWithCounts(includeDrafts);

export const getCategoriesWithCounts = (includeDrafts?: boolean) =>
  defaultBlogProcessor.getCategoriesWithCounts(includeDrafts);

export const getBlogStats = () => defaultBlogProcessor.getBlogStats();

export const getBlogArchive = () => defaultBlogProcessor.getBlogArchive();

export const getBlogMapPins = () => defaultBlogProcessor.getBlogMapPins();

// Export classes for advanced usage
// export { FrontmatterParser, BlogExtractor, BlogProcessor };

// Legacy compatibility exports
export const parseFrontmatter = FrontmatterParser.parse;
export const createFrontmatterBlock = FrontmatterParser.create;
export const validateFrontmatter = FrontmatterParser.validate;
export const mergeFrontmatter = FrontmatterParser.merge;
export const extractTitleFromContent =
  FrontmatterParser.extractTitleFromContent;
export const extractDateFromContent = FrontmatterParser.extractDateFromContent;
