import { Calendar, Clock, PencilLine } from 'lucide-react';
import { formatDate } from '@/lib/date';

const ITEM =
  'flex items-center gap-1 text-sm font-mono text-gray-500 dark:text-gray-400';

function PostDate({ date }: { date: string }) {
  return (
    <span className={ITEM}>
      <Calendar size={14} /> <time dateTime={date}>{formatDate(date)}</time>
    </span>
  );
}

function PostUpdated({ date }: { date: string }) {
  return (
    <span className={ITEM}>
      <PencilLine size={14} /> Updated{' '}
      <time dateTime={date}>{formatDate(date)}</time>
    </span>
  );
}

function PostReadTime({ readTime }: { readTime: string }) {
  return (
    <span className={ITEM}>
      <Clock size={14} /> {readTime}
    </span>
  );
}

/** The date · read-time · updated row, for blog list cards and the post header. */
export default function PostMeta({
  date,
  readTime,
  updated,
  className = '',
}: {
  date: string;
  readTime?: string;
  updated?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      <PostDate date={date} />
      {readTime && <PostReadTime readTime={readTime} />}
      {updated && <PostUpdated date={updated} />}
    </div>
  );
}
