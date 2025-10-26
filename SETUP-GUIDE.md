# Setup Guide - Lixi's Kitchen

Welcome! This guide will help you get your cooking blog up and running.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Recipe Images

The sample recipes reference these images:
- `/images/tomato-egg.jpg` - For Chinese Tomato and Egg Stir-Fry
- `/images/mushroom-pasta.jpg` - For Creamy Garlic Mushroom Pasta
- `/images/honey-salmon.jpg` - For Honey Garlic Glazed Salmon

**Option A: Use Your Own Images**
- Place your recipe photos in `public/images/`
- Name them as listed above, or update the `coverImage` field in each blog post

**Option B: Use Placeholder Images (for testing)**
- The site will work without images, but you'll see broken image icons
- You can add images later

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your blog!

## Setting Up Cloudflare R2 (Optional)

If you want to store images in the cloud instead of locally:

### Step 1: Create an R2 Bucket

1. Log into your Cloudflare dashboard
2. Go to R2 Object Storage
3. Create a new bucket (e.g., "cooking-blog-images")

### Step 2: Get API Credentials

1. In R2 settings, create an API token
2. Save your Access Key ID and Secret Access Key

### Step 3: Set Up Public Access (Optional)

1. In your bucket settings, enable public access
2. Set up a custom domain or use the R2.dev subdomain

### Step 4: Configure Environment Variables

Copy the `.env.local` file from `.env.local` (if it exists) or create a new one:

```bash
# .env.local
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=cooking-blog-images
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-custom-domain.com
```

### Step 5: Upload Images to R2

You can upload images through:
- Cloudflare dashboard (drag and drop)
- The `/api/upload` endpoint (programmatic)
- AWS CLI or other S3-compatible tools

## Customization Tips

### Change Site Name and Branding

Edit `components/Header.tsx`:
```tsx
<span className="text-2xl font-serif font-bold text-primary-600">
  Your Kitchen Name
</span>
```

### Update About Page

Edit `pages/about.tsx` to tell your story!

### Modify Color Scheme

Edit `tailwind.config.js` to change the primary colors:
```javascript
colors: {
  primary: {
    // Your preferred color palette
  }
}
```

## Adding Your First Recipe

1. Create a new file in `blog/` folder: `my-first-recipe.mdx`

2. Add this template:

```mdx
---
title: "My First Recipe"
date: "2024-01-20"
excerpt: "A delicious dish I love to make"
coverImage: "/images/my-recipe.jpg"
cookTime: "30 mins"
difficulty: "Easy"
servings: "2-4 servings"
category: "main-course"
tags: ["Easy", "Quick", "Delicious"]
---

## Introduction

Why I love this recipe...

## Ingredients

- 2 cups flour
- 1 cup sugar
- ...

## Instructions

### Step 1

Do this...

### Step 2

Then do that...

## Tips

My secret tips!
```

3. Add your recipe image to `public/images/my-recipe.jpg`

4. Restart the dev server to see your new recipe!

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and import your repository
4. Add environment variables in the Vercel dashboard
5. Deploy!

Vercel offers:
- ✅ Free hosting
- ✅ Automatic deployments
- ✅ SSL certificates
- ✅ Global CDN

### Alternative Deployment Options

- **Netlify**: Similar to Vercel, great for static sites
- **AWS Amplify**: If you prefer AWS ecosystem
- **DigitalOcean**: For more control with droplets
- **Your own server**: Using `npm run build` and `npm start`

## Troubleshooting

### Images Not Showing

- Check that images exist in `public/images/`
- Verify the path matches exactly (case-sensitive!)
- For R2, ensure your public URL is configured correctly

### Build Errors

- Make sure all dependencies are installed: `npm install`
- Check that all required fields in frontmatter are present
- Verify your `.env.local` file has correct syntax

### Styling Issues

- Clear your browser cache
- Try `npm run dev` again
- Check that Tailwind CSS is configured correctly

## Need Help?

- Check the main [README.md](./README.md) for more details
- Review the sample blog posts for examples
- Open an issue on GitHub if you encounter problems

---

Happy cooking and blogging! 👩‍🍳✨

