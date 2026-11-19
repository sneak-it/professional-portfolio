/** A section note (content/portfolio.mdx) under the page; links underlined. */
export default function SectionNote({
  children,
}: {
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400 [&_a]:underline">
      {children}
    </div>
  );
}
