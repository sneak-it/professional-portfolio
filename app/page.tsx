import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Typewriter from './Typewriter';
import { CachedMDX } from '@/components/MDXComponents';
import { getHome } from '@/lib/home';
import styles from './page.module.css';

// Per request so metadataBase / OG URL / Person JSON-LD resolve against the
// runtime SITE_URL instead of freezing the build-time origin into the prerender.
export const dynamic = 'force-dynamic';

// Server component: the hero paints immediately, with CSS-only entrances
// (page.module.css) that need no JS. The typewriter is the one client island.
export default function Home() {
  const { eyebrow, headline, words, content } = getHome();

  return (
    <>
      {/* Backdrop comes from components/BackgroundCanvas.tsx, site-wide. */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Readability vignette, wherever the animated background lands. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,var(--background-deep)_0%,transparent_70%)] opacity-70 dark:opacity-80"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={styles.enter}>
            <p
              className={`${styles.eyebrow} text-sm md:text-base font-semibold tracking-widest text-accent uppercase font-mono mb-4`}
            >
              {eyebrow}
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter mb-6 flex flex-wrap justify-center gap-x-4">
              <span className={`${styles.word} inline-block`}>{headline}</span>
              <div className="w-full h-0" />
              <span
                className={`${styles.word} ${styles.word2} text-transparent bg-clip-text bg-gradient-to-r from-accent-from via-accent-via to-accent-to inline-block`}
              >
                <Typewriter words={words} />
                <span
                  aria-hidden
                  className={`${styles.cursor} inline-block w-[4px] h-[0.9em] bg-accent ml-2 align-middle -mt-2`}
                />
              </span>
            </h1>
            <div
              className={`${styles.surface} surface mt-4 max-w-2xl mx-auto mb-10 p-6`}
            >
              <div className="text-xl text-gray-800 dark:text-gray-200 font-medium">
                <CachedMDX source={content} />
              </div>
            </div>

            <div
              className={`${styles.cta} flex flex-col sm:flex-row items-center justify-center gap-4`}
            >
              <div className="inline-block">
                <Link
                  href="/portfolio"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black dark:bg-white dark:text-black rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-4px_var(--accent)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    View Portfolio{' '}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-accent-from to-accent-via transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                </Link>
              </div>
              <div className="inline-block">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black dark:text-white border border-gray-200 dark:border-white/20 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Contact Me
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
