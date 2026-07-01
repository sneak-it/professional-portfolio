/**
 * Dashed-border placeholder shown when a section/gallery has no content yet.
 */
export default function EmptyState({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 py-20 text-center text-gray-500 dark:text-gray-400">
      {children}
    </div>
  );
}
