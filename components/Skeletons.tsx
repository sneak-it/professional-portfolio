/*
 * Skeleton placeholders shown via Suspense (the loading.tsx route files) while
 * a route streams. `animate-pulse` is neutralized for reduced-motion users by
 * the global backstop in globals.css.
 */

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/80 dark:bg-white/10 ${className}`}
    />
  );
}

export function BlogListSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-16">
        <Skeleton className="h-12 w-48 mx-auto mb-4" />
        <Skeleton className="h-5 w-full max-w-xl mx-auto" />
      </div>
      <div className="space-y-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row gap-8 items-start card-surface p-6"
          >
            <Skeleton className="w-full md:w-2/5 aspect-video md:aspect-square lg:aspect-[4/3] shrink-0 rounded-2xl" />
            <div className="flex flex-col flex-grow gap-4 w-full py-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
