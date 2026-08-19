import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/lib/date';

/**
 * The category · date · read-time meta row shown above a blog post, on both the
 * list card and the article header. `readTime` is optional — a post without one
 * simply omits the clock rather than rendering a dangling icon.
 */
export default function PostMeta({
  category,
  date,
  readTime,
  className = '',
}: {
  category?: string;
  date: string;
  readTime?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 text-sm font-mono text-gray-500 dark:text-gray-400 ${className}`}
    >
      {category && (
        <span className="text-accent font-medium font-mono uppercase tracking-wider">
          {category}
        </span>
      )}
      <span className="flex items-center gap-1">
        <Calendar size={14} /> <time dateTime={date}>{formatDate(date)}</time>
      </span>
      {readTime && (
        <span className="flex items-center gap-1">
          <Clock size={14} /> {readTime}
        </span>
      )}
    </div>
  );
}
