# Lixi's Kitchen - Cooking Blog

A modern, beautiful cooking blog built with Next.js, featuring recipe posts stored locally and images hosted on Cloudflare R2.

## Features

✨ **Modern Design**
- Beautiful, responsive UI with a cooking/food theme
- Smooth animations and transitions
- Mobile-friendly navigation

🍳 **Recipe Management**
- MDX support for rich recipe content
- Local blog folder for storing recipe posts
- Recipe metadata (cook time, difficulty, servings, etc.)
- Category and tag filtering

📸 **Image Storage**
- Cloudflare R2 integration for image hosting
- Optimized image loading with Next.js Image component
- Support for cover images and in-content images

🎨 **Beautiful Components**
- Recipe cards with hover effects
- Responsive header and footer
- Custom styled blog content
- Smooth page transitions

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Content**: MDX (Markdown + JSX)
- **Image Storage**: Cloudflare R2
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Cloudflare account with R2 bucket set up (optional for images)

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd yanglixi-site
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Cloudflare R2 Configuration
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name

# Public URL for R2 bucket
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-custom-domain.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Adding New Recipes

### Creating a Recipe Post

1. Create a new `.mdx` file in the `blog/` folder
2. Add frontmatter metadata at the top:

```mdx
---
title: "Your Recipe Title"
date: "2024-01-15"
excerpt: "A short description of your recipe"
coverImage: "/images/your-image.jpg"
cookTime: "30 mins"
difficulty: "Easy"
servings: "4 servings"
category: "italian"
tags: ["Italian", "Pasta", "Quick"]
---

## Your Recipe Content

Write your recipe instructions here using Markdown!
```

### Frontmatter Fields

- `title` (required): Recipe title
- `date` (required): Publication date in YYYY-MM-DD format
- `excerpt` (required): Short description for recipe cards
- `coverImage` (required): Path to cover image
- `cookTime` (optional): Total cooking time
- `difficulty` (optional): Easy/Medium/Hard
- `servings` (optional): Number of servings
- `category` (optional): Recipe category for filtering
- `tags` (optional): Array of tags

## Image Management

### Using R2 for Images

1. Upload images to your R2 bucket in the `images/` folder
2. Reference them in your recipes using the path: `/images/your-image.jpg`
3. The app will automatically use your R2 public URL

### Using Local Images

1. Place images in the `public/images/` folder
2. Reference them the same way: `/images/your-image.jpg`

### Upload API

The project includes an upload API endpoint at `/api/upload` for programmatic image uploads:

```javascript
// Example usage
const formData = new FormData();
formData.append('file', yourFile);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

## Project Structure

```
yanglixi-site/
├── blog/                   # Recipe posts (MDX files)
├── components/            # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   └── RecipeCard.tsx
├── lib/                   # Utility functions
│   ├── blog.ts           # Blog post management
│   └── r2.ts             # R2 image handling
├── pages/                 # Next.js pages
│   ├── index.tsx         # Home page
│   ├── recipes.tsx       # All recipes page
│   ├── about.tsx         # About page
│   ├── blog/[slug].tsx   # Individual recipe page
│   └── api/              # API routes
├── public/               # Static files
│   └── images/          # Local images (if not using R2)
├── styles/              # CSS styles
│   └── globals.css      # Global styles with Tailwind
└── next.config.js       # Next.js configuration
```

## Customization

### Colors

Edit the color scheme in `tailwind.config.js`:

```javascript
colors: {
  primary: { /* Your primary colors */ },
  sage: { /* Your accent colors */ },
}
```

### Site Information

Update site details in:
- `components/Header.tsx` - Site name and logo
- `components/Footer.tsx` - Footer content and links
- `pages/about.tsx` - About page content

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Node.js:
- Netlify
- AWS
- DigitalOcean
- Your own server

## Build for Production

```bash
npm run build
npm start
```

## License

This project is open source and available for personal use.

## Support

For questions or issues, please open an issue on GitHub.

---

Made with 💚 and lots of delicious food!

