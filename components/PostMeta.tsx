import { Calendar, Clock, PencilLine } from 'lucide-react';
import TagList from '@/components/TagList';
import { formatDate } from '@/lib/date';

const ITEM =
  'flex items-center gap-1 text-sm font-mono text-gray-500 dark:text-gray-400';

/** The three meta items, exported so the article header can rearrange them. */
export function PostDate({ date }: { date: string }) {
  return (
    <span className={ITEM}>
      <Calendar size={14} /> <time dateTime={date}>{formatDate(date)}</time>
    </span>
  );
}

export function PostUpdated({ date }: { date: string }) {
  return (
    <span className={ITEM}>
      <PencilLine size={14} /> Updated{' '}
      <time dateTime={date}>{formatDate(date)}</time>
    </span>
  );
}

export function PostReadTime({ readTime }: { readTime: string }) {
  return (
    <span className={ITEM}>
      <Clock size={14} /> {readTime}
    </span>
  );
}

/**
 * The meta block on a blog list card: a date · read-time · updated row over the
 * tag chips. `maxTags` caps the chips, since the card wraps badly past three.
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <PostDate date={date} />
        {readTime && <PostReadTime readTime={readTime} />}
        {updated && <PostUpdated date={updated} />}
      </div>
      <TagList tags={tags} max={maxTags} link={linkTags} />
    </div>
  );
}
