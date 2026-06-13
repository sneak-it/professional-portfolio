export interface ProjectData {
  title: string;
  category: string;
  image: string;
  description: string;
  tech: string[];
  link: string;
  github: string;
  features: string[];
  challenges: string;
}

export interface ProjectSummary extends ProjectData {
  id: string;
}

/**
 * Single source of truth for projects — drives both the list page (cards +
 * category filter) and the per-project detail pages. Categories use one
 * shared vocabulary ('Web' | 'Mobile' | 'Design') across both views.
 */
export const projectsData: Record<string, ProjectData> = {
  '1': {
    title: 'E-Commerce Platform',
    category: 'Web',
    image: 'https://picsum.photos/seed/ecommerce/1200/800',
    description:
      'A full-featured e-commerce platform built with Next.js, Stripe, and Tailwind CSS.',
    tech: ['Next.js', 'TypeScript', 'Stripe', 'Tailwind'],
    link: '#',
    github: '#',
    features: [
      'Seamless checkout experience with Stripe integration',
      'Real-time inventory management',
      'User authentication and profile management',
      'Responsive design for all devices',
      'Admin dashboard with sales analytics',
    ],
    challenges:
      'One of the main challenges was implementing a robust state management solution for the shopping cart that persists across sessions while keeping the application highly performant.',
  },
  '2': {
    title: 'Fitness Tracker App',
    category: 'Mobile',
    image: 'https://picsum.photos/seed/fitness/1200/800',
    description:
      'A cross-platform mobile app for tracking workouts and nutrition.',
    tech: ['React Native', 'Firebase', 'Redux'],
    link: '#',
    github: '#',
    features: [
      'Custom workout plan creation',
      'Extensive food database for nutrition tracking',
      'Progress visualization with interactive charts',
      'Social features to connect with friends',
      'Offline support',
    ],
    challenges:
      'Ensuring smooth performance and animations on older devices while handling large amounts of data locally was a significant technical hurdle.',
  },
  '3': {
    title: 'Brand Identity',
    category: 'Design',
    image: 'https://picsum.photos/seed/brand/1200/800',
    description:
      'Complete brand identity design for a sustainable tech startup.',
    tech: ['Figma', 'Illustrator', 'Photoshop'],
    link: '#',
    github: '#',
    features: [
      'Logo suite with responsive marks',
      'Color palette and typography system',
      'Comprehensive brand guidelines document',
      'Print and digital collateral templates',
    ],
    challenges:
      'Distilling a broad sustainability mission into a single cohesive visual language that scaled cleanly from a favicon to large-format print.',
  },
  '4': {
    title: 'AI Content Generator',
    category: 'Web',
    image: 'https://picsum.photos/seed/ai/1200/800',
    description:
      'A web app that uses the OpenAI API to generate marketing copy and blog posts.',
    tech: ['React', 'Node.js', 'OpenAI API'],
    link: '#',
    github: '#',
    features: [
      'Streaming responses for instant feedback',
      'Reusable prompt templates by content type',
      'Tone and length controls',
      'History and export to Markdown',
    ],
    challenges:
      'Managing API rate limits and token costs while keeping the editing experience responsive required careful request batching and caching.',
  },
  '5': {
    title: 'Task Management Tool',
    category: 'Web',
    image: 'https://picsum.photos/seed/task/1200/800',
    description: 'A collaborative task management tool with real-time updates.',
    tech: ['Vue.js', 'Socket.io', 'Express'],
    link: '#',
    github: '#',
    features: [
      'Real-time collaboration across team members',
      'Drag-and-drop boards and lists',
      'Assignments, due dates, and labels',
      'Activity feed and notifications',
    ],
    challenges:
      'Keeping multiple clients in sync without conflicts meant designing an optimistic update model with server-side reconciliation.',
  },
  '6': {
    title: 'Weather Dashboard',
    category: 'Web',
    image: 'https://picsum.photos/seed/weather/1200/800',
    description:
      'A beautiful weather dashboard with interactive maps and charts.',
    tech: ['Next.js', 'D3.js', 'Weather API'],
    link: '#',
    github: '#',
    features: [
      'Interactive radar maps',
      'Hourly and 7-day forecasts',
      'Historical trend charts with D3',
      'Location search and saved favorites',
    ],
    challenges:
      'Rendering large time-series datasets with D3 while keeping interactions smooth required virtualization and memoized scales.',
  },
};

export function getAllProjects(): ProjectSummary[] {
  return Object.entries(projectsData).map(([id, project]) => ({
    id,
    ...project,
  }));
}

/** Filter options for the projects page: 'All' plus each distinct category. */
export function getProjectCategories(): string[] {
  return [
    'All',
    ...Array.from(new Set(Object.values(projectsData).map((p) => p.category))),
  ];
}

export function getProjectById(id: string): ProjectData | null {
  return projectsData[id] ?? null;
}

export function getProjectIds(): string[] {
  return Object.keys(projectsData);
}
