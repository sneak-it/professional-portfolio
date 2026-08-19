import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundCanvas from '@/components/BackgroundCanvas';
import MotionProvider from '@/components/MotionProvider';
import { ThemeProvider } from 'next-themes';
import JsonLd from '@/components/JsonLd';
import ViewTransitions from '@/components/ViewTransitions';
import { siteConfig } from '@/lib/site';

// One characterful neo-grotesque carries both body and display: a single
// variable-font instance covers every weight we use (incl. the display
// 600/700/800), so --font-display maps to this same instance in globals.css
// @theme instead of fetching the family a second time. A monospace handles
// small-caps labels / meta / numbers.
const grotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    // Per-route titles inherit this template: "About | Professional Portfolio".
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: siteConfig.author,
  url: siteConfig.url,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased bg-background text-gray-900 dark:text-gray-100 flex flex-col min-h-screen"
        suppressHydrationWarning
      >
        <JsonLd data={personJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            {/* Suspense: ViewTransitions reads useSearchParams (keeps static
                pages static). Renders null, so no visible fallback. */}
            <Suspense fallback={null}>
              <ViewTransitions />
            </Suspense>
            <BackgroundCanvas />
            <Navbar monogram={siteConfig.monogram} />
            <main id="main-content" className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
