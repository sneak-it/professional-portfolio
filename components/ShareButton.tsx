'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const share = (
      navigator as {
        share?: (data: { title: string; url: string }) => Promise<void>;
      }
    ).share;
    if (share) {
      try {
        await share.call(navigator, { title, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    } catch {
      // Clipboard unavailable — nothing more we can do gracefully.
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
      {copied && (
        <span className="text-sm text-gray-500" aria-hidden="true">
          Copied
        </span>
      )}
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share this post"
        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
      >
        {copied ? <Check size={18} /> : <Share2 size={18} />}
      </button>
    </div>
  );
}
