import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MessagePage from '@/components/MessagePage';
import { getNotFound } from '@/lib/not-found';

export default function NotFound() {
  const { title, message } = getNotFound();
  return (
    <MessagePage display="404" title={title} message={message}>
      <Link href="/" className="pill-solid">
        <ArrowLeft size={18} />
        Back home
      </Link>
    </MessagePage>
  );
}
