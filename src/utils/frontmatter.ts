/**
 * Frontmatter utilities - Re-exports from BlogProcessor for backward compatibility
 * All frontmatter functionality has been moved to the consolidated BlogProcessor
 */

import {
  FrontmatterParser,
  type FrontmatterData,
  type ParsedFrontmatter,
} from "./blogProcessor";

// Re-export types for backward compatibility
export type { FrontmatterData, ParsedFrontmatter };

// Re-export functions with original names for backward compatibility
export const parseFrontmatter = FrontmatterParser.parse;
export const createFrontmatterBlock = FrontmatterParser.create;
export const validateFrontmatter = FrontmatterParser.validate;
export const mergeFrontmatter = FrontmatterParser.merge;
export const extractTitleFromContent =
  FrontmatterParser.extractTitleFromContent;
export const extractDateFromContent = FrontmatterParser.extractDateFromContent;

// Export the class for advanced usage
export { FrontmatterParser };
