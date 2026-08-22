import { Calendar, Clock, PencilLine } from 'lucide-react';
import TagList from '@/components/TagList';
import { formatDate } from '@/lib/date';

/**
 * The meta block above a blog post, on the list card and the article header: a
 * date · read-time · updated row over the tag chips. `maxTags` caps the chips
 * on the card; the article header shows all of them.
 */
export default function PostMeta({
  tags = [],
  maxTags,
  linkTags = false,
  date,
  readTime,
  updated,
  className = '',
}: {
  tags?: string[];
  maxTags?: number;
  linkTags?: boolean;
  date: string;
  readTime?: string;
  updated?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-mono text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Calendar size={14} /> <time dateTime={date}>{formatDate(date)}</time>
        </span>
        {readTime && (
          <span className="flex items-center gap-1">
            <Clock size={14} /> {readTime}
          </span>
        )}
        {updated && (
          <span className="flex items-center gap-1">
            <PencilLine size={14} /> Updated{' '}
            <time dateTime={updated}>{formatDate(updated)}</time>
          </span>
        )}
      </div>
      <TagList tags={tags} max={maxTags} link={linkTags} />
    </div>
  );
}
