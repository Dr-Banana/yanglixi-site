# Deployment Guide

## Netlify Deployment

### 1. Build Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `out`
- **Node Version**: 18

### 2. Environment Variables
No environment variables required for static export.

### 3. Redirects
The site uses client-side routing with fallback redirects:
- All routes redirect to `/index.html` with 200 status
- This enables client-side routing for dynamic blog posts

### 4. Static Export Features
- ✅ Static HTML generation
- ✅ Image optimization disabled (for static export)
- ✅ Trailing slashes enabled
- ✅ Dynamic blog routes pre-generated

### 5. File Structure After Build
```
out/
├── index.html
├── about.html
├── contact.html
├── recipes.html
├── blog/
│   └── [slug].html (for each blog post)
├── _next/
└── static/
```

### 6. Troubleshooting
If you get 404 errors:
1. Check that `netlify.toml` is in the root directory
2. Verify build command is `npm run build`
3. Ensure publish directory is set to `out`
4. Check that all blog posts have valid slugs

### 7. Blog Post Requirements
Each blog post must:
- Have a valid slug (filename without extension)
- Include required frontmatter (title, date, excerpt)
- Be in `.mdx` or `.md` format
- Have a corresponding UUID for cover images
