import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MessagePage from '@/components/MessagePage';

export default function NotFound() {
  return (
    <MessagePage
      display="404"
      title="These aren't the droids you're looking for."
      message="The page you're looking for doesn't exist or may have been moved."
    >
      <Link href="/" className="pill-solid">
        <ArrowLeft size={18} />
        Back home
      </Link>
    </MessagePage>
  );
}
