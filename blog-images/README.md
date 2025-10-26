# Blog Images Directory

This directory contains cover images for blog posts, organized by UUID.

## Naming Convention

- Cover images should be named: `{uuid}_cover.jpg`
- Where `{uuid}` is the UUID from the blog post's frontmatter

## Example

For a blog post with UUID `a1b2c3d4-e5f6-7890-abcd-ef1234567890`:
- Cover image: `a1b2c3d4-e5f6-7890-abcd-ef1234567890_cover.jpg`

## How it works

1. Each blog post has a `uuid` field in its frontmatter
2. The system automatically looks for `{uuid}_cover.jpg` in this directory
3. If found, it uses the image; if not, it shows a placeholder

## Adding new images

1. Get the UUID from your blog post's frontmatter
2. Name your image file: `{uuid}_cover.jpg`
3. Place it in this directory
4. The blog system will automatically detect and use it
