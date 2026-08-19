import type { ReactNode } from 'react';
import Container from '@/components/Container';

/**
 * Centered full-page message: a large gradient display string, a heading, a
 * muted paragraph, and a row of pill CTAs. Shared by app/not-found.tsx and
 * components/ErrorState.tsx. app/global-error.tsx stays a separate inline-style
 * copy because it renders without the app's CSS.
 */
export default function MessagePage({
  display,
  title,
  message,
  children,
}: {
  display: string;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <Container size="sm" className="text-center">
      <p className="gradient-text font-display font-bold text-6xl md:text-8xl">
        {display}
      </p>
      <h1 className="heading-legible mt-6 text-3xl md:text-4xl font-display font-bold tracking-tight">
        {title}
      </h1>
      <p className="heading-legible mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
        {message}
      </p>
      {children && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {children}
        </div>
      )}
    </Container>
  );
}
