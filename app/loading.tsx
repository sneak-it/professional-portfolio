export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-accent dark:border-white/20 dark:border-t-accent"
      />
    </div>
  );
}
