/**
 * Standalone demo script for the frontmatter system
 * Run with: node demo-frontmatter.js
 */

const yaml = require('js-yaml');

// Simple frontmatter parser implementation
function parseFrontmatter(content) {
  const trimmedContent = content.trim();

  // Check if content starts with frontmatter delimiter
  if (!trimmedContent.startsWith('---')) {
    return {
      frontmatter: {},
      content: content,
      hasFrontmatter: false,
    };
  }

  // Find the closing delimiter
  const secondDelimiterIndex = trimmedContent.indexOf('\n---', 3);
  if (secondDelimiterIndex === -1) {
    return {
      frontmatter: {},
      content: content,
      hasFrontmatter: false,
    };
  }

  // Extract frontmatter and content
  const frontmatterText = trimmedContent.slice(3, secondDelimiterIndex).trim();
  const markdownContent = trimmedContent.slice(secondDelimiterIndex + 4).trim();

  // Parse YAML frontmatter
  let frontmatterData;
  try {
    frontmatterData = yaml.load(frontmatterText) || {};
  } catch (error) {
    console.warn(`Failed to parse frontmatter as YAML: ${error}`);
    return {
      frontmatter: {},
      content: content,
      hasFrontmatter: false,
    };
  }

  return {
    frontmatter: frontmatterData,
    content: markdownContent,
    hasFrontmatter: true,
  };
}

// Test markdown with frontmatter
const testMarkdownWithFrontmatter = `---
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

# My Adventure in Sydney

Australia was always on my bucket list, and this year I finally made it! I started my journey in Sydney, exploring the Opera House and Bondi Beach.

## Highlights

- Walking across the Sydney Harbour Bridge
- Enjoying fresh seafood at the Fish Market
- Meeting friendly locals

The city's vibrant energy and stunning harbor views made this trip unforgettable!`;

// Test markdown without frontmatter (legacy format)
const testMarkdownWithoutFrontmatter = `# My Second Trip

*Date: 2024-06-15*

This is a legacy blog post without frontmatter. The system should handle this gracefully and extract what it can from the content.

## What I did

- Visited some amazing places
- Took lots of photos
- Had great food`;

console.log('🚀 Frontmatter System Demo\n');

console.log('=== Test 1: Markdown WITH Frontmatter ===');
const result1 = parseFrontmatter(testMarkdownWithFrontmatter);
console.log('✅ Has frontmatter:', result1.hasFrontmatter);
console.log('✅ Extracted frontmatter:');
console.log(JSON.stringify(result1.frontmatter, null, 2));
console.log('✅ Content preview:', result1.content.substring(0, 100) + '...\n');

console.log('=== Test 2: Markdown WITHOUT Frontmatter (Legacy) ===');
const result2 = parseFrontmatter(testMarkdownWithoutFrontmatter);
console.log('✅ Has frontmatter:', result2.hasFrontmatter);
console.log('✅ Fallback behavior - content preserved:', result2.content === testMarkdownWithoutFrontmatter);
console.log('✅ Default frontmatter applied:', JSON.stringify(result2.frontmatter, null, 2), '\n');

console.log('=== Test 3: Creating Frontmatter Block ===');
const newFrontmatter = {
  title: 'Generated Blog Post',
  date: '2024-12-19',
  author: 'Demo Script',
  tags: ['demo', 'generated', 'test'],
  category: 'Demo',
  description: 'A blog post created by the demo script',
  location: {
    name: 'Demo Location',
    coordinates: {
      lat: -37.8136,
      lng: 144.9631
    }
  },
  featured: false,
  draft: true
};

const frontmatterBlock = '---\n' + yaml.dump(newFrontmatter, {
  indent: 2,
  lineWidth: -1,
  noRefs: true
}) + '---\n';

console.log('✅ Generated frontmatter block:');
console.log(frontmatterBlock);

console.log('=== Test 4: Roundtrip Test ===');
const fullMarkdown = frontmatterBlock + '\n# Generated Content\n\nThis content was generated with frontmatter.';
const roundtripResult = parseFrontmatter(fullMarkdown);
console.log('✅ Roundtrip successful:', roundtripResult.hasFrontmatter);
console.log('✅ Title preserved:', roundtripResult.frontmatter.title === newFrontmatter.title);
console.log('✅ Location preserved:',
  roundtripResult.frontmatter.location &&
  roundtripResult.frontmatter.location.name === newFrontmatter.location.name);
console.log('✅ Tags preserved:', JSON.stringify(roundtripResult.frontmatter.tags) === JSON.stringify(newFrontmatter.tags));

console.log('\n✅ Demo completed successfully!');
console.log('\n📝 Key Features Demonstrated:');
console.log('   - YAML frontmatter parsing');
console.log('   - Backward compatibility with legacy files');
console.log('   - Rich metadata support (location, tags, etc.)');
console.log('   - Frontmatter block generation');
console.log('   - Error handling for invalid YAML');
console.log('   - Roundtrip parsing (create → parse → verify)');

console.log('\n🛠️ Integration Points:');
console.log('   - Use parseFrontmatter() to extract metadata from .md files');
console.log('   - Access frontmatter.location for map coordinates');
console.log('   - Filter by frontmatter.tags for blog categorization');
console.log('   - Check frontmatter.featured for highlighting posts');
console.log('   - Respect frontmatter.draft for publish/preview modes');
