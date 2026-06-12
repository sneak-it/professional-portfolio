# Professional Portfolio

A modern, highly polished personal portfolio website built with Next.js 16, Tailwind CSS, and Motion.

## Features

- **Next.js 16 App Router**: Leveraging the latest React features and server components.
- **Tailwind CSS**: Utility-first styling for rapid UI development.
- **Motion**: Smooth page transitions, scroll reveals, and parallax effects.
- **MDX Blog**: Write blog posts using Markdown and React components.
- **Dynamic Galleries**: Automatically generated photo galleries with a masonry layout and lightbox.
- **Fully Responsive**: Optimized for all screen sizes.
- **Dark Mode Support**: Seamlessly adapts to user system preferences.
- **Docker Ready**: Includes a multi-stage Dockerfile and docker-compose configuration for easy deployment.

## Getting Started

### Prerequisites

- Node.js 24.x or later
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Content Management

### Adding a Blog Post

1. Create a new `.mdx` file in `content/blog/`.
2. Add the required frontmatter:
   ```mdx
   ---
   title: "Your Post Title"
   date: "YYYY-MM-DD"
   excerpt: "A short summary."
   image: "/path/to/image.jpg"
   category: "Category"
   readTime: "X min read"
   ---
   ```
3. Write your content below using Markdown.

### Adding a Gallery

1. Create a new `.mdx` file in `content/galleries/` (e.g., `my-trip.mdx`).
2. Add the frontmatter:
   ```mdx
   ---
   title: "My Trip"
   description: "Gallery description."
   date: "YYYY-MM-DD"
   coverImage: "/galleries/my-trip/cover.jpg"
   ---
   ```
3. Create a folder in `public/galleries/` with the exact same name as your `.mdx` file (e.g., `public/galleries/my-trip/`).
4. Drop your images inside that folder. They will be automatically processed and displayed in a masonry layout.

## Docker Deployment

This project is configured for standalone output, making Docker deployments extremely lightweight.

### Using Docker Compose

1. Build and start the container:
   ```bash
   docker-compose up -d --build
   ```
2. The app will be available at `http://localhost:3000`.

### Building Manually

```bash
docker build -t portfolio-app .
docker run -p 3000:3000 portfolio-app
```

## License

AGPLv3
