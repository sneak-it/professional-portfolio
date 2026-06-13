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

export const projectsData: Record<string, ProjectData> = {
  '1': {
    title: 'E-Commerce Platform',
    category: 'Web Development',
    image: 'https://picsum.photos/seed/ecommerce/1200/800',
    description:
      'A full-featured e-commerce platform built with Next.js, Stripe, and Tailwind CSS. It includes a complete shopping cart, user authentication, and a custom admin dashboard for managing products and orders.',
    tech: [
      'Next.js',
      'TypeScript',
      'Stripe',
      'Tailwind CSS',
      'Prisma',
      'PostgreSQL',
    ],
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
    category: 'Mobile App',
    image: 'https://picsum.photos/seed/fitness/1200/800',
    description:
      'A cross-platform mobile app for tracking workouts and nutrition. Users can create custom workout plans, log their meals, and visualize their progress over time.',
    tech: ['React Native', 'Firebase', 'Redux', 'Styled Components'],
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
};

export function getProjectById(id: string): ProjectData | null {
  return projectsData[id] ?? null;
}

export function getProjectIds(): string[] {
  return Object.keys(projectsData);
}
