/** Resume content — single source for the experience + education timelines. */

export interface TimelineEntry {
  id: number;
  title: string;
  subtitle: string;
  period: string;
  description?: string;
}

export const experience: TimelineEntry[] = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    subtitle: 'Tech Innovators Inc.',
    period: '2021 - Present',
    description:
      'Lead the frontend development team in building a scalable SaaS platform using Next.js and React. Improved performance by 40% and established design system guidelines.',
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    subtitle: 'Digital Solutions Agency',
    period: '2018 - 2021',
    description:
      'Developed and maintained multiple client projects using React, Node.js, and PostgreSQL. Mentored junior developers and implemented CI/CD pipelines.',
  },
  {
    id: 3,
    title: 'Web Developer',
    subtitle: 'Creative Studio',
    period: '2016 - 2018',
    description:
      'Created interactive marketing websites and landing pages using HTML, CSS, JavaScript, and GSAP for animations.',
  },
];

export const education: TimelineEntry[] = [
  {
    id: 1,
    title: 'Master of Science in Computer Science',
    subtitle: 'Tech University',
    period: '2014 - 2016',
  },
  {
    id: 2,
    title: 'Bachelor of Science in Software Engineering',
    subtitle: 'State College',
    period: '2010 - 2014',
  },
];
